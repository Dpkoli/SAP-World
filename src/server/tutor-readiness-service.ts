import "server-only";

import { processScenarios } from "@/data/simulation";
import { transactionPlaybookFor } from "@/data/transaction-playbooks";
import type { LearnerProgress, ScenarioId } from "@/data/progress";

export type TutorReadinessLevel =
  | "Not started"
  | "In progress"
  | "Practice ready"
  | "Scenario ready";

export type TutorReadinessProcess = {
  scenarioId: ScenarioId;
  processCode: string;
  title: string;
  module: string;
  score: number;
  level: TutorReadinessLevel;
  guidedProgress: number;
  diagnosticProgress: number;
  evidenceProgress: number;
  completedStages: number;
  totalStages: number;
  nextAction: string;
  weakAreas: string[];
  evidence: string[];
};

export type TutorReadinessReview = {
  learnerId: string;
  generatedAt: string;
  overall: {
    score: number;
    level: TutorReadinessLevel;
    completedLessons: number;
    completedDiagnostics: number;
    processes: number;
  };
  nextBestActions: string[];
  processes: TutorReadinessProcess[];
};

function levelFor(score: number): TutorReadinessLevel {
  if (score >= 90) return "Scenario ready";
  if (score >= 70) return "Practice ready";
  if (score > 0) return "In progress";
  return "Not started";
}

function scoreGuidedProgress(step: number, complete: boolean, total: number) {
  if (complete) return 100;
  return Math.round(((step + 1) / total) * 100);
}

function nextActionFor(input: {
  title: string;
  guidedComplete: boolean;
  diagnosticComplete: boolean;
  evidenceComplete: boolean;
  currentStage?: string;
}) {
  if (!input.guidedComplete && input.currentStage) {
    return `Continue guided SAP processing at "${input.currentStage}".`;
  }
  if (!input.diagnosticComplete) {
    return `Complete the troubleshooting lab for ${input.title} and explain the root cause.`;
  }
  if (!input.evidenceComplete) {
    return `Capture review-ready evidence notes for each guided SAP step in ${input.title}.`;
  }
  return `Review the document chain and ask the SAP Mentor one integration question for ${input.title}.`;
}

export function buildTutorReadinessReview(
  progress: LearnerProgress,
): TutorReadinessReview {
  const processes = processScenarios.map<TutorReadinessProcess>((scenario) => {
    const guided = progress.scenarios[scenario.id];
    const diagnostic = progress.diagnostics[scenario.id];
    const guidedEvidenceNotes = Object.keys(
      progress.guidedEvidence[scenario.id] ?? {},
    ).length;
    const totalStages = scenario.tutorSteps.length;
    const completedStages = guided.complete
      ? totalStages
      : Math.min(guided.step + 1, totalStages);
    const guidedProgress = scoreGuidedProgress(
      guided.step,
      guided.complete,
      totalStages,
    );
    const diagnosticProgress = diagnostic.complete ? 100 : 0;
    const evidenceProgress = Math.round(
      (Math.min(guidedEvidenceNotes, totalStages) / totalStages) * 100,
    );
    const score = Math.round(
      guidedProgress * 0.5 +
        diagnosticProgress * 0.3 +
        evidenceProgress * 0.2,
    );
    const playbook = transactionPlaybookFor(scenario.id);
    const activeStage = scenario.tutorSteps[Math.min(guided.step, totalStages - 1)];

    const weakAreas = [
      !guided.complete ? "Guided SAP transaction execution" : null,
      !diagnostic.complete ? "Exception diagnosis and recovery" : null,
      evidenceProgress < 100 ? "Step evidence capture" : null,
      score < 90 ? "Cross-module impact explanation" : null,
    ].filter((item): item is string => Boolean(item));

    return {
      scenarioId: scenario.id,
      processCode: scenario.code,
      title: scenario.tutorTitle,
      module: scenario.module,
      score,
      level: levelFor(score),
      guidedProgress,
      diagnosticProgress,
      evidenceProgress,
      completedStages,
      totalStages,
      nextAction: nextActionFor({
        title: scenario.tutorTitle,
        guidedComplete: guided.complete,
        diagnosticComplete: diagnostic.complete,
        evidenceComplete: evidenceProgress === 100,
        currentStage: activeStage?.title,
      }),
      weakAreas,
      evidence: [
        `${completedStages}/${totalStages} guided SAP stages completed.`,
        diagnostic.complete
          ? `Troubleshooting lab completed at ${diagnostic.completedAt ?? "recorded time"}.`
          : `${diagnostic.attempts} troubleshooting attempt${diagnostic.attempts === 1 ? "" : "s"} recorded.`,
        `${guidedEvidenceNotes}/${totalStages} guided SAP evidence notes captured.`,
        playbook
          ? `${playbook.documentChain.length} document-chain checkpoints available.`
          : `${scenario.steps.length} process documents available.`,
      ],
    };
  });

  const completedLessons = processes.filter(
    (process) => process.guidedProgress === 100,
  ).length;
  const completedDiagnostics = processes.filter(
    (process) => process.diagnosticProgress === 100,
  ).length;
  const score = Math.round(
    processes.reduce((total, process) => total + process.score, 0) /
      processes.length,
  );
  const nextBestActions = [...processes]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((process) => `${process.processCode}: ${process.nextAction}`);

  return {
    learnerId: progress.learnerId,
    generatedAt: new Date().toISOString(),
    overall: {
      score,
      level: levelFor(score),
      completedLessons,
      completedDiagnostics,
      processes: processes.length,
    },
    nextBestActions,
    processes,
  };
}
