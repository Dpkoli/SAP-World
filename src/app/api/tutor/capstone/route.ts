import { NextResponse } from "next/server";
import { normalizeLearnerProgress } from "@/data/progress";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import { buildTutorCapstoneReview } from "@/server/tutor-capstone-service";

export const runtime = "nodejs";

export async function GET() {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const progress =
    (await getLearnerProgress(learner.id)) ??
    normalizeLearnerProgress(learner.id, null);
  const review = buildTutorCapstoneReview(progress);

  await recordObservabilityEvent({
    type: "tutor.capstone.checked",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: progress.activeScenarioId,
    summary: "Learner reviewed SAP capstone assessment plan.",
    metadata: {
      portfolioReadiness: review.summary.portfolioReadiness,
      open: review.summary.open,
      readyForReview: review.summary.readyForReview,
      locked: review.summary.locked,
    },
  });

  return NextResponse.json(review);
}
