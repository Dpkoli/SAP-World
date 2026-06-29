import "server-only";

import type { PoolClient } from "pg";

import type { SimulationLedger } from "@/data/simulation-ledger";
import {
  isPostgresConfigured,
  withPostgresClient,
} from "@/server/durable-store";

export type DedicatedLedgerRecord = {
  fingerprint: string;
  persistedAt: string;
  ledger: SimulationLedger;
};

export type DedicatedAnalyticsRecord<T> = {
  fingerprint: string;
  refreshedAt: string;
  snapshot: T;
};

let ledgerSchemaPromise: Promise<void> | null = null;

async function createLedgerSchema(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS sap_world_simulation_ledgers (
      simulation_signature TEXT PRIMARY KEY,
      simulation_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      persisted_at TIMESTAMPTZ NOT NULL,
      document_count INTEGER NOT NULL,
      process_chain_count INTEGER NOT NULL,
      transaction_value NUMERIC(20, 2) NOT NULL,
      exception_count INTEGER NOT NULL,
      ledger JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS sap_world_ledger_documents (
      simulation_signature TEXT NOT NULL REFERENCES sap_world_simulation_ledgers(simulation_signature) ON DELETE CASCADE,
      document_id TEXT NOT NULL,
      document_number TEXT NOT NULL,
      chain_id TEXT NOT NULL,
      fiscal_year TEXT NOT NULL,
      posting_date DATE NOT NULL,
      process TEXT NOT NULL,
      module TEXT NOT NULL,
      document_type TEXT NOT NULL,
      amount NUMERIC(20, 2) NOT NULL,
      currency TEXT NOT NULL,
      has_exception BOOLEAN NOT NULL,
      payload JSONB NOT NULL,
      PRIMARY KEY (simulation_signature, document_id)
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS sap_world_ledger_documents_process_idx
    ON sap_world_ledger_documents (process, fiscal_year, posting_date DESC)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS sap_world_ledger_documents_chain_idx
    ON sap_world_ledger_documents (simulation_signature, chain_id)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS sap_world_ledger_documents_exception_idx
    ON sap_world_ledger_documents (has_exception, posting_date DESC)
    WHERE has_exception = TRUE
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS sap_world_ledger_analytics_snapshots (
      scope_key TEXT PRIMARY KEY,
      scope_type TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      refreshed_at TIMESTAMPTZ NOT NULL,
      snapshot JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS sap_world_ledger_analytics_refreshed_idx
    ON sap_world_ledger_analytics_snapshots (refreshed_at DESC)
  `);
}

async function ensureLedgerSchema() {
  if (!ledgerSchemaPromise) {
    ledgerSchemaPromise = withPostgresClient(createLedgerSchema).catch(
      (error) => {
        ledgerSchemaPromise = null;
        throw error;
      },
    );
  }
  await ledgerSchemaPromise;
}

export function usesDedicatedLedgerStorage() {
  return isPostgresConfigured();
}

export async function readDedicatedLedger(signature: string) {
  await ensureLedgerSchema();
  return withPostgresClient(async (client) => {
    const result = await client.query<{
      fingerprint: string;
      persisted_at: Date;
      ledger: SimulationLedger;
    }>(
      `SELECT fingerprint, persisted_at, ledger
       FROM sap_world_simulation_ledgers
       WHERE simulation_signature = $1`,
      [signature],
    );
    const row = result.rows[0];
    return row
      ? {
          fingerprint: row.fingerprint,
          persistedAt: row.persisted_at.toISOString(),
          ledger: row.ledger,
        }
      : null;
  });
}

export async function writeDedicatedLedger(input: {
  signature: string;
  fingerprint: string;
  persistedAt: string;
  ledger: SimulationLedger;
}) {
  await ensureLedgerSchema();
  return withPostgresClient(async (client) => {
    await client.query("BEGIN");
    try {
      await client.query(
        `INSERT INTO sap_world_simulation_ledgers (
           simulation_signature, simulation_id, fingerprint, persisted_at,
           document_count, process_chain_count, transaction_value,
           exception_count, ledger, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (simulation_signature) DO UPDATE SET
           simulation_id = EXCLUDED.simulation_id,
           fingerprint = EXCLUDED.fingerprint,
           persisted_at = EXCLUDED.persisted_at,
           document_count = EXCLUDED.document_count,
           process_chain_count = EXCLUDED.process_chain_count,
           transaction_value = EXCLUDED.transaction_value,
           exception_count = EXCLUDED.exception_count,
           ledger = EXCLUDED.ledger,
           updated_at = NOW()`,
        [
          input.signature,
          input.ledger.summary.simulationId,
          input.fingerprint,
          input.persistedAt,
          input.ledger.summary.documentCount,
          input.ledger.summary.processChainCount,
          input.ledger.summary.transactionValue,
          input.ledger.summary.exceptionCount,
          JSON.stringify(input.ledger),
        ],
      );
      await client.query(
        "DELETE FROM sap_world_ledger_documents WHERE simulation_signature = $1",
        [input.signature],
      );
      await client.query(
        `INSERT INTO sap_world_ledger_documents (
           simulation_signature, document_id, document_number, chain_id,
           fiscal_year, posting_date, process, module, document_type, amount,
           currency, has_exception, payload
         )
         SELECT
           $1,
           document->>'id',
           document->>'number',
           document->>'chainId',
           document->>'fiscalYear',
           (document->>'postingDate')::date,
           document->>'process',
           document->>'module',
           document->>'type',
           (document->>'amount')::numeric,
           document->>'currency',
           document->'exception' <> 'null'::jsonb,
           document
         FROM jsonb_array_elements($2::jsonb) AS document`,
        [input.signature, JSON.stringify(input.ledger.documents)],
      );
      await client.query("COMMIT");
      return input;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function getDedicatedLedgerStats() {
  await ensureLedgerSchema();
  return withPostgresClient(async (client) => {
    const result = await client.query<{
      ledgers: string;
      documents: string;
      process_chains: string;
      latest_persisted_at: Date | null;
    }>(`
      SELECT
        COUNT(*)::text AS ledgers,
        COALESCE(SUM(document_count), 0)::text AS documents,
        COALESCE(SUM(process_chain_count), 0)::text AS process_chains,
        MAX(persisted_at) AS latest_persisted_at
      FROM sap_world_simulation_ledgers
    `);
    const row = result.rows[0];
    return {
      ledgers: Number(row.ledgers),
      documents: Number(row.documents),
      processChains: Number(row.process_chains),
      latestPersistedAt: row.latest_persisted_at?.toISOString() ?? null,
    };
  });
}

export async function readDedicatedAnalytics<T>(key: string) {
  await ensureLedgerSchema();
  return withPostgresClient(async (client) => {
    const result = await client.query<{
      fingerprint: string;
      refreshed_at: Date;
      snapshot: T;
    }>(
      `SELECT fingerprint, refreshed_at, snapshot
       FROM sap_world_ledger_analytics_snapshots
       WHERE scope_key = $1`,
      [key],
    );
    const row = result.rows[0];
    return row
      ? {
          fingerprint: row.fingerprint,
          refreshedAt: row.refreshed_at.toISOString(),
          snapshot: row.snapshot,
        }
      : null;
  });
}

export async function writeDedicatedAnalytics<T>(input: {
  key: string;
  scope: "learner" | "admin";
  fingerprint: string;
  refreshedAt: string;
  snapshot: T;
}) {
  await ensureLedgerSchema();
  await withPostgresClient((client) =>
    client.query(
      `INSERT INTO sap_world_ledger_analytics_snapshots (
         scope_key, scope_type, fingerprint, refreshed_at, snapshot, updated_at
       ) VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (scope_key) DO UPDATE SET
         scope_type = EXCLUDED.scope_type,
         fingerprint = EXCLUDED.fingerprint,
         refreshed_at = EXCLUDED.refreshed_at,
         snapshot = EXCLUDED.snapshot,
         updated_at = NOW()`,
      [
        input.key,
        input.scope,
        input.fingerprint,
        input.refreshedAt,
        JSON.stringify(input.snapshot),
      ],
    ).then(() => undefined),
  );
  return input;
}
