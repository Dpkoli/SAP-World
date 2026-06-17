import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { LearnerProfile } from "@/data/auth";
import { createDurableStore } from "@/server/durable-store";

type StoredUser = LearnerProfile & {
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

type StoredSession = {
  userId: string;
  expiresAt: string;
};

type AuthDatabase = {
  version: 1;
  users: Record<string, StoredUser>;
  sessions: Record<string, StoredSession>;
};

const scrypt = promisify(scryptCallback);
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

function emptyDatabase(): AuthDatabase {
  return { version: 1, users: {}, sessions: {} };
}

function isAuthDatabase(value: unknown): value is AuthDatabase {
  const candidate = value as Partial<AuthDatabase> | null;
  return Boolean(
    candidate &&
      candidate.version === 1 &&
      candidate.users &&
      candidate.sessions,
  );
}

const authStore = createDurableStore<AuthDatabase>({
  key: "auth",
  fileName: "accounts.json",
  empty: emptyDatabase,
  validate: isAuthDatabase,
});

async function updateDatabase<T>(
  update: (database: AuthDatabase) => Promise<T> | T,
) {
  return authStore.update(update);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function publicProfile(user: StoredUser): LearnerProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function hashPassword(password: string, salt: string) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return derived.toString("hex");
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createLearner(
  name: string,
  email: string,
  password: string,
) {
  const normalizedEmail = normalizeEmail(email);
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password, passwordSalt);

  return updateDatabase((database) => {
    const duplicate = Object.values(database.users).some(
      (user) => user.email === normalizedEmail,
    );
    if (duplicate) {
      return null;
    }

    const id = `learner-${randomBytes(8).toString("hex")}`;
    const user: StoredUser = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      role: "learner",
      passwordHash,
      passwordSalt,
      createdAt: new Date().toISOString(),
    };
    database.users[id] = user;
    return publicProfile(user);
  });
}

export async function verifyLearner(email: string, password: string) {
  const database = await authStore.read();
  const user = Object.values(database.users).find(
    (candidate) => candidate.email === normalizeEmail(email),
  );
  if (!user) {
    return null;
  }

  const candidateHash = Buffer.from(
    await hashPassword(password, user.passwordSalt),
    "hex",
  );
  const storedHash = Buffer.from(user.passwordHash, "hex");
  if (
    candidateHash.length !== storedHash.length ||
    !timingSafeEqual(candidateHash, storedHash)
  ) {
    return null;
  }
  return publicProfile(user);
}

export async function createLearnerSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await updateDatabase((database) => {
    database.sessions[tokenHash] = {
      userId,
      expiresAt: expiresAt.toISOString(),
    };
  });

  return { token, expiresAt };
}

export async function getLearnerBySession(token: string | undefined) {
  if (!token) return null;

  const database = await authStore.read();
  const tokenHash = hashSessionToken(token);
  const session = database.sessions[tokenHash];
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = database.users[session.userId];
  return user ? publicProfile(user) : null;
}

export async function revokeLearnerSession(token: string | undefined) {
  if (!token) return;
  await updateDatabase((database) => {
    delete database.sessions[hashSessionToken(token)];
  });
}
