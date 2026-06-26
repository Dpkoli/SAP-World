import "server-only";

import { createHash } from "node:crypto";

import type { LearnerProfile } from "@/data/auth";
import type { LearnerProgress } from "@/data/progress";
import { getTutorCapstonePortfolio } from "@/server/tutor-capstone-repository";
import { buildTutorReadinessReview } from "@/server/tutor-readiness-service";

export type TutorCertificationExport = {
  certificateId: string;
  generatedAt: string;
  status: "In progress" | "Evidence ready" | "Scenario certified";
  learner: {
    id: string;
    name: string;
    email: string;
  };
  summary: {
    readinessScore: number;
    readinessLevel: string;
    completedLessons: number;
    completedDiagnostics: number;
    guidedEvidenceNotes: number;
    reviewReadyCapstones: number;
    strongEvidenceCapstones: number;
  };
  processEvidence: Array<{
    processCode: string;
    title: string;
    module: string;
    readinessScore: number;
    readinessLevel: string;
    guidedProgress: number;
    diagnosticProgress: number;
    evidenceProgress: number;
    capstoneStatus: string;
    latestCapstoneScore: number | null;
    latestCapstoneStatus: string | null;
    evidence: string[];
  }>;
  badges: string[];
  nextBestActions: string[];
  verification: {
    method: string;
    privacy: string;
  };
};

function certificateStatus(input: {
  readinessScore: number;
  reviewReadyCapstones: number;
  strongEvidenceCapstones: number;
}) {
  if (input.readinessScore >= 90 && input.strongEvidenceCapstones >= 1) {
    return "Scenario certified";
  }
  if (input.readinessScore >= 70 && input.reviewReadyCapstones >= 1) {
    return "Evidence ready";
  }
  return "In progress";
}

function certificateIdFor(input: {
  learnerId: string;
  readinessScore: number;
  reviewReadyCapstones: number;
  strongEvidenceCapstones: number;
}) {
  const digest = createHash("sha256")
    .update(
      [
        "sap-world-certification-v1",
        input.learnerId,
        input.readinessScore,
        input.reviewReadyCapstones,
        input.strongEvidenceCapstones,
      ].join("|"),
    )
    .digest("hex");
  return `SAPW-CERT-${digest.slice(0, 12).toUpperCase()}`;
}

export async function buildTutorCertificationExport(
  learner: LearnerProfile,
  progress: LearnerProgress,
): Promise<TutorCertificationExport> {
  const readiness = buildTutorReadinessReview(progress);
  const capstones = await getTutorCapstonePortfolio(learner.id, progress);
  const generatedAt = new Date().toISOString();
  const guidedEvidenceNotes = Object.values(progress.guidedEvidence).reduce(
    (total, notes) => total + Object.keys(notes).length,
    0,
  );
  const strongEvidenceCapstones = capstones.challenges.filter(
    (challenge) => challenge.latestSubmission?.status === "Strong evidence",
  ).length;
  const status = certificateStatus({
    readinessScore: readiness.overall.score,
    reviewReadyCapstones: capstones.submissions.reviewReady,
    strongEvidenceCapstones,
  });

  const badges = [
    readiness.overall.completedLessons >= 1 ? "Guided transaction starter" : null,
    readiness.overall.completedLessons === readiness.overall.processes
      ? "Guided process finisher"
      : null,
    readiness.overall.completedDiagnostics >= 1 ? "Exception analyst" : null,
    capstones.submissions.reviewReady >= 1 ? "Capstone evidence ready" : null,
    strongEvidenceCapstones >= 1 ? "Strong SAP evidence" : null,
    status === "Scenario certified" ? "Scenario certified" : null,
  ].filter((badge): badge is string => Boolean(badge));

  const processEvidence = readiness.processes.map((process) => {
    const capstone = capstones.challenges.find(
      (challenge) => challenge.scenarioId === process.scenarioId,
    );
    return {
      processCode: process.processCode,
      title: process.title,
      module: process.module,
      readinessScore: process.score,
      readinessLevel: process.level,
      guidedProgress: process.guidedProgress,
      diagnosticProgress: process.diagnosticProgress,
      evidenceProgress: process.evidenceProgress,
      capstoneStatus: capstone?.status ?? "Locked",
      latestCapstoneScore: capstone?.latestSubmission?.score ?? null,
      latestCapstoneStatus: capstone?.latestSubmission?.status ?? null,
      evidence: [
        ...process.evidence,
        capstone?.latestSubmission
          ? `Latest capstone evidence scored ${capstone.latestSubmission.score}/100 as ${capstone.latestSubmission.status}.`
          : "No capstone evidence submitted yet.",
      ],
    };
  });

  return {
    certificateId: certificateIdFor({
      learnerId: learner.id,
      readinessScore: readiness.overall.score,
      reviewReadyCapstones: capstones.submissions.reviewReady,
      strongEvidenceCapstones,
    }),
    generatedAt,
    status,
    learner: {
      id: learner.id,
      name: learner.name,
      email: learner.email,
    },
    summary: {
      readinessScore: readiness.overall.score,
      readinessLevel: readiness.overall.level,
      completedLessons: readiness.overall.completedLessons,
      completedDiagnostics: readiness.overall.completedDiagnostics,
      guidedEvidenceNotes,
      reviewReadyCapstones: capstones.submissions.reviewReady,
      strongEvidenceCapstones,
    },
    processEvidence,
    badges,
    nextBestActions: readiness.nextBestActions,
    verification: {
      method:
        "Generated from saved guided lesson progress, troubleshooting diagnostics, evidence note counts, and scored capstone outcomes.",
      privacy:
        "Raw learner notes and capstone response text are excluded from this export.",
    },
  };
}
