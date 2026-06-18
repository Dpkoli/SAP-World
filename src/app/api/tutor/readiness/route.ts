import { NextResponse } from "next/server";
import { normalizeLearnerProgress } from "@/data/progress";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import { buildTutorReadinessReview } from "@/server/tutor-readiness-service";

export const runtime = "nodejs";

export async function GET() {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const progress =
    (await getLearnerProgress(learner.id)) ??
    normalizeLearnerProgress(learner.id, null);
  const review = buildTutorReadinessReview(progress);

  await recordObservabilityEvent({
    type: "tutor.readiness.checked",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: progress.activeScenarioId,
    summary: "Learner reviewed SAP tutor readiness.",
    metadata: {
      score: review.overall.score,
      level: review.overall.level,
      completedLessons: review.overall.completedLessons,
      completedDiagnostics: review.overall.completedDiagnostics,
    },
  });

  return NextResponse.json(review);
}
