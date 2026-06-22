import { NextResponse } from "next/server";
import { normalizeLearnerProgress } from "@/data/progress";
import { processScenarios } from "@/data/simulation";
import { answerMentorQuestion } from "@/server/mentor-service";
import { enhanceMentorResponse } from "@/server/mentor-provider";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import { getTutorCapstonePortfolio } from "@/server/tutor-capstone-repository";
import { buildTutorReadinessReview } from "@/server/tutor-readiness-service";

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
    scenarioId: input.scenarioId,
    step: input.step,
    portfolio,
  });

  const mentorResponse = await enhanceMentorResponse({ question, localResponse });
  await recordObservabilityEvent({
    type: "mentor.question",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: String(input.scenarioId ?? "p2p"),
    status: mentorResponse.fallbackReason ? "warning" : "success",
    summary: "Learner received a grounded SAP Mentor answer.",
    metadata: {
      provider: mentorResponse.provider ?? "local",
      model: mentorResponse.model ?? null,
      sources: mentorResponse.sources.length,
      fallback: Boolean(mentorResponse.fallbackReason),
    },
  });

  return NextResponse.json(mentorResponse);
}
