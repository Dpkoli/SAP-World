import { NextResponse } from "next/server";
import { processScenarios } from "@/data/simulation";
import {
  getLearnerProgress,
  saveLearnerProgress,
} from "@/server/progress-repository";
import { getCurrentLearner } from "@/server/auth-session";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

function guidedEvidenceCount(
  progress: Awaited<ReturnType<typeof getLearnerProgress>>,
) {
  return Object.values(progress?.guidedEvidence ?? {}).reduce(
    (total, notes) => total + Object.keys(notes).length,
    0,
  );
}

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

  const previousProgress = await getLearnerProgress(learner.id);
  const progress = await saveLearnerProgress(learner.id, payload);
  const previousScenario =
    previousProgress?.scenarios[progress.activeScenarioId] ?? null;
  const currentScenario = progress.scenarios[progress.activeScenarioId];
  const previousEvidenceCount = guidedEvidenceCount(previousProgress);
  const currentEvidenceCount = guidedEvidenceCount(progress);
  const activeScenario = processScenarios.find(
    (scenario) => scenario.id === progress.activeScenarioId,
  );
  const meaningfulChange =
    previousProgress?.activeScenarioId !== progress.activeScenarioId ||
    previousScenario?.step !== currentScenario.step ||
    previousScenario?.complete !== currentScenario.complete ||
    previousEvidenceCount !== currentEvidenceCount;

  if (meaningfulChange) {
    await recordObservabilityEvent({
      type: "tutor.guided.progress.saved",
      actorId: learner.id,
      actorRole: learner.role,
      entityId: progress.activeScenarioId,
      summary: "Learner saved guided SAP tutor progress.",
      metadata: {
        processCode: activeScenario?.code ?? progress.activeScenarioId,
        step: currentScenario.step + 1,
        complete: currentScenario.complete,
        guidedEvidenceNotes: currentEvidenceCount,
      },
    });
  }

  return NextResponse.json({
    learnerId: learner.id,
    progress,
    storage: "local-json",
  });
}
