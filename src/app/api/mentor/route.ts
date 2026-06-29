import { NextResponse } from "next/server";
import { normalizeLearnerProgress } from "@/data/progress";
import { processScenarios } from "@/data/simulation";
import { answerMentorQuestion } from "@/server/mentor-service";
import {
  getMentorConversation,
  recordMentorExchange,
  recordMentorFeedback,
} from "@/server/mentor-conversation-repository";
import { enhanceMentorResponse } from "@/server/mentor-provider";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import { getTutorCapstonePortfolio } from "@/server/tutor-capstone-repository";
import { buildTutorReadinessReview } from "@/server/tutor-readiness-service";

export const runtime = "nodejs";

function validScenarioId(value: unknown) {
  return typeof value === "string" &&
    processScenarios.some((scenario) => scenario.id === value)
    ? value
    : "p2p";
}

export async function GET(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const scenarioId = validScenarioId(new URL(request.url).searchParams.get("scenarioId"));
  return NextResponse.json({
    conversation: await getMentorConversation(learner.id, scenarioId),
  });
}

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
  const scenarioId = validScenarioId(input.scenarioId);
  const step =
    typeof input.step === "number" && Number.isInteger(input.step)
      ? Math.max(0, input.step)
      : null;

  const progress =
    (await getLearnerProgress(learner.id)) ??
    normalizeLearnerProgress(learner.id, null);
  const readiness = buildTutorReadinessReview(progress);
  const capstones = await getTutorCapstonePortfolio(learner.id, progress);
  const guidedEvidenceTotal = Object.values(progress.guidedEvidence).reduce(
    (total, notes) => total + Object.keys(notes).length,
    0,
  );
  const portfolio = {
    readinessScore: readiness.overall.score,
    readinessLevel: readiness.overall.level,
    completedLessons: readiness.overall.completedLessons,
    completedDiagnostics: readiness.overall.completedDiagnostics,
    guidedEvidenceNotes: guidedEvidenceTotal,
    capstoneSubmissions: capstones.submissions.total,
    reviewReadyCapstones: capstones.submissions.reviewReady,
    nextBestActions: readiness.nextBestActions,
    processes: readiness.processes.map((process) => {
      const capstone = capstones.challenges.find(
        (challenge) => challenge.scenarioId === process.scenarioId,
      );
      const scenario = processScenarios.find(
        (item) => item.id === process.scenarioId,
      );
      const guidedEvidence = progress.guidedEvidence[process.scenarioId] ?? {};
      const missingEvidenceSteps =
        scenario?.tutorSteps
          .map((step, index) => ({
            step: step.number,
            title: step.title,
            current: index === progress.scenarios[process.scenarioId].step,
          }))
          .filter((_, index) => !guidedEvidence[index])
          .slice(0, 3) ?? [];
      return {
        scenarioId: process.scenarioId,
        processCode: process.processCode,
        title: process.title,
        readinessScore: process.score,
        readinessLevel: process.level,
        guidedProgress: process.guidedProgress,
        diagnosticProgress: process.diagnosticProgress,
        evidenceProgress: process.evidenceProgress,
        guidedEvidenceNotes: Object.keys(guidedEvidence).length,
        missingEvidenceSteps,
        nextAction:
          capstone?.latestSubmission?.status === "Strong evidence"
            ? "Use this process as a reference while practicing weaker areas."
            : process.nextAction,
        weakAreas: process.weakAreas,
        latestCapstoneScore: capstone?.latestSubmission?.score ?? null,
        latestCapstoneStatus: capstone?.latestSubmission?.status ?? null,
      };
    }),
  };

  const localResponse = answerMentorQuestion({
    question,
    scenarioId,
    step: step ?? undefined,
    portfolio,
  });

  const mentorResponse = await enhanceMentorResponse({ question, localResponse });
  const persisted = await recordMentorExchange({
    learnerId: learner.id,
    scenarioId,
    step,
    question,
    response: mentorResponse,
  });
  await recordObservabilityEvent({
    type: "mentor.question",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: scenarioId,
    status: mentorResponse.fallbackReason ? "warning" : "success",
    summary: "Learner received a grounded SAP Mentor answer.",
    metadata: {
      provider: mentorResponse.provider ?? "local",
      model: mentorResponse.model ?? null,
      sources: mentorResponse.sources.length,
      fallback: Boolean(mentorResponse.fallbackReason),
      quality: persisted.exchange.quality.status,
    },
  });

  return NextResponse.json({
    ...mentorResponse,
    conversation: persisted.conversation,
    exchange: persisted.exchange,
  });
}

export async function PATCH(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const input = (await request.json().catch(() => null)) as {
    messageId?: unknown;
    rating?: unknown;
    note?: unknown;
  } | null;
  if (
    !input ||
    typeof input.messageId !== "string" ||
    (input.rating !== "helpful" && input.rating !== "needs-review") ||
    (input.note !== undefined && typeof input.note !== "string")
  ) {
    return NextResponse.json(
      { error: "Choose a valid mentor response and feedback rating." },
      { status: 400 },
    );
  }
  const conversation = await recordMentorFeedback({
    learnerId: learner.id,
    messageId: input.messageId,
    rating: input.rating,
    note: typeof input.note === "string" ? input.note.trim() : "",
  });
  if (!conversation) {
    return NextResponse.json(
      { error: "Mentor response not found." },
      { status: 404 },
    );
  }
  await recordObservabilityEvent({
    type: "mentor.feedback",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: input.messageId,
    status: input.rating === "helpful" ? "success" : "warning",
    summary: "Learner rated a persisted mentor response.",
    metadata: { rating: input.rating },
  });
  return NextResponse.json({ conversation });
}
