import { NextResponse } from "next/server";

import { isIndustryId } from "@/data/industries";
import { getCurrentLearner } from "@/server/auth-session";
import {
  closeIndustryPeriod,
  completeIndustryTask,
  getIndustryJourney,
  getIndustryJourneys,
  startIndustryJourney,
} from "@/server/industry-journey-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const industryId = new URL(request.url).searchParams.get("industryId");
  if (industryId) {
    if (!isIndustryId(industryId)) {
      return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
    }
    const progress = await getIndustryJourney(learner.id, industryId);
    return NextResponse.json({ industryId, progress });
  }
  return NextResponse.json({ journeys: await getIndustryJourneys(learner.id) });
}

type JourneyAction =
  | { action: "start"; industryId: unknown }
  | { action: "complete-task"; industryId: unknown; taskId?: unknown }
  | { action: "close-period"; industryId: unknown; periodId?: unknown };

export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  let payload: JourneyAction;
  try {
    payload = (await request.json()) as JourneyAction;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
  if (!isIndustryId(payload.industryId)) {
    return NextResponse.json({ error: "Unknown industry." }, { status: 400 });
  }

  try {
    if (payload.action === "start") {
      const progress = await startIndustryJourney(
        learner.id,
        payload.industryId,
      );
      await recordObservabilityEvent({
        type: "industry.journey.started",
        actorId: learner.id,
        actorRole: learner.role,
        entityId: payload.industryId,
        summary: "Learner started a mandatory industry curriculum.",
        metadata: { industryId: payload.industryId },
      });
      return NextResponse.json({ progress }, { status: 201 });
    }

    if (payload.action === "complete-task") {
      if (typeof payload.taskId !== "string" || !payload.taskId.trim()) {
        return NextResponse.json({ error: "Task is required." }, { status: 400 });
      }
      const progress = await completeIndustryTask(
        learner.id,
        payload.industryId,
        payload.taskId,
      );
      await recordObservabilityEvent({
        type: "industry.task.completed",
        actorId: learner.id,
        actorRole: learner.role,
        entityId: payload.taskId,
        summary: "Learner completed a mandatory industry curriculum task.",
        metadata: {
          industryId: payload.industryId,
          completedTasks: progress.completedTaskIds.length,
        },
      });
      return NextResponse.json({ progress });
    }

    if (payload.action === "close-period") {
      if (typeof payload.periodId !== "string" || !payload.periodId.trim()) {
        return NextResponse.json({ error: "Close period is required." }, { status: 400 });
      }
      const progress = await closeIndustryPeriod(
        learner.id,
        payload.industryId,
        payload.periodId,
      );
      await recordObservabilityEvent({
        type: "industry.period.closed",
        actorId: learner.id,
        actorRole: learner.role,
        entityId: payload.periodId,
        summary: "Learner completed an industry close-calendar period.",
        metadata: {
          industryId: payload.industryId,
          closedPeriods: progress.completedPeriodIds.length,
        },
      });
      return NextResponse.json({ progress });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Journey update failed." },
      { status: 409 },
    );
  }
}
