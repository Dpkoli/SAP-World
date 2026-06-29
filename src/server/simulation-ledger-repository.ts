import "server-only";

import type { GeneratedSimulation } from "@/data/generated-simulations";
import type { SimulationLedger } from "@/data/simulation-ledger";
import { createDurableStore } from "@/server/durable-store";
import { generateEnterpriseLedger } from "@/server/enterprise-ledger-generator";
import {
  getDedicatedLedgerStats,
  readDedicatedLedger,
  usesDedicatedLedgerStorage,
  writeDedicatedLedger,
} from "@/server/ledger-postgres-repository";

type PersistedSimulationLedger = {
  fingerprint: string;
  persistedAt: string;
  ledger: SimulationLedger;
};

type SimulationLedgerDatabase = {
  version: 1;
  ledgers: Record<string, PersistedSimulationLedger>;
};

function emptyDatabase(): SimulationLedgerDatabase {
  return { version: 1, ledgers: {} };
}

function isSimulationLedgerDatabase(
  value: unknown,
): value is SimulationLedgerDatabase {
  const candidate = value as Partial<SimulationLedgerDatabase> | null;
  return Boolean(
    candidate?.version === 1 &&
      candidate.ledgers &&
      typeof candidate.ledgers === "object",
  );
}

const ledgerStore = createDurableStore<SimulationLedgerDatabase>({
  key: "simulation-ledgers",
  fileName: "simulation-ledgers.json",
  empty: emptyDatabase,
  validate: isSimulationLedgerDatabase,
});

function ledgerKey(simulation: GeneratedSimulation) {
  return simulation.signature;
}

function fingerprintSimulation(simulation: GeneratedSimulation) {
  return [
    simulation.signature,
    simulation.volumeTier,
    simulation.volumeProfile.processRunsPerYear,
    simulation.generatedAt,
  ].join("|");
}

export type PersistedSimulationLedgerResult = SimulationLedger & {
  persistence: {
    persisted: true;
    persistedAt: string;
    fingerprint: string;
  };
};

export async function getPersistedEnterpriseLedger(
  simulation: GeneratedSimulation,
): Promise<PersistedSimulationLedgerResult> {
  const key = ledgerKey(simulation);
  const fingerprint = fingerprintSimulation(simulation);
  if (usesDedicatedLedgerStorage()) {
    const cached = await readDedicatedLedger(key);
    if (cached?.fingerprint === fingerprint) {
      return {
        ...cached.ledger,
        persistence: {
          persisted: true,
          persistedAt: cached.persistedAt,
          fingerprint,
        },
      };
    }

    const ledger = generateEnterpriseLedger(simulation);
    const persistedAt = new Date().toISOString();
    await writeDedicatedLedger({
      signature: key,
      fingerprint,
      persistedAt,
      ledger,
    });
    return {
      ...ledger,
      persistence: { persisted: true, persistedAt, fingerprint },
    };
  }

  const database = await ledgerStore.read();
  const cached = database.ledgers[key];
  if (cached?.fingerprint === fingerprint) {
    return {
      ...cached.ledger,
      persistence: {
        persisted: true,
        persistedAt: cached.persistedAt,
        fingerprint,
      },
    };
  }

  const ledger = generateEnterpriseLedger(simulation);
  const persistedAt = new Date().toISOString();
  return ledgerStore.update((current) => {
    current.ledgers[key] = {
      fingerprint,
      persistedAt,
      ledger,
    };
    return {
      ...ledger,
      persistence: {
        persisted: true,
        persistedAt,
        fingerprint,
      },
    };
  });
}

export async function getSimulationLedgerPersistenceStats() {
  if (usesDedicatedLedgerStorage()) {
    return {
      ...(await getDedicatedLedgerStats()),
      backend: "dedicated-postgresql" as const,
    };
  }

  const database = await ledgerStore.read();
  const ledgers = Object.values(database.ledgers);
  return {
    ledgers: ledgers.length,
    documents: ledgers.reduce(
      (total, entry) => total + entry.ledger.summary.documentCount,
      0,
    ),
    processChains: ledgers.reduce(
      (total, entry) => total + entry.ledger.summary.processChainCount,
      0,
    ),
    latestPersistedAt:
      ledgers.map((entry) => entry.persistedAt).sort().at(-1) ?? null,
    backend: "aggregate-fallback" as const,
  };
}
