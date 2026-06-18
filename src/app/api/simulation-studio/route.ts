import { NextRequest, NextResponse } from "next/server";

import {
  simulationFiscalYears,
  type SimulationFiscalYear,
} from "@/data/generated-simulations";
import { isIndustryId } from "@/data/industries";
import { industryBlueprintById } from "@/data/industry-blueprints";
import { getCurrentLearner } from "@/server/auth-session";
import {
  getGeneratedSimulations,
  saveGeneratedSimulation,
} from "@/server/generated-simulation-repository";
import {
  getSimulationExecution,
  getSimulationExecutionMap,
} from "@/server/simulation-execution-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const industry = request.nextUrl.searchParams.get("industry");
  const year = request.nextUrl.searchParams.get("year");
  let simulations = await getGeneratedSimulations(learner.id);
  const executionMap = await getSimulationExecutionMap(learner.id);

  if (industry) {
    simulations = simulations.filter(
      (simulation) => simulation.industryId === industry,
    );
  }
  if (year) {
    simulations = simulations.filter(
      (simulation) => simulation.fiscalYear === year,
    );
  }

  return NextResponse.json({
    total: simulations.length,
    simulations: simulations.map((simulation) => ({
      ...simulation,
      execution: executionMap[simulation.id],
    })),
  });
}

export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let input: {
    industryId?: unknown;
    fiscalYear?: unknown;
    eventIndex?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter a valid simulation request." },
      { status: 400 },
    );
  }

  if (
    !isIndustryId(input.industryId) ||
    !simulationFiscalYears.includes(input.fiscalYear as SimulationFiscalYear) ||
    !Number.isInteger(input.eventIndex)
  ) {
    return NextResponse.json(
      { error: "Industry, fiscal year, and event template are required." },
      { status: 400 },
    );
  }

  const blueprint = industryBlueprintById(input.industryId);
  const eventIndex = input.eventIndex as number;
  if (eventIndex < 0 || eventIndex >= blueprint.commonProblems.length) {
    return NextResponse.json(
      { error: "Select a valid event template for this industry." },
      { status: 400 },
    );
  }

  const simulation = await saveGeneratedSimulation(learner.id, {
    industryId: input.industryId,
    fiscalYear: input.fiscalYear as SimulationFiscalYear,
    eventIndex,
  });
  const execution = await getSimulationExecution(learner.id, simulation.id);
  await recordObservabilityEvent({
    type: "simulation.generated",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: simulation.id,
    summary: "Learner generated or reused an industry simulation.",
    metadata: {
      industryId: simulation.industryId,
      fiscalYear: simulation.fiscalYear,
      eventIndex: simulation.eventIndex,
      signature: simulation.signature.slice(0, 12),
    },
  });

  return NextResponse.json(
    { simulation: { ...simulation, execution: execution! } },
    { status: 201 },
  );
}
