import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  GeneratedSimulation,
  SimulationFiscalYear,
} from "@/data/generated-simulations";
import type { IndustryId } from "@/data/industries";
import { generateIndustrySimulation } from "@/server/industry-simulation-generator";

type SimulationDatabase = {
  version: 1;
  learners: Record<string, GeneratedSimulation[]>;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "generated-simulations.json");
const temporaryFile = path.join(
  dataDirectory,
  "generated-simulations.tmp.json",
);
let writeQueue = Promise.resolve();

function emptyDatabase(): SimulationDatabase {
  return { version: 1, learners: {} };
}

async function readDatabase(): Promise<SimulationDatabase> {
  try {
    const parsed = JSON.parse(
      await readFile(dataFile, "utf8"),
    ) as SimulationDatabase;
    return parsed?.version === 1 && parsed.learners
      ? parsed
      : emptyDatabase();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDatabase();
    }
    throw error;
  }
}

async function writeDatabase(database: SimulationDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

export async function getGeneratedSimulations(learnerId: string) {
  const database = await readDatabase();
  return database.learners[learnerId] ?? [];
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
  let result = generated;

  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const database = await readDatabase();
    const simulations = database.learners[learnerId] ?? [];
    const existing = simulations.find(
      (simulation) => simulation.signature === generated.signature,
    );
    if (existing) {
      result = existing;
      return;
    }

    database.learners[learnerId] = [generated, ...simulations].slice(0, 25);
    await writeDatabase(database);
  });
  await writeQueue;
  return result;
}
