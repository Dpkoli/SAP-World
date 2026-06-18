import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";
import { getStorageHealth } from "@/server/durable-store";
import { getPlatformLedgerAnalytics } from "@/server/ledger-analytics-repository";
import { getMentorProviderStatus } from "@/server/mentor-provider";
import { getOperationsReadiness } from "@/server/operations-readiness-service";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const [storage, ledgerAnalytics] = await Promise.all([
    getStorageHealth(),
    getPlatformLedgerAnalytics(),
  ]);

  return NextResponse.json(
    getOperationsReadiness({
      storage,
      mentor: getMentorProviderStatus(),
      ledgerAnalytics,
      contentControl: getContentControlRegister(),
    }),
  );
}
