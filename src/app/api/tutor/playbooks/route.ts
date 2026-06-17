import { NextRequest, NextResponse } from "next/server";
import {
  transactionPlaybookFor,
  transactionPlaybooks,
} from "@/data/transaction-playbooks";
import { getCurrentLearner } from "@/server/auth-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const scenarioId = request.nextUrl.searchParams.get("scenarioId");
  const playbooks = scenarioId
    ? [transactionPlaybookFor(scenarioId)].filter(Boolean)
    : transactionPlaybooks;

  if (scenarioId && playbooks.length === 0) {
    return NextResponse.json(
      {
        error: "Transaction playbook not found.",
        available: transactionPlaybooks.map((playbook) => playbook.scenarioId),
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    total: playbooks.length,
    available: transactionPlaybooks.map((playbook) => playbook.scenarioId),
    playbooks,
  });
}
