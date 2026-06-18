import { NextResponse } from "next/server";

import { getCurrentLearner } from "@/server/auth-session";
import {
  appendSimulationStep,
  getSimulationExecution,
} from "@/server/simulation-execution-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ simulationId: string }> },
) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { simulationId } = await params;
  const execution = await getSimulationExecution(learner.id, simulationId);
  if (!execution) {
    return NextResponse.json(
      { error: "Generated simulation not found." },
      { status: 404 },
    );
  }
  return NextResponse.json({ execution });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ simulationId: string }> },
) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let input: {
    expectedVersion?: unknown;
    step?: unknown;
    note?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter valid execution evidence." },
      { status: 400 },
    );
  }

  const note = typeof input.note === "string" ? input.note.trim() : "";
  if (
    !Number.isInteger(input.expectedVersion) ||
    !Number.isInteger(input.step) ||
    note.length < 5 ||
    note.length > 500
  ) {
    return NextResponse.json(
      {
        error:
          "Version, current step, and evidence note between 5 and 500 characters are required.",
      },
      { status: 400 },
    );
  }

  const { simulationId } = await params;
  try {
    const execution = await appendSimulationStep({
      learnerId: learner.id,
      actor: learner.name,
      simulationId,
      expectedVersion: input.expectedVersion as number,
      step: input.step as number,
      note,
    });
    await recordObservabilityEvent({
      type: "simulation.step.completed",
      actorId: learner.id,
      actorRole: learner.role,
      entityId: simulationId,
      summary: "Learner completed a generated simulation step.",
      metadata: {
        step: input.step as number,
        version: execution.version,
        status: execution.status,
      },
    });
    return NextResponse.json({ execution });
  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json(
      { error: message },
      { status: message.includes("not found") ? 404 : 409 },
    );
  }
}
