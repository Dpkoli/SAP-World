import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  workflowAuditTrail,
  workflowDefinitions,
  type WorkflowAction,
  type WorkflowAuditEntry,
  type WorkflowCase,
  type WorkflowStatus,
} from "@/data/workflows";

type LearnerWorkflowDecision = {
  step: number;
  decisionAt: string;
  action: WorkflowAction;
  comment: string;
};

type LearnerWorkflowState = {
  decisions: LearnerWorkflowDecision[];
};

type WorkflowDatabase = {
  version: 1;
  learners: Record<string, Record<string, LearnerWorkflowState>>;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "workflow-decisions.json");
const temporaryFile = path.join(dataDirectory, "workflow-decisions.tmp.json");
let writeQueue = Promise.resolve();

function emptyDatabase(): WorkflowDatabase {
  return { version: 1, learners: {} };
}

async function readDatabase(): Promise<WorkflowDatabase> {
  try {
    const parsed = JSON.parse(await readFile(dataFile, "utf8")) as WorkflowDatabase;
    return parsed?.version === 1 && parsed.learners ? parsed : emptyDatabase();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDatabase();
    }
    throw error;
  }
}

async function writeDatabase(database: WorkflowDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

function statusForAction(
  action: WorkflowAction,
  hasNextStep: boolean,
): WorkflowStatus {
  if (action === "approve") return hasNextStep ? "Pending" : "Approved";
  if (action === "reject") return "Rejected";
  return "Information required";
}

function mergeWorkflow(
  workflow: (typeof workflowDefinitions)[number],
  learnerId: string,
  learnerState?: LearnerWorkflowState,
): WorkflowCase {
  const baseAudit = workflowAuditTrail.filter(
    (entry) => entry.workflowId === workflow.id,
  );
  if (!learnerState) {
    return { ...workflow, auditTrail: baseAudit };
  }

  const steps = workflow.steps.map((step) => ({ ...step }));
  const learnerAudit: WorkflowAuditEntry[] = [];
  let status = workflow.status;
  let currentStep = workflow.currentStep;

  for (const decision of learnerState.decisions) {
    const stepIndex = steps.findIndex((step) => step.sequence === decision.step);
    if (stepIndex < 0) continue;

    const step = steps[stepIndex];
    const action =
      decision.action === "request-information"
        ? "Requested information"
        : decision.action === "approve"
          ? "Approved"
          : "Rejected";
    step.status = "Completed";
    step.completedAt = decision.decisionAt;
    step.decision = action;
    step.comment = decision.comment;

    const nextStep = steps.slice(stepIndex + 1).find((item) => item.status === "Waiting");
    const hasNextStep = decision.action === "approve" && Boolean(nextStep);
    status = statusForAction(decision.action, hasNextStep);
    if (hasNextStep && nextStep) {
      nextStep.status = "Current";
      currentStep = nextStep.sequence;
    }

    learnerAudit.push({
      id: `${workflow.id}-${learnerId}-${decision.decisionAt}`,
      workflowId: workflow.id,
      at: decision.decisionAt,
      actor: "Simulation learner",
      actorRole: step.role,
      action,
      comment: decision.comment,
    });
  }

  return {
    ...workflow,
    status,
    currentStep,
    allowedActions: status === "Pending" ? workflow.allowedActions : [],
    steps,
    auditTrail: [...baseAudit, ...learnerAudit].sort((a, b) =>
      a.at.localeCompare(b.at),
    ),
  };
}

export async function getWorkflowCases(learnerId: string) {
  const database = await readDatabase();
  const learnerStates = database.learners[learnerId] ?? {};
  return workflowDefinitions.map((workflow) =>
    mergeWorkflow(workflow, learnerId, learnerStates[workflow.id]),
  );
}

export async function decideWorkflow(
  learnerId: string,
  workflowId: string,
  action: WorkflowAction,
  comment: string,
) {
  const workflow = workflowDefinitions.find((item) => item.id === workflowId);
  if (!workflow || workflow.status !== "Pending") return null;
  const database = await readDatabase();
  const existingState = database.learners[learnerId]?.[workflowId] ?? {
    decisions: [],
  };
  const currentCase = mergeWorkflow(workflow, learnerId, existingState);
  if (
    currentCase.status !== "Pending" ||
    !currentCase.allowedActions.includes(action)
  ) {
    return null;
  }

  const decision: LearnerWorkflowDecision = {
    step: currentCase.currentStep,
    decisionAt: new Date().toISOString(),
    action,
    comment,
  };
  const nextState: LearnerWorkflowState = {
    decisions: [...existingState.decisions, decision],
  };

  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const latestDatabase = await readDatabase();
    latestDatabase.learners[learnerId] ??= {};
    const latestState = latestDatabase.learners[learnerId][workflowId] ?? {
      decisions: [],
    };
    latestDatabase.learners[learnerId][workflowId] = {
      decisions: [...latestState.decisions, decision],
    };
    await writeDatabase(latestDatabase);
  });
  await writeQueue;

  return mergeWorkflow(workflow, learnerId, nextState);
}
