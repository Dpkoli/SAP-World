import { NextResponse } from "next/server";

import { normalizeLearnerProgress } from "@/data/progress";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import { buildTutorCertificationExport } from "@/server/tutor-certification-service";

export const runtime = "nodejs";

export async function GET() {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const progress =
    (await getLearnerProgress(learner.id)) ??
    normalizeLearnerProgress(learner.id, null);
  const certification = await buildTutorCertificationExport(learner, progress);

  await recordObservabilityEvent({
    type: "tutor.certification.exported",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: certification.certificateId,
    summary: "Learner generated SAP certification evidence export.",
    metadata: {
      status: certification.status,
      readinessScore: certification.summary.readinessScore,
      reviewReadyCapstones: certification.summary.reviewReadyCapstones,
      strongEvidenceCapstones: certification.summary.strongEvidenceCapstones,
    },
  });

  return NextResponse.json(certification);
}
