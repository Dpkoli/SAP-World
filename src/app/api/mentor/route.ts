import { NextResponse } from "next/server";
import { answerMentorQuestion } from "@/server/mentor-service";
import { enhanceMentorResponse } from "@/server/mentor-provider";
import { getCurrentLearner } from "@/server/auth-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let input: { question?: unknown; scenarioId?: unknown; step?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid question." }, { status: 400 });
  }

  const question =
    typeof input.question === "string" ? input.question.trim() : "";
  if (question.length < 3 || question.length > 500) {
    return NextResponse.json(
      { error: "Question must contain between 3 and 500 characters." },
      { status: 400 },
    );
  }

  const localResponse = answerMentorQuestion({
    question,
    scenarioId: input.scenarioId,
    step: input.step,
  });

  return NextResponse.json(
    await enhanceMentorResponse({ question, localResponse }),
  );
}
