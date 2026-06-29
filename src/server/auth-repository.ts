import "server-only";

import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import type { LearnerProfile, UserRole } from "@/data/auth";
import { createDurableStore } from "@/server/durable-store";

export type AccountStatus = "active" | "suspended";
export type ManagedIdentityAction =
  | "account.created"
  | "account.suspended"
  | "account.reactivated"
  | "role.changed"
  | "role.bootstrapped"
  | "password.recovery.requested"
  | "password.recovery.completed";

type StoredUser = LearnerProfile & {
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  status?: AccountStatus;
  updatedAt?: string;
};

type StoredSession = {
  userId: string;
  expiresAt: string;
};

type StoredPasswordReset = {
  userId: string;
  requestedAt: string;
  expiresAt: string;
  usedAt: string | null;
};

export type ManagedIdentityAuditEvent = {
  id: string;
  occurredAt: string;
  action: ManagedIdentityAction;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  target: {
    id: string;
    name: string;
    email: string;
  };
  previousValue: string | null;
  newValue: string | null;
};

type IdentityBootstrap = {
  completedAt: string;
  source: "existing-role" | "legacy-environment" | "bootstrap-environment";
  emails: string[];
};

type AuthDatabase = {
  version: 1;
  users: Record<string, StoredUser>;
  sessions: Record<string, StoredSession>;
  passwordResets?: Record<string, StoredPasswordReset>;
  identityAudit?: ManagedIdentityAuditEvent[];
  identityBootstrap?: IdentityBootstrap;
};

const scrypt = promisify(scryptCallback);
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const passwordResetDurationMs = 30 * 60 * 1000;
const passwordResetCooldownMs = 60 * 1000;

function emptyDatabase(): AuthDatabase {
  return {
    version: 1,
    users: {},
    sessions: {},
    passwordResets: {},
    identityAudit: [],
  };
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

function accountStatus(user: StoredUser): AccountStatus {
  return user.status ?? "active";
}

function ensureCollections(database: AuthDatabase) {
  database.passwordResets ??= {};
  database.identityAudit ??= [];
}

function configuredBootstrapEmails() {
  const explicit = process.env.SAP_WORLD_BOOTSTRAP_ADMIN_EMAILS?.trim();
  const legacy = process.env.SAP_WORLD_ADMIN_EMAILS?.trim();
  return {
    source: explicit
      ? ("bootstrap-environment" as const)
      : ("legacy-environment" as const),
    emails: new Set(
      (explicit || legacy || "")
        .split(",")
        .map(normalizeEmail)
        .filter(Boolean),
    ),
  };
}

function systemActor() {
  return {
    id: "system",
    name: "SAP World identity service",
    email: "system@sapworld.local",
  };
}

function appendIdentityAudit(
  database: AuthDatabase,
  input: Omit<ManagedIdentityAuditEvent, "id" | "occurredAt">,
) {
  ensureCollections(database);
  database.identityAudit?.unshift({
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    ...input,
  });
}

function applyIdentityBootstrap(database: AuthDatabase) {
  ensureCollections(database);
  if (database.identityBootstrap) return false;

  const existingAdmins = Object.values(database.users).filter(
    (user) => user.role === "admin",
  );
  if (existingAdmins.length > 0) {
    database.identityBootstrap = {
      completedAt: new Date().toISOString(),
      source: "existing-role",
      emails: existingAdmins.map((user) => user.email),
    };
    return true;
  }

  const bootstrap = configuredBootstrapEmails();
  const matches = Object.values(database.users).filter((user) =>
    bootstrap.emails.has(user.email),
  );
  if (matches.length === 0) return false;

  const changedAt = new Date().toISOString();
  for (const user of matches) {
    const previousRole = user.role;
    user.role = "admin";
    user.status = "active";
    user.updatedAt = changedAt;
    appendIdentityAudit(database, {
      action: "role.bootstrapped",
      actor: systemActor(),
      target: { id: user.id, name: user.name, email: user.email },
      previousValue: previousRole,
      newValue: "admin",
    });
  }
  database.identityBootstrap = {
    completedAt: changedAt,
    source: bootstrap.source,
    emails: matches.map((user) => user.email),
  };
  return true;
}

async function readDatabase() {
  const current = await authStore.read();
  if (
    current.passwordResets &&
    current.identityAudit &&
    current.identityBootstrap
  ) {
    return current;
  }
  return updateDatabase((database) => {
    ensureCollections(database);
    applyIdentityBootstrap(database);
    return structuredClone(database);
  });
}

function publicProfile(user: StoredUser): LearnerProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function publicAccount(user: StoredUser) {
  return {
    ...publicProfile(user),
    status: accountStatus(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt ?? user.createdAt,
  };
}

async function hashPassword(password: string, salt: string) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return derived.toString("hex");
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function revokeUserSessions(database: AuthDatabase, userId: string) {
  for (const [tokenHash, session] of Object.entries(database.sessions)) {
    if (session.userId === userId) delete database.sessions[tokenHash];
  }
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
    ensureCollections(database);
    applyIdentityBootstrap(database);
    const duplicate = Object.values(database.users).some(
      (user) => user.email === normalizedEmail,
    );
    if (duplicate) return null;

    const bootstrap = configuredBootstrapEmails();
    const hasAdmin = Object.values(database.users).some(
      (user) => user.role === "admin" && accountStatus(user) === "active",
    );
    const role: UserRole =
      !hasAdmin && bootstrap.emails.has(normalizedEmail) ? "admin" : "learner";
    const id = `learner-${randomBytes(8).toString("hex")}`;
    const createdAt = new Date().toISOString();
    const user: StoredUser = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      role,
      status: "active",
      passwordHash,
      passwordSalt,
      createdAt,
      updatedAt: createdAt,
    };
    database.users[id] = user;
    appendIdentityAudit(database, {
      action: "account.created",
      actor: { id, name: user.name, email: user.email },
      target: { id, name: user.name, email: user.email },
      previousValue: null,
      newValue: role,
    });
    if (role === "admin" && !database.identityBootstrap) {
      database.identityBootstrap = {
        completedAt: createdAt,
        source: bootstrap.source,
        emails: [normalizedEmail],
      };
      appendIdentityAudit(database, {
        action: "role.bootstrapped",
        actor: systemActor(),
        target: { id, name: user.name, email: user.email },
        previousValue: "learner",
        newValue: "admin",
      });
    }
    return publicProfile(user);
  });
}

export async function verifyLearner(email: string, password: string) {
  const database = await readDatabase();
  const user = Object.values(database.users).find(
    (candidate) => candidate.email === normalizeEmail(email),
  );
  if (!user) return null;

  const candidateHash = Buffer.from(
    await hashPassword(password, user.passwordSalt),
    "hex",
  );
  const storedHash = Buffer.from(user.passwordHash, "hex");
  if (
    candidateHash.length !== storedHash.length ||
    !timingSafeEqual(candidateHash, storedHash) ||
    accountStatus(user) !== "active"
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
    ensureCollections(database);
    applyIdentityBootstrap(database);
    const user = database.users[userId];
    if (!user || accountStatus(user) !== "active") {
      throw new Error("Account is not active.");
    }
    database.sessions[tokenHash] = {
      userId,
      expiresAt: expiresAt.toISOString(),
    };
  });

  return { token, expiresAt };
}

export async function getLearnerBySession(token: string | undefined) {
  if (!token) return null;

  const database = await readDatabase();
  const session = database.sessions[hashSessionToken(token)];
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = database.users[session.userId];
  return user && accountStatus(user) === "active" ? publicProfile(user) : null;
}

export async function revokeLearnerSession(token: string | undefined) {
  if (!token) return;
  await updateDatabase((database) => {
    delete database.sessions[hashSessionToken(token)];
  });
}

export async function requestPasswordReset(email: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  return updateDatabase((database) => {
    ensureCollections(database);
    applyIdentityBootstrap(database);
    const user = Object.values(database.users).find(
      (candidate) => candidate.email === normalizeEmail(email),
    );
    if (!user || accountStatus(user) !== "active") return null;

    const recent = Object.values(database.passwordResets ?? {})
      .filter((reset) => reset.userId === user.id && !reset.usedAt)
      .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))[0];
    if (
      recent &&
      Date.now() - new Date(recent.requestedAt).getTime() <
        passwordResetCooldownMs
    ) {
      return null;
    }

    const requestedAt = new Date();
    const expiresAt = new Date(requestedAt.getTime() + passwordResetDurationMs);
    database.passwordResets ??= {};
    database.passwordResets[tokenHash] = {
      userId: user.id,
      requestedAt: requestedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
    };
    appendIdentityAudit(database, {
      action: "password.recovery.requested",
      actor: systemActor(),
      target: { id: user.id, name: user.name, email: user.email },
      previousValue: null,
      newValue: expiresAt.toISOString(),
    });
    return {
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    };
  });
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = hashSessionToken(token);
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password, passwordSalt);
  return updateDatabase((database) => {
    ensureCollections(database);
    const reset = database.passwordResets?.[tokenHash];
    if (
      !reset ||
      reset.usedAt ||
      new Date(reset.expiresAt).getTime() <= Date.now()
    ) {
      return null;
    }
    const user = database.users[reset.userId];
    if (!user || accountStatus(user) !== "active") return null;

    const completedAt = new Date().toISOString();
    user.passwordSalt = passwordSalt;
    user.passwordHash = passwordHash;
    user.updatedAt = completedAt;
    reset.usedAt = completedAt;
    revokeUserSessions(database, user.id);
    appendIdentityAudit(database, {
      action: "password.recovery.completed",
      actor: { id: user.id, name: user.name, email: user.email },
      target: { id: user.id, name: user.name, email: user.email },
      previousValue: reset.requestedAt,
      newValue: completedAt,
    });
    return publicProfile(user);
  });
}

export async function updateManagedAccount(input: {
  admin: LearnerProfile;
  userId: string;
  action: "set-role" | "suspend" | "reactivate";
  role?: UserRole;
}) {
  await updateDatabase((database) => {
    ensureCollections(database);
    applyIdentityBootstrap(database);
    const actor = database.users[input.admin.id];
    if (
      !actor ||
      actor.role !== "admin" ||
      accountStatus(actor) !== "active"
    ) {
      throw new Error("Managed identity administrator access is required.");
    }
    const target = database.users[input.userId];
    if (!target) throw new Error("Account not found.");

    const activeAdminCount = Object.values(database.users).filter(
      (user) => user.role === "admin" && accountStatus(user) === "active",
    ).length;
    const auditBase = {
      actor: { id: actor.id, name: actor.name, email: actor.email },
      target: { id: target.id, name: target.name, email: target.email },
    };
    const changedAt = new Date().toISOString();

    if (input.action === "set-role") {
      if (!input.role) throw new Error("Choose a valid organisation role.");
      if (
        target.role === "admin" &&
        input.role !== "admin" &&
        accountStatus(target) === "active" &&
        activeAdminCount <= 1
      ) {
        throw new Error("Keep at least one active platform administrator.");
      }
      const previousRole = target.role;
      target.role = input.role;
      target.updatedAt = changedAt;
      appendIdentityAudit(database, {
        action: "role.changed",
        ...auditBase,
        previousValue: previousRole,
        newValue: input.role,
      });
      return;
    }

    if (input.action === "suspend") {
      if (target.id === actor.id) {
        throw new Error("Administrators cannot suspend their own account.");
      }
      if (
        target.role === "admin" &&
        accountStatus(target) === "active" &&
        activeAdminCount <= 1
      ) {
        throw new Error("Keep at least one active platform administrator.");
      }
      const previousStatus = accountStatus(target);
      target.status = "suspended";
      target.updatedAt = changedAt;
      revokeUserSessions(database, target.id);
      appendIdentityAudit(database, {
        action: "account.suspended",
        ...auditBase,
        previousValue: previousStatus,
        newValue: "suspended",
      });
      return;
    }

    const previousStatus = accountStatus(target);
    target.status = "active";
    target.updatedAt = changedAt;
    appendIdentityAudit(database, {
      action: "account.reactivated",
      ...auditBase,
      previousValue: previousStatus,
      newValue: "active",
    });
  });

  return getAuthAdministrationSnapshot();
}

export async function getAuthAdministrationSnapshot() {
  const database = await readDatabase();
  const now = Date.now();
  const users = Object.values(database.users).map(publicAccount);
  const activeSessions = Object.values(database.sessions).filter(
    (session) => new Date(session.expiresAt).getTime() > now,
  );
  const sortedUsers = users.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  return {
    users: users.length,
    roles: {
      learner: users.filter((user) => user.role === "learner").length,
      admin: users.filter((user) => user.role === "admin").length,
    },
    lifecycle: {
      active: users.filter((user) => user.status === "active").length,
      suspended: users.filter((user) => user.status === "suspended").length,
      activeAdmins: users.filter(
        (user) => user.role === "admin" && user.status === "active",
      ).length,
    },
    bootstrap: database.identityBootstrap ?? null,
    sessions: {
      total: Object.keys(database.sessions).length,
      active: activeSessions.length,
      expired: Object.keys(database.sessions).length - activeSessions.length,
    },
    recentUsers: sortedUsers.slice(0, 8),
    managedUsers: sortedUsers,
    audit: (database.identityAudit ?? []).slice(0, 100),
  };
}
