import { NextResponse } from "next/server";
import { isScenarioId, normalizeLearnerProgress } from "@/data/progress";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import {
  getTutorCapstonePortfolio,
  submitTutorCapstone,
} from "@/server/tutor-capstone-repository";

export const runtime = "nodejs";

export async function GET() {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const progress =
    (await getLearnerProgress(learner.id)) ??
    normalizeLearnerProgress(learner.id, null);
  const portfolio = await getTutorCapstonePortfolio(learner.id, progress);

  await recordObservabilityEvent({
    type: "tutor.capstone.checked",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: progress.activeScenarioId,
    summary: "Learner reviewed SAP capstone assessment plan.",
    metadata: {
      portfolioReadiness: portfolio.summary.portfolioReadiness,
      open: portfolio.summary.open,
      readyForReview: portfolio.summary.readyForReview,
      locked: portfolio.summary.locked,
      submissions: portfolio.submissions.total,
    },
  });

  return NextResponse.json(portfolio);
}

export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const input =
    typeof payload === "object" && payload !== null
      ? (payload as { scenarioId?: unknown; response?: unknown })
      : {};
  const response =
    typeof input.response === "string" ? input.response.trim() : "";

  if (!isScenarioId(input.scenarioId) || response.length < 80 || response.length > 2000) {
    return NextResponse.json(
      {
        error:
          "Scenario and an assessment response between 80 and 2,000 characters are required.",
      },
      { status: 400 },
    );
  }

  const progress =
    (await getLearnerProgress(learner.id)) ??
    normalizeLearnerProgress(learner.id, null);

  try {
    const portfolio = await submitTutorCapstone({
      learnerId: learner.id,
      progress,
      scenarioId: input.scenarioId,
      response,
    });
    const challenge = portfolio.challenges.find(
      (item) => item.scenarioId === input.scenarioId,
    );

    await recordObservabilityEvent({
      type: "tutor.capstone.submitted",
      actorId: learner.id,
      actorRole: learner.role,
      entityId: input.scenarioId,
      summary: "Learner submitted SAP capstone evidence.",
      metadata: {
        score: challenge?.latestSubmission?.score ?? null,
        status: challenge?.latestSubmission?.status ?? null,
        submissions: challenge?.submissions ?? 0,
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: (error as Error).message.includes("not found") ? 404 : 409 },
    );
  }
}
