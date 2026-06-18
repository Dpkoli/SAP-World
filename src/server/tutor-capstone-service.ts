import "server-only";

import { processScenarios } from "@/data/simulation";
import { transactionPlaybookFor } from "@/data/transaction-playbooks";
import { troubleshootingCaseFor } from "@/data/troubleshooting";
import type { LearnerProgress, ScenarioId } from "@/data/progress";
import { buildTutorReadinessReview } from "@/server/tutor-readiness-service";

export type TutorCapstoneStatus = "Locked" | "Open" | "Ready for review";

export type TutorCapstoneChallenge = {
  scenarioId: ScenarioId;
  processCode: string;
  title: string;
  module: string;
  status: TutorCapstoneStatus;
  readinessScore: number;
  prompt: string;
  requiredEvidence: string[];
  tasks: string[];
  rubric: {
    area: string;
    points: number;
    expectation: string;
  }[];
  remediation: string[];
};

export type TutorCapstoneReview = {
  learnerId: string;
  generatedAt: string;
  summary: {
    challenges: number;
    open: number;
    readyForReview: number;
    locked: number;
    portfolioReadiness: number;
  };
  challenges: TutorCapstoneChallenge[];
};

function statusFor(score: number): TutorCapstoneStatus {
  if (score >= 90) return "Ready for review";
  if (score >= 70) return "Open";
  return "Locked";
}

function remediationFor(input: {
  score: number;
  guidedProgress: number;
  diagnosticProgress: number;
  nextAction: string;
}) {
  const actions = [];
  if (input.guidedProgress < 100) {
    actions.push("Finish the guided SAP transaction and knowledge check.");
  }
  if (input.diagnosticProgress < 100) {
    actions.push("Complete the troubleshooting lab and explain the root cause.");
  }
  if (input.score < 90) {
    actions.push(input.nextAction);
  }
  return actions.length
    ? actions
    : ["Prepare a concise walkthrough for mentor or manager review."];
}

export function buildTutorCapstoneReview(
  progress: LearnerProgress,
): TutorCapstoneReview {
  const readiness = buildTutorReadinessReview(progress);
  const challenges = processScenarios.map<TutorCapstoneChallenge>((scenario) => {
    const processReadiness = readiness.processes.find(
      (process) => process.scenarioId === scenario.id,
    )!;
    const playbook = transactionPlaybookFor(scenario.id);
    const exception = troubleshootingCaseFor(scenario.id);
    const status = statusFor(processReadiness.score);

    return {
      scenarioId: scenario.id,
      processCode: scenario.code,
      title: `${scenario.code} capstone: ${scenario.title}`,
      module: scenario.module,
      status,
      readinessScore: processReadiness.score,
      prompt: `Use ${scenario.appName} (${scenario.transactionCode}) and the ${exception.id} exception to explain how ${scenario.scenario.toLowerCase()} should be processed end to end in SAP S/4HANA.`,
      requiredEvidence: [
        `Business trigger: ${playbook?.businessTrigger ?? scenario.scenario}`,
        `Primary SAP entry: ${scenario.appName} / ${scenario.transactionCode}`,
        `Exception evidence: ${exception.symptom}`,
        ...(playbook?.documentChain.slice(0, 4) ??
          scenario.steps.slice(0, 4).map(
            (step) => `${step.label} (${step.module}) - ${step.document}`,
          )),
      ],
      tasks: [
        "Walk through the SAP processing sequence in business language.",
        "Identify the upstream and downstream documents that prove integration.",
        "Explain the inventory, accounting, and operational impact.",
        "Diagnose the exception and propose the controlled recovery action.",
      ],
      rubric: [
        {
          area: "Transaction execution",
          points: 30,
          expectation:
            "Uses the correct SAP app or transaction code, key fields, checks, and completion evidence.",
        },
        {
          area: "Document integration",
          points: 25,
          expectation:
            "Connects upstream and downstream SAP documents without breaking chronology.",
        },
        {
          area: "Business impact",
          points: 25,
          expectation:
            "Explains why the step matters for operations, inventory, accounting, and controls.",
        },
        {
          area: "Exception recovery",
          points: 20,
          expectation:
            "Uses the system evidence to choose an authorized correction path.",
        },
      ],
      remediation: remediationFor({
        score: processReadiness.score,
        guidedProgress: processReadiness.guidedProgress,
        diagnosticProgress: processReadiness.diagnosticProgress,
        nextAction: processReadiness.nextAction,
      }),
    };
  });

  const summary = challenges.reduce(
    (result, challenge) => {
      result[challenge.status] += 1;
      return result;
    },
    { Locked: 0, Open: 0, "Ready for review": 0 } as Record<
      TutorCapstoneStatus,
      number
    >,
  );

  return {
    learnerId: progress.learnerId,
    generatedAt: new Date().toISOString(),
    summary: {
      challenges: challenges.length,
      open: summary.Open,
      readyForReview: summary["Ready for review"],
      locked: summary.Locked,
      portfolioReadiness: readiness.overall.score,
    },
    challenges,
  };
}
