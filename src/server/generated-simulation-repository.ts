import "server-only";

import type {
  GeneratedSimulation,
  SimulationFiscalYear,
} from "@/data/generated-simulations";
import type { IndustryId } from "@/data/industries";
import { createDurableStore } from "@/server/durable-store";
import { generateIndustrySimulation } from "@/server/industry-simulation-generator";

type SimulationDatabase = {
  version: 1;
  learners: Record<string, GeneratedSimulation[]>;
};

function emptyDatabase(): SimulationDatabase {
  return { version: 1, learners: {} };
}

function isSimulationDatabase(value: unknown): value is SimulationDatabase {
  const candidate = value as Partial<SimulationDatabase> | null;
  return Boolean(candidate?.version === 1 && candidate.learners);
}

const simulationStore = createDurableStore<SimulationDatabase>({
  key: "generated-simulations",
  fileName: "generated-simulations.json",
  empty: emptyDatabase,
  validate: isSimulationDatabase,
});

export async function getGeneratedSimulations(learnerId: string) {
  const database = await simulationStore.read();
  return database.learners[learnerId] ?? [];
}

export async function getAllGeneratedSimulations() {
  const database = await simulationStore.read();
  return Object.entries(database.learners).flatMap(([learnerId, simulations]) =>
    simulations.map((simulation) => ({ learnerId, simulation })),
  );
}

export async function getGeneratedSimulation(
  learnerId: string,
  simulationId: string,
) {
  const simulations = await getGeneratedSimulations(learnerId);
  return simulations.find((simulation) => simulation.id === simulationId);
}

export async function saveGeneratedSimulation(
  learnerId: string,
  input: {
    industryId: IndustryId;
    fiscalYear: SimulationFiscalYear;
    eventIndex: number;
  },
) {
  const generated = generateIndustrySimulation(input);
  return simulationStore.update((database) => {
    const simulations = database.learners[learnerId] ?? [];
    const existing = simulations.find(
      (simulation) => simulation.signature === generated.signature,
    );
    if (existing) {
      return existing;
    }

    database.learners[learnerId] = [generated, ...simulations].slice(0, 25);
    return generated;
  });
}

export async function getGeneratedSimulationStats() {
  const database = await simulationStore.read();
  const simulations = Object.values(database.learners).flat();
  return {
    learners: Object.keys(database.learners).length,
    simulations: simulations.length,
    industries: Array.from(
      new Set(simulations.map((simulation) => simulation.industryId)),
    ).length,
    latestGeneratedAt:
      simulations
        .map((simulation) => simulation.generatedAt)
        .sort()
        .at(-1) ?? null,
  };
}
