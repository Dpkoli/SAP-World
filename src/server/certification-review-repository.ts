import "server-only";

import { randomUUID } from "node:crypto";

import type { LearnerProfile } from "@/data/auth";
import { createDurableStore } from "@/server/durable-store";
import type { TutorCertificationExport } from "@/server/tutor-certification-service";

export type CertificationDecisionType =
  | "Approved"
  | "Rejected"
  | "Revision requested";

export type CertificationAssessorDecision = {
  id: string;
  certificateId: string;
  learnerId: string;
  processCode: string;
  processTitle: string;
  submissionCapturedAt: string;
  decision: CertificationDecisionType;
  note: string;
  decidedAt: string;
  decidedBy: {
    id: string;
    name: string;
    email: string;
  };
};

type CertificationSubmission = {
  certificateId: string;
  learner: TutorCertificationExport["learner"];
  submittedAt: string;
  latestExportedAt: string;
  evidenceStatus: TutorCertificationExport["status"];
  summary: TutorCertificationExport["summary"];
  processEvidence: TutorCertificationExport["processEvidence"];
  badges: string[];
};

type CertificationReviewDatabase = {
  version: 1;
  submissions: Record<string, CertificationSubmission>;
  decisions: CertificationAssessorDecision[];
};

function emptyDatabase(): CertificationReviewDatabase {
  return { version: 1, submissions: {}, decisions: [] };
}

function isCertificationReviewDatabase(
  value: unknown,
): value is CertificationReviewDatabase {
  const candidate = value as Partial<CertificationReviewDatabase> | null;
  return Boolean(
    candidate?.version === 1 &&
      candidate.submissions &&
      typeof candidate.submissions === "object" &&
      Array.isArray(candidate.decisions),
  );
}

const certificationReviewStore =
  createDurableStore<CertificationReviewDatabase>({
    key: "certification-reviews",
    fileName: "certification-reviews.json",
    empty: emptyDatabase,
    validate: isCertificationReviewDatabase,
  });

export async function recordCertificationSubmission(
  certification: TutorCertificationExport,
) {
  return certificationReviewStore.update((database) => {
    const existing = database.submissions[certification.certificateId];
    const submission: CertificationSubmission = {
      certificateId: certification.certificateId,
      learner: certification.learner,
      submittedAt: existing?.submittedAt ?? certification.generatedAt,
      latestExportedAt: certification.generatedAt,
      evidenceStatus: certification.status,
      summary: certification.summary,
      processEvidence: certification.processEvidence,
      badges: certification.badges,
    };
    database.submissions[certification.certificateId] = submission;
    return submission;
  });
}

function buildReview(database: CertificationReviewDatabase) {
  const submissions = Object.values(database.submissions)
    .sort((left, right) => right.latestExportedAt.localeCompare(left.latestExportedAt))
    .map((submission) => ({
      ...submission,
      processes: submission.processEvidence.map((process) => {
        const history = database.decisions
          .filter(
            (decision) =>
              decision.certificateId === submission.certificateId &&
              decision.processCode === process.processCode,
          )
          .sort((left, right) => right.decidedAt.localeCompare(left.decidedAt));
        return {
          ...process,
          currentDecision: history[0] ?? null,
          history,
        };
      }),
    }));
  const learnerIds = new Set(
    submissions.map((submission) => submission.learner.id),
  );
  const latestDecisions = submissions.flatMap((submission) =>
    submission.processes
      .map((process) => process.currentDecision)
      .filter(
        (decision): decision is CertificationAssessorDecision =>
          Boolean(decision),
      ),
  );
  const processCount = submissions.reduce(
    (total, submission) => total + submission.processes.length,
    0,
  );

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      submissions: submissions.length,
      learners: learnerIds.size,
      processes: processCount,
      pending: processCount - latestDecisions.length,
      approved: latestDecisions.filter(
        (decision) => decision.decision === "Approved",
      ).length,
      rejected: latestDecisions.filter(
        (decision) => decision.decision === "Rejected",
      ).length,
      revisionRequested: latestDecisions.filter(
        (decision) => decision.decision === "Revision requested",
      ).length,
      decisions: database.decisions.length,
    },
    submissions,
  };
}

export async function getCertificationReview() {
  return buildReview(await certificationReviewStore.read());
}

export async function recordCertificationDecision(input: {
  admin: LearnerProfile;
  certificateId: string;
  processCode: string;
  decision: CertificationDecisionType;
  note: string;
}) {
  const note = input.note.trim();
  if (note.length > 1000) {
    throw new Error("Assessor notes must be 1,000 characters or fewer.");
  }

  await certificationReviewStore.update((database) => {
    const submission = database.submissions[input.certificateId];
    if (!submission) {
      throw new Error("Certification submission not found.");
    }
    const process = submission.processEvidence.find(
      (item) => item.processCode === input.processCode,
    );
    if (!process) {
      throw new Error("Certification process evidence not found.");
    }
    if (
      input.decision === "Approved" &&
      (process.readinessScore < 70 ||
        !process.latestCapstoneStatus ||
        process.latestCapstoneStatus === "Needs practice")
    ) {
      throw new Error(
        "Approve only when process readiness is at least 70% and capstone evidence is review ready.",
      );
    }

    const decision: CertificationAssessorDecision = {
      id: randomUUID(),
      certificateId: submission.certificateId,
      learnerId: submission.learner.id,
      processCode: process.processCode,
      processTitle: process.title,
      submissionCapturedAt: submission.submittedAt,
      decision: input.decision,
      note,
      decidedAt: new Date().toISOString(),
      decidedBy: {
        id: input.admin.id,
        name: input.admin.name,
        email: input.admin.email,
      },
    };
    database.decisions = [decision, ...database.decisions];
  });

  return getCertificationReview();
}
