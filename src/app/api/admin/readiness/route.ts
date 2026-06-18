import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";
import { getStorageHealth } from "@/server/durable-store";
import { getPlatformLedgerAnalytics } from "@/server/ledger-analytics-repository";
import { getMentorProviderStatus } from "@/server/mentor-provider";
import { recordObservabilityEvent } from "@/server/observability-repository";
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

  const readiness = getOperationsReadiness({
    storage,
    mentor: getMentorProviderStatus(),
    ledgerAnalytics,
    contentControl: getContentControlRegister(),
  });
  const eventStatus =
    readiness.summary.failed > 0
      ? "failure"
      : readiness.summary.warnings > 0
        ? "warning"
        : "success";
  await recordObservabilityEvent({
    type: "admin.readiness.checked",
    actorId: auth.learner.id,
    actorRole: "admin",
    entityId: "operations-readiness",
    status: eventStatus,
    summary: "Admin reviewed the production readiness gate.",
    metadata: {
      status: readiness.status,
      passed: readiness.summary.passed,
      warnings: readiness.summary.warnings,
      failed: readiness.summary.failed,
    },
  });

  return NextResponse.json(readiness);
}
