import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  GeneratedSimulation,
  SimulationExecution,
  SimulationExecutionEvent,
} from "@/data/generated-simulations";
import { getGeneratedSimulations } from "@/server/generated-simulation-repository";

type ExecutionDatabase = {
  version: 1;
  learners: Record<string, Record<string, SimulationExecutionEvent[]>>;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "simulation-executions.json");
const temporaryFile = path.join(
  dataDirectory,
  "simulation-executions.tmp.json",
);
let writeQueue = Promise.resolve();

function emptyDatabase(): ExecutionDatabase {
  return { version: 1, learners: {} };
}

async function readDatabase(): Promise<ExecutionDatabase> {
  try {
    const parsed = JSON.parse(
      await readFile(dataFile, "utf8"),
    ) as ExecutionDatabase;
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

async function writeDatabase(database: ExecutionDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

export function replaySimulationExecution(
  simulation: GeneratedSimulation,
  events: SimulationExecutionEvent[],
): SimulationExecution {
  const orderedEvents = [...events].sort((a, b) => a.version - b.version);
  const completedSteps = orderedEvents.map((event) => event.step);
  const currentStep =
    simulation.steps.find((step) => !completedSteps.includes(step.sequence))
      ?.sequence ?? null;
  const version = orderedEvents.at(-1)?.version ?? 0;

  return {
    simulationId: simulation.id,
    signature: simulation.signature,
    status:
      version === 0
        ? "Not started"
        : currentStep === null
          ? "Completed"
          : "In progress",
    version,
    currentStep,
    completedSteps,
    completedDocuments: simulation.documents
      .filter((document) => completedSteps.includes(document.sequence))
      .map((document) => document.number),
    operationalState:
      version === 0
        ? "Exception detected"
        : version === 1
          ? "Scope validated"
          : version === 2
            ? "Risk contained"
            : version === 3
              ? "Root cause confirmed"
              : version === 4
                ? "Recovery executed"
                : version === 5
                  ? "Operational recovery reconciled"
                  : "Closed and monitored",
    inventoryState:
      version === 0
        ? "At risk"
        : version === 1
          ? "Under review"
          : version <= 3
            ? "Controlled / blocked"
            : version === 4
              ? "Recovery movement recorded"
              : "Reconciled",
    financialState:
      version < 5
        ? "Exposure identified / not posted"
        : version === 5
          ? "Posting recorded and reconciled"
          : "Closed in reporting",
    events: orderedEvents,
  };
}

export async function getSimulationExecution(
  learnerId: string,
  simulationId: string,
) {
  const simulations = await getGeneratedSimulations(learnerId);
  const simulation = simulations.find((item) => item.id === simulationId);
  if (!simulation) return null;

  const database = await readDatabase();
  const events = database.learners[learnerId]?.[simulation.signature] ?? [];
  return replaySimulationExecution(simulation, events);
}

export async function getSimulationExecutionMap(learnerId: string) {
  const simulations = await getGeneratedSimulations(learnerId);
  const database = await readDatabase();
  const learnerEvents = database.learners[learnerId] ?? {};

  return Object.fromEntries(
    simulations.map((simulation) => [
      simulation.id,
      replaySimulationExecution(
        simulation,
        learnerEvents[simulation.signature] ?? [],
      ),
    ]),
  );
}

export async function appendSimulationStep(input: {
  learnerId: string;
  actor: string;
  simulationId: string;
  expectedVersion: number;
  step: number;
  note: string;
}) {
  const simulations = await getGeneratedSimulations(input.learnerId);
  const simulation = simulations.find(
    (item) => item.id === input.simulationId,
  );
  if (!simulation) {
    throw new Error("Generated simulation not found.");
  }

  let result: SimulationExecution | null = null;
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const database = await readDatabase();
    database.learners[input.learnerId] ??= {};
    const events =
      database.learners[input.learnerId][simulation.signature] ?? [];
    const execution = replaySimulationExecution(simulation, events);

    if (execution.version !== input.expectedVersion) {
      throw new Error(
        `Simulation version changed from ${input.expectedVersion} to ${execution.version}. Refresh before continuing.`,
      );
    }
    if (execution.currentStep === null) {
      throw new Error("This simulation is already complete.");
    }
    if (execution.currentStep !== input.step) {
      throw new Error(
        `Complete step ${execution.currentStep} before step ${input.step}.`,
      );
    }

    const step = simulation.steps.find(
      (candidate) => candidate.sequence === input.step,
    )!;
    const document = simulation.documents.find(
      (candidate) => candidate.sequence === input.step,
    )!;
    const version = execution.version + 1;
    const event: SimulationExecutionEvent = {
      id: `${simulation.signature.slice(0, 12)}-v${version}`,
      simulationId: simulation.id,
      signature: simulation.signature,
      version,
      type: "SimulationStepCompleted",
      step: input.step,
      title: step.title,
      documentNumber: document.number,
      actor: input.actor,
      note: input.note,
      occurredAt: new Date().toISOString(),
    };
    const nextEvents = [...events, event];
    database.learners[input.learnerId][simulation.signature] = nextEvents;
    await writeDatabase(database);
    result = replaySimulationExecution(simulation, nextEvents);
  });
  await writeQueue;
  return result!;
}
