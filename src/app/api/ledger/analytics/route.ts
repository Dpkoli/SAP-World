import { NextRequest, NextResponse } from "next/server";

import {
  getLearnerLedgerAnalytics,
  isSimulationLedgerProcess,
} from "@/server/ledger-analytics-repository";
import { getCurrentLearner } from "@/server/auth-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const process = request.nextUrl.searchParams.get("process");
  if (process && !isSimulationLedgerProcess(process)) {
    return NextResponse.json(
      { error: "Select a valid ledger process." },
      { status: 400 },
    );
  }

  const snapshot = await getLearnerLedgerAnalytics(learner.id);
  return NextResponse.json({
    ...snapshot,
    filter: {
      process: process ?? "All",
    },
    selectedProcess:
      process && isSimulationLedgerProcess(process)
        ? snapshot.byProcess[process]
        : null,
  });
}
