import "server-only";

import {
  workflowAuditTrail,
  workflowDefinitions,
  type WorkflowAction,
  type WorkflowAuditEntry,
  type WorkflowCase,
  type WorkflowStatus,
} from "@/data/workflows";
import { createDurableStore } from "@/server/durable-store";

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

function emptyDatabase(): WorkflowDatabase {
  return { version: 1, learners: {} };
}

function isWorkflowDatabase(value: unknown): value is WorkflowDatabase {
  const candidate = value as Partial<WorkflowDatabase> | null;
  return Boolean(candidate?.version === 1 && candidate.learners);
}

const workflowStore = createDurableStore<WorkflowDatabase>({
  key: "workflow-decisions",
  fileName: "workflow-decisions.json",
  empty: emptyDatabase,
  validate: isWorkflowDatabase,
});

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
  const database = await workflowStore.read();
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

  return workflowStore.update((latestDatabase) => {
    latestDatabase.learners[learnerId] ??= {};
    const latestState = latestDatabase.learners[learnerId][workflowId] ?? {
      decisions: [],
    };
    const currentCase = mergeWorkflow(workflow, learnerId, latestState);
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
    const nextState = {
      decisions: [...latestState.decisions, decision],
    };
    latestDatabase.learners[learnerId][workflowId] = nextState;
    return mergeWorkflow(workflow, learnerId, nextState);
  });
}
