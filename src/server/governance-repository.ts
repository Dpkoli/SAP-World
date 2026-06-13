import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  actionsForGovernanceCase,
  governanceAuditTrail,
  governanceDefinitions,
  type GovernanceAction,
  type GovernanceAuditEntry,
  type GovernanceCase,
  type GovernanceStatus,
} from "@/data/governance";

type LearnerGovernanceDecision = {
  step: number;
  at: string;
  action: GovernanceAction;
  comment: string;
};

type LearnerGovernanceState = {
  decisions: LearnerGovernanceDecision[];
};

type GovernanceDatabase = {
  version: 1;
  learners: Record<string, Record<string, LearnerGovernanceState>>;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "governance-decisions.json");
const temporaryFile = path.join(
  dataDirectory,
  "governance-decisions.tmp.json",
);
let writeQueue = Promise.resolve();

function emptyDatabase(): GovernanceDatabase {
  return { version: 1, learners: {} };
}

async function readDatabase(): Promise<GovernanceDatabase> {
  try {
    const parsed = JSON.parse(await readFile(dataFile, "utf8")) as GovernanceDatabase;
    return parsed?.version === 1 && parsed.learners ? parsed : emptyDatabase();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDatabase();
    }
    throw error;
  }
}

async function writeDatabase(database: GovernanceDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

function actionLabel(action: GovernanceAction) {
  if (action === "submit") return "Submitted";
  if (action === "approve") return "Approved";
  if (action === "reject") return "Rejected";
  return "Requested changes";
}

function mergeGovernanceCase(
  definition: (typeof governanceDefinitions)[number],
  learnerId: string,
  learnerState?: LearnerGovernanceState,
): GovernanceCase {
  const steps = definition.steps.map((step) => ({ ...step }));
  const auditTrail = governanceAuditTrail.filter(
    (entry) => entry.requestId === definition.id,
  );
  let status: GovernanceStatus = definition.status;
  let currentStep = definition.currentStep;
  const learnerAudit: GovernanceAuditEntry[] = [];

  for (const decision of learnerState?.decisions ?? []) {
    const stepIndex = steps.findIndex((step) => step.sequence === decision.step);
    if (stepIndex < 0) continue;
    const step = steps[stepIndex];
    const label = actionLabel(decision.action);
    step.status = "Completed";
    step.completedAt = decision.at;
    step.decision = label;
    step.comment = decision.comment;

    if (decision.action === "submit" || decision.action === "approve") {
      const nextStep = steps
        .slice(stepIndex + 1)
        .find((candidate) => candidate.status === "Waiting");
      if (nextStep) {
        nextStep.status = "Current";
        currentStep = nextStep.sequence;
        status = "Pending";
      } else {
        status = "Approved";
      }
    } else {
      status =
        decision.action === "reject" ? "Rejected" : "Changes requested";
    }

    learnerAudit.push({
      id: `${definition.id}-${learnerId}-${decision.at}`,
      requestId: definition.id,
      at: decision.at,
      actor: "Simulation learner",
      actorRole: step.role,
      action: label,
      comment: decision.comment,
    });
  }

  const merged = {
    ...definition,
    status,
    currentStep,
    steps,
    auditTrail: [...auditTrail, ...learnerAudit].sort((a, b) =>
      a.at.localeCompare(b.at),
    ),
  };
  return {
    ...merged,
    allowedActions: actionsForGovernanceCase(merged),
  };
}

export async function getGovernanceCases(learnerId: string) {
  const database = await readDatabase();
  const learnerStates = database.learners[learnerId] ?? {};
  return governanceDefinitions.map((definition) =>
    mergeGovernanceCase(definition, learnerId, learnerStates[definition.id]),
  );
}

export async function decideGovernanceCase(
  learnerId: string,
  requestId: string,
  action: GovernanceAction,
  comment: string,
) {
  const definition = governanceDefinitions.find(
    (request) => request.id === requestId,
  );
  if (!definition) return null;

  const database = await readDatabase();
  const existingState = database.learners[learnerId]?.[requestId] ?? {
    decisions: [],
  };
  const currentCase = mergeGovernanceCase(
    definition,
    learnerId,
    existingState,
  );
  if (!currentCase.allowedActions.includes(action)) return null;

  const decision: LearnerGovernanceDecision = {
    step: currentCase.currentStep,
    at: new Date().toISOString(),
    action,
    comment,
  };
  const nextState = {
    decisions: [...existingState.decisions, decision],
  };

  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const latestDatabase = await readDatabase();
    latestDatabase.learners[learnerId] ??= {};
    const latestState = latestDatabase.learners[learnerId][requestId] ?? {
      decisions: [],
    };
    latestDatabase.learners[learnerId][requestId] = {
      decisions: [...latestState.decisions, decision],
    };
    await writeDatabase(latestDatabase);
  });
  await writeQueue;

  return mergeGovernanceCase(definition, learnerId, nextState);
}
