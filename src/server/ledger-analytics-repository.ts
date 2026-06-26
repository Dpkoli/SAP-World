import "server-only";

import type {
  SimulationFiscalYear,
} from "@/data/generated-simulations";
import {
  simulationLedgerProcesses,
  type SimulationLedgerProcess,
} from "@/data/simulation-ledger";
import { generateEnterpriseLedger } from "@/server/enterprise-ledger-generator";
import {
  getAllGeneratedSimulations,
  getGeneratedSimulations,
} from "@/server/generated-simulation-repository";
import { createDurableStore } from "@/server/durable-store";

type LedgerScope = "learner" | "admin";

type SavedSimulation = Awaited<
  ReturnType<typeof getAllGeneratedSimulations>
>[number];

type LedgerAnalyticsBaseSnapshot = ReturnType<typeof summarizeRecords>;

type PersistedLedgerAnalyticsEntry = {
  fingerprint: string;
  refreshedAt: string;
  snapshot: LedgerAnalyticsBaseSnapshot;
};

type LedgerAnalyticsReadModel = {
  version: 1;
  entries: Record<string, PersistedLedgerAnalyticsEntry>;
};

function emptyBreakdown<T extends string>(keys: readonly T[]) {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      {
        simulations: 0,
        documents: 0,
        processChains: 0,
        transactionValue: 0,
        exceptions: 0,
      },
    ]),
  ) as Record<
    T,
    {
      simulations: number;
      documents: number;
      processChains: number;
      transactionValue: number;
      exceptions: number;
    }
  >;
}

function summarizeRecords(records: SavedSimulation[], scope: LedgerScope) {
  const documents = records.flatMap(({ learnerId, simulation }) => {
    const ledger = generateEnterpriseLedger(simulation);
    return ledger.documents.map((document) => ({
      learnerId,
      simulation,
      document,
    }));
  });
  const simulationIds = new Set(records.map(({ simulation }) => simulation.id));
  const learnerIds = new Set(records.map(({ learnerId }) => learnerId));
  const chainIds = new Set(documents.map(({ document }) => document.chainId));
  const documentNumbers = new Set(
    documents.map(({ document }) => document.number),
  );
  const journalDocuments = documents.filter(
    ({ document }) => document.journalEntries.length > 0,
  );
  const brokenLinks = documents.filter(({ document }) => {
    const upstreamBroken =
      document.upstreamDocument !== null &&
      !documentNumbers.has(document.upstreamDocument);
    const downstreamBroken =
      document.downstreamDocument !== null &&
      !documentNumbers.has(document.downstreamDocument);
    return upstreamBroken || downstreamBroken;
  }).length;
  const orphanDocuments = Array.from(chainIds).reduce((count, chainId) => {
    const chainLength = documents.filter(
      ({ document }) => document.chainId === chainId,
    ).length;
    return count + (chainLength === 6 ? 0 : chainLength);
  }, 0);
  const yearBreakdown = emptyBreakdown([
    "2023-2024",
    "2024-2025",
    "2025-2026",
  ] as const satisfies readonly SimulationFiscalYear[]);
  const processBreakdown = emptyBreakdown(simulationLedgerProcesses);
  const moduleBreakdown = new Map<
    string,
    {
      documents: number;
      transactionValue: number;
      exceptions: number;
    }
  >();
  const industryBreakdown = new Map<
    string,
    {
      simulations: number;
      documents: number;
      transactionValue: number;
      exceptions: number;
    }
  >();

  for (const { simulation, document } of documents) {
    const year = yearBreakdown[document.fiscalYear];
    year.documents += 1;
    year.transactionValue += document.amount;
    year.exceptions += document.exception ? 1 : 0;

    const process = processBreakdown[document.process];
    process.documents += 1;
    process.transactionValue += document.amount;
    process.exceptions += document.exception ? 1 : 0;

    const moduleStats = moduleBreakdown.get(document.module) ?? {
      documents: 0,
      transactionValue: 0,
      exceptions: 0,
    };
    moduleStats.documents += 1;
    moduleStats.transactionValue += document.amount;
    moduleStats.exceptions += document.exception ? 1 : 0;
    moduleBreakdown.set(document.module, moduleStats);

    const industry = industryBreakdown.get(simulation.industry) ?? {
      simulations: 0,
      documents: 0,
      transactionValue: 0,
      exceptions: 0,
    };
    industry.documents += 1;
    industry.transactionValue += document.amount;
    industry.exceptions += document.exception ? 1 : 0;
    industryBreakdown.set(simulation.industry, industry);
  }

  for (const { simulation } of records) {
    const industry = industryBreakdown.get(simulation.industry);
    if (industry) industry.simulations += 1;
    const ledger = generateEnterpriseLedger(simulation);
    for (const year of ledger.summary.fiscalYears) {
      yearBreakdown[year.fiscalYear].simulations += 1;
      yearBreakdown[year.fiscalYear].processChains += year.processChains;
    }
    for (const process of ledger.summary.processCoverage) {
      processBreakdown[process].simulations += 1;
    }
    for (const process of simulationLedgerProcesses) {
      processBreakdown[process].processChains += 3;
    }
  }

  return {
    scope,
    generatedAt: new Date().toISOString(),
    totals: {
      learners: learnerIds.size,
      simulations: simulationIds.size,
      documents: documents.length,
      processChains: chainIds.size,
      transactionValue: documents.reduce(
        (total, { document }) => total + document.amount,
        0,
      ),
      journalDocuments: journalDocuments.length,
      exceptions: documents.filter(({ document }) => document.exception).length,
    },
    integrity: {
      status:
        brokenLinks === 0 && orphanDocuments === 0 ? "Passed" as const : "Failed" as const,
      brokenLinks,
      orphanDocuments,
      uniqueDocumentNumbers: documentNumbers.size,
    },
    byFiscalYear: yearBreakdown,
    byProcess: processBreakdown,
    byModule: Object.fromEntries(
      Array.from(moduleBreakdown.entries()).sort(
        (left, right) => right[1].documents - left[1].documents,
      ),
    ),
    byIndustry: Object.fromEntries(
      Array.from(industryBreakdown.entries()).sort(
        (left, right) => right[1].documents - left[1].documents,
      ),
    ),
  };
}

export type LedgerAnalyticsSnapshot = LedgerAnalyticsBaseSnapshot & {
  readModel: {
    key: string;
    persisted: boolean;
    refreshedAt: string;
    fingerprint: string;
  };
};

function emptyReadModel(): LedgerAnalyticsReadModel {
  return { version: 1, entries: {} };
}

function isReadModel(value: unknown): value is LedgerAnalyticsReadModel {
  const candidate = value as Partial<LedgerAnalyticsReadModel> | null;
  return Boolean(
    candidate?.version === 1 &&
      candidate.entries &&
      typeof candidate.entries === "object",
  );
}

const analyticsStore = createDurableStore<LedgerAnalyticsReadModel>({
  key: "ledger-analytics-read-model",
  fileName: "ledger-analytics-read-model.json",
  empty: emptyReadModel,
  validate: isReadModel,
});

function analyticsKey(scope: LedgerScope, learnerId?: string) {
  return scope === "admin" ? "admin:platform" : `learner:${learnerId}`;
}

function fingerprintRecords(records: SavedSimulation[], scope: LedgerScope) {
  return [
    scope,
    records.length,
    ...records
      .map(
        ({ learnerId, simulation }) =>
          `${learnerId}:${simulation.signature}:${simulation.generatedAt}`,
      )
      .sort(),
  ].join("|");
}

function withReadModel(
  snapshot: LedgerAnalyticsBaseSnapshot,
  input: LedgerAnalyticsSnapshot["readModel"],
): LedgerAnalyticsSnapshot {
  return {
    ...snapshot,
    readModel: input,
  };
}

async function getLedgerAnalyticsFromReadModel(
  records: SavedSimulation[],
  scope: LedgerScope,
  key: string,
) {
  const fingerprint = fingerprintRecords(records, scope);
  const current = await analyticsStore.read();
  const cached = current.entries[key];
  if (cached?.fingerprint === fingerprint) {
    return withReadModel(cached.snapshot, {
      key,
      persisted: true,
      refreshedAt: cached.refreshedAt,
      fingerprint,
    });
  }

  const snapshot = summarizeRecords(records, scope);
  const refreshedAt = new Date().toISOString();
  return analyticsStore.update((database) => {
    database.entries[key] = {
      fingerprint,
      refreshedAt,
      snapshot,
    };
    return withReadModel(snapshot, {
      key,
      persisted: true,
      refreshedAt,
      fingerprint,
    });
  });
}

export async function getLearnerLedgerAnalytics(learnerId: string) {
  const simulations = await getGeneratedSimulations(learnerId);
  const records = simulations.map((simulation) => ({ learnerId, simulation }));
  return getLedgerAnalyticsFromReadModel(
    records,
    "learner",
    analyticsKey("learner", learnerId),
  );
}

export async function getPlatformLedgerAnalytics() {
  return getLedgerAnalyticsFromReadModel(
    await getAllGeneratedSimulations(),
    "admin",
    analyticsKey("admin"),
  );
}

export function isSimulationLedgerProcess(
  value: string | null,
): value is SimulationLedgerProcess {
  return Boolean(
    value &&
      simulationLedgerProcesses.includes(value as SimulationLedgerProcess),
  );
}
