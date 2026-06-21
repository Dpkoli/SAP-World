import { NextResponse } from "next/server";
import { normalizeLearnerProgress } from "@/data/progress";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getLearnerProgress } from "@/server/progress-repository";
import { getTutorCapstonePortfolio } from "@/server/tutor-capstone-repository";
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
  const readiness = buildTutorReadinessReview(progress);
  const capstones = await getTutorCapstonePortfolio(learner.id, progress);

  const processes = readiness.processes.map((process) => {
    const capstone = capstones.challenges.find(
      (challenge) => challenge.scenarioId === process.scenarioId,
    );
    return {
      scenarioId: process.scenarioId,
      processCode: process.processCode,
      title: process.title,
      module: process.module,
      readinessScore: process.score,
      readinessLevel: process.level,
      guidedProgress: process.guidedProgress,
      diagnosticProgress: process.diagnosticProgress,
      capstoneStatus: capstone?.status ?? "Locked",
      latestCapstoneScore: capstone?.latestSubmission?.score ?? null,
      latestCapstoneStatus: capstone?.latestSubmission?.status ?? null,
      evidence: [
        ...process.evidence,
        capstone?.latestSubmission
          ? `Latest capstone evidence scored ${capstone.latestSubmission.score}/100 as ${capstone.latestSubmission.status}.`
          : "No capstone evidence submitted yet.",
      ],
      nextAction:
        capstone?.latestSubmission?.status === "Strong evidence"
          ? "Use this process as a reference while practicing weaker areas."
          : process.nextAction,
    };
  });

  const badges = [
    readiness.overall.completedLessons >= 1 ? "Guided transaction starter" : null,
    readiness.overall.completedLessons === readiness.overall.processes
      ? "Guided process finisher"
      : null,
    readiness.overall.completedDiagnostics >= 1 ? "Exception analyst" : null,
    capstones.submissions.reviewReady >= 1 ? "Capstone evidence ready" : null,
    capstones.challenges.some(
      (challenge) => challenge.latestSubmission?.status === "Strong evidence",
    )
      ? "Strong SAP evidence"
      : null,
  ].filter((badge): badge is string => Boolean(badge));

  const portfolio = {
    learnerId: learner.id,
    generatedAt: new Date().toISOString(),
    summary: {
      readinessScore: readiness.overall.score,
      readinessLevel: readiness.overall.level,
      completedLessons: readiness.overall.completedLessons,
      completedDiagnostics: readiness.overall.completedDiagnostics,
      capstoneSubmissions: capstones.submissions.total,
      reviewReadyCapstones: capstones.submissions.reviewReady,
      badges,
    },
    nextBestActions: readiness.nextBestActions,
    processes,
  };

  await recordObservabilityEvent({
    type: "tutor.portfolio.checked",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: progress.activeScenarioId,
    summary: "Learner reviewed SAP tutor evidence portfolio.",
    metadata: {
      readinessScore: portfolio.summary.readinessScore,
      capstoneSubmissions: portfolio.summary.capstoneSubmissions,
      badges: portfolio.summary.badges.length,
    },
  });

  return NextResponse.json(portfolio);
}
