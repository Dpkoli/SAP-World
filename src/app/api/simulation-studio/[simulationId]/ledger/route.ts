import { NextRequest, NextResponse } from "next/server";

import {
  simulationFiscalYears,
  type SimulationFiscalYear,
} from "@/data/generated-simulations";
import {
  simulationLedgerProcesses,
  type SimulationLedgerProcess,
} from "@/data/simulation-ledger";
import { getCurrentLearner } from "@/server/auth-session";
import { generateEnterpriseLedger } from "@/server/enterprise-ledger-generator";
import { getGeneratedSimulation } from "@/server/generated-simulation-repository";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> },
) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { simulationId } = await params;
  const simulation = await getGeneratedSimulation(learner.id, simulationId);
  if (!simulation) {
    return NextResponse.json(
      { error: "Generated simulation not found." },
      { status: 404 },
    );
  }

  const year = request.nextUrl.searchParams.get("year");
  const process = request.nextUrl.searchParams.get("process");
  if (
    (year &&
      !simulationFiscalYears.includes(year as SimulationFiscalYear)) ||
    (process &&
      !simulationLedgerProcesses.includes(
        process as SimulationLedgerProcess,
      ))
  ) {
    return NextResponse.json(
      { error: "Select a valid fiscal year and process." },
      { status: 400 },
    );
  }

  const ledger = generateEnterpriseLedger(simulation);
  const documents = ledger.documents.filter(
    (document) =>
      (!year || document.fiscalYear === year) &&
      (!process || document.process === process),
  );

  return NextResponse.json({
    summary: ledger.summary,
    total: documents.length,
    filters: {
      year: year ?? "All",
      process: process ?? "All",
    },
    documents,
  });
}
