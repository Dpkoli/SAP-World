import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { Pool, type PoolClient } from "pg";

type StoreOptions<T> = {
  key: string;
  fileName: string;
  empty: () => T;
  validate: (value: unknown) => value is T;
};

const dataDirectory = path.join(process.cwd(), ".data");
const writeQueues = new Map<string, Promise<void>>();
let pool: Pool | null = null;
let schemaPromise: Promise<void> | null = null;

function usesPostgres() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function secureConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  if (["prefer", "require", "verify-ca"].includes(sslMode ?? "")) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

export function isPostgresConfigured() {
  return usesPostgres();
}

function getPool() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PostgreSQL storage.");
  }
  pool ??= new Pool({
    connectionString: secureConnectionString(connectionString),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    application_name: "sap-world",
  });
  return pool;
}

export async function withPostgresClient<T>(
  operation: (client: PoolClient) => Promise<T>,
) {
  const client = await getPool().connect();
  try {
    return await operation(client);
  } finally {
    client.release();
  }
}

async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const database = getPool();
      await database.query(`
        CREATE TABLE IF NOT EXISTS sap_world_state (
          store_key TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          revision BIGINT NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await database.query(`
        CREATE INDEX IF NOT EXISTS sap_world_state_updated_at_idx
        ON sap_world_state (updated_at DESC)
      `);
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

async function readJsonFile<T>(
  filePath: string,
  empty: () => T,
  validate: (value: unknown) => value is T,
) {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    return validate(parsed) ? parsed : empty();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return empty();
    }
    throw error;
  }
}

async function writeJsonFile<T>(
  filePath: string,
  temporaryPath: string,
  value: T,
) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

async function lockStore(
  client: PoolClient,
  storeKey: string,
) {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext($1))",
    [storeKey],
  );
}

export function createDurableStore<T>(options: StoreOptions<T>) {
  const filePath = path.join(dataDirectory, options.fileName);
  const temporaryPath = path.join(
    dataDirectory,
    `${options.fileName}.tmp`,
  );

  async function readFileStore() {
    return readJsonFile(
      filePath,
      options.empty,
      options.validate,
    );
  }

  async function readPostgresStore() {
    await ensureSchema();
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await lockStore(client, options.key);
      const existing = await client.query<{ payload: unknown }>(
        "SELECT payload FROM sap_world_state WHERE store_key = $1",
        [options.key],
      );
      if (existing.rows[0]) {
        await client.query("COMMIT");
        return options.validate(existing.rows[0].payload)
          ? existing.rows[0].payload
          : options.empty();
      }

      const localValue = await readFileStore();
      await client.query(
        `INSERT INTO sap_world_state (store_key, payload, revision)
         VALUES ($1, $2::jsonb, 1)`,
        [options.key, JSON.stringify(localValue)],
      );
      await client.query("COMMIT");
      return localValue;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async function updateFileStore<R>(
    update: (value: T) => Promise<R> | R,
  ) {
    let result!: R;
    const previous = writeQueues.get(options.key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(async () => {
      const value = await readFileStore();
      result = await update(value);
      await writeJsonFile(filePath, temporaryPath, value);
    });
    writeQueues.set(options.key, next);
    try {
      await next;
    } finally {
      if (writeQueues.get(options.key) === next) {
        writeQueues.delete(options.key);
      }
    }
    return result;
  }

  async function updatePostgresStore<R>(
    update: (value: T) => Promise<R> | R,
  ) {
    await ensureSchema();
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await lockStore(client, options.key);
      const existing = await client.query<{ payload: unknown }>(
        "SELECT payload FROM sap_world_state WHERE store_key = $1 FOR UPDATE",
        [options.key],
      );
      const value =
        existing.rows[0] && options.validate(existing.rows[0].payload)
          ? structuredClone(existing.rows[0].payload)
          : await readFileStore();
      const result = await update(value);
      if (existing.rows[0]) {
        await client.query(
          `UPDATE sap_world_state
           SET payload = $2::jsonb, revision = revision + 1, updated_at = NOW()
           WHERE store_key = $1`,
          [options.key, JSON.stringify(value)],
        );
      } else {
        await client.query(
          `INSERT INTO sap_world_state (store_key, payload, revision)
           VALUES ($1, $2::jsonb, 1)`,
          [options.key, JSON.stringify(value)],
        );
      }
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    backend: () => (usesPostgres() ? "postgresql" : "local-file") as
      | "postgresql"
      | "local-file",
    read: () => (usesPostgres() ? readPostgresStore() : readFileStore()),
    update: <R>(update: (value: T) => Promise<R> | R) =>
      usesPostgres()
        ? updatePostgresStore(update)
        : updateFileStore(update),
  };
}

export async function getStorageHealth() {
  if (!usesPostgres()) {
    return {
      backend: "local-file" as const,
      durable: false,
      configured: true,
    };
  }

  await ensureSchema();
  const result = await getPool().query<{ checked_at: Date }>(
    "SELECT NOW() AS checked_at",
  );
  return {
    backend: "postgresql" as const,
    durable: true,
    configured: true,
    checkedAt: result.rows[0].checked_at.toISOString(),
  };
}
