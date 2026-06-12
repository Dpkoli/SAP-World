import { NextResponse } from "next/server";
import {
  getLearnerProgress,
  saveLearnerProgress,
} from "@/server/progress-repository";
import { getCurrentLearner } from "@/server/auth-session";

export const runtime = "nodejs";

export async function GET() {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const progress = await getLearnerProgress(learner.id);
  return NextResponse.json({
    learnerId: learner.id,
    found: Boolean(progress),
    progress,
    storage: "local-json",
  });
}

export async function PUT(request: Request) {
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

  const progress = await saveLearnerProgress(learner.id, payload);
  return NextResponse.json({
    learnerId: learner.id,
    progress,
    storage: "local-json",
  });
}
