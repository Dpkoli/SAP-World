import "server-only";

import {
  actionsForGovernanceCase,
  governanceAuditTrail,
  governanceDefinitions,
  type GovernanceAction,
  type GovernanceAuditEntry,
  type GovernanceCase,
  type GovernanceStatus,
} from "@/data/governance";
import { createDurableStore } from "@/server/durable-store";

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

function emptyDatabase(): GovernanceDatabase {
  return { version: 1, learners: {} };
}

function isGovernanceDatabase(value: unknown): value is GovernanceDatabase {
  const candidate = value as Partial<GovernanceDatabase> | null;
  return Boolean(candidate?.version === 1 && candidate.learners);
}

const governanceStore = createDurableStore<GovernanceDatabase>({
  key: "governance-decisions",
  fileName: "governance-decisions.json",
  empty: emptyDatabase,
  validate: isGovernanceDatabase,
});

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
  const database = await governanceStore.read();
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

  return governanceStore.update((latestDatabase) => {
    latestDatabase.learners[learnerId] ??= {};
    const latestState = latestDatabase.learners[learnerId][requestId] ?? {
      decisions: [],
    };
    const currentCase = mergeGovernanceCase(
      definition,
      learnerId,
      latestState,
    );
    if (!currentCase.allowedActions.includes(action)) return null;

    const decision: LearnerGovernanceDecision = {
      step: currentCase.currentStep,
      at: new Date().toISOString(),
      action,
      comment,
    };
    const nextState = {
      decisions: [...latestState.decisions, decision],
    };
    latestDatabase.learners[learnerId][requestId] = nextState;
    return mergeGovernanceCase(definition, learnerId, nextState);
  });
}
