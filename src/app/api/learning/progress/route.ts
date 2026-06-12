import { NextRequest, NextResponse } from "next/server";
import {
  getLearnerProgress,
  saveLearnerProgress,
} from "@/server/progress-repository";

export const runtime = "nodejs";

function getLearnerId(request: NextRequest) {
  const learnerId =
    request.nextUrl.searchParams.get("learner")?.trim() ?? "deepa-koli";
  return /^[a-z0-9-]{3,64}$/.test(learnerId) ? learnerId : null;
}

export async function GET(request: NextRequest) {
  const learnerId = getLearnerId(request);
  if (!learnerId) {
    return NextResponse.json(
      { error: "Invalid learner identifier." },
      { status: 400 },
    );
  }

  const progress = await getLearnerProgress(learnerId);
  return NextResponse.json({
    learnerId,
    found: Boolean(progress),
    progress,
    storage: "local-json",
  });
}

export async function PUT(request: NextRequest) {
  const learnerId = getLearnerId(request);
  if (!learnerId) {
    return NextResponse.json(
      { error: "Invalid learner identifier." },
      { status: 400 },
    );
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

  const progress = await saveLearnerProgress(learnerId, payload);
  return NextResponse.json({
    learnerId,
    progress,
    storage: "local-json",
  });
}
