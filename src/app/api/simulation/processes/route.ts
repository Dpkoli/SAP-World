import { NextRequest, NextResponse } from "next/server";
import { processScenarios } from "@/data/simulation";

export function GET(request: NextRequest) {
  const requestedId = request.nextUrl.searchParams.get("id");
  const processes = requestedId
    ? processScenarios.filter((process) => process.id === requestedId)
    : processScenarios;

  return NextResponse.json({
    total: processes.length,
    available: processScenarios.map((process) => process.id),
    processes,
  });
}
