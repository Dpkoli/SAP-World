import { NextRequest, NextResponse } from "next/server";

import { getCurrentLearner } from "@/server/auth-session";
import {
  completeAdvancedTransactionStep,
  getAdvancedTransactions,
} from "@/server/advanced-transaction-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentLearner();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const transactions = await getAdvancedTransactions(user.id);
  const type = request.nextUrl.searchParams.get("type");
  const id = request.nextUrl.searchParams.get("id");
  const filtered = transactions.filter(
    (transaction) =>
      (!type || transaction.type === type) && (!id || transaction.id === id),
  );

  return NextResponse.json({
    total: filtered.length,
    completed: filtered.filter(
      (transaction) => transaction.status === "Completed",
    ).length,
    inProgress: filtered.filter(
      (transaction) => transaction.status === "In progress",
    ).length,
    transactions: filtered,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentLearner();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    transactionId?: string;
    step?: number;
    note?: string;
  };
  const transactionId = body.transactionId?.trim();
  const note = body.note?.trim();

  if (
    !transactionId ||
    !Number.isInteger(body.step) ||
    !note ||
    note.length < 5 ||
    note.length > 500
  ) {
    return NextResponse.json(
      {
        error:
          "Transaction, step, and an evidence note between 5 and 500 characters are required.",
      },
      { status: 400 },
    );
  }

  try {
    const transaction = await completeAdvancedTransactionStep(
      user.id,
      transactionId,
      body.step as number,
      note,
    );
    await recordObservabilityEvent({
      type: "advanced.step.completed",
      actorId: user.id,
      actorRole: user.role,
      entityId: transaction.id,
      summary: "Learner completed an advanced transaction step.",
      metadata: {
        step: body.step as number,
        type: transaction.type,
        status: transaction.status,
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      {
        status: (error as Error).message.includes("not found") ? 404 : 409,
      },
    );
  }
}
