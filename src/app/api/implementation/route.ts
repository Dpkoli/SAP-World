import { NextRequest, NextResponse } from "next/server";
import { implementationBlueprints } from "@/data/implementation";
import { isScenarioId } from "@/data/progress";

export function GET(request: NextRequest) {
  const requestedId = request.nextUrl.searchParams.get("id");
  if (requestedId && !isScenarioId(requestedId)) {
    return NextResponse.json(
      {
        error: "Unknown process identifier.",
        available: implementationBlueprints.map(
          (blueprint) => blueprint.scenarioId,
        ),
      },
      { status: 400 },
    );
  }

  const blueprints = requestedId
    ? implementationBlueprints.filter(
        (blueprint) => blueprint.scenarioId === requestedId,
      )
    : implementationBlueprints;

  return NextResponse.json({
    total: blueprints.length,
    blueprints,
  });
}
