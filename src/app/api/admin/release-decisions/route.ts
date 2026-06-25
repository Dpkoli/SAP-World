import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";
import { getStorageHealth } from "@/server/durable-store";
import { getPlatformLedgerAnalytics } from "@/server/ledger-analytics-repository";
import { getMentorProviderStatus } from "@/server/mentor-provider";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getOperationsReadiness } from "@/server/operations-readiness-service";
import {
  getReleaseGovernance,
  recordReleaseDecision,
  type ReleaseDecisionType,
} from "@/server/release-governance-repository";

export const runtime = "nodejs";

async function loadReadiness() {
  const [storage, ledgerAnalytics] = await Promise.all([
    getStorageHealth(),
    getPlatformLedgerAnalytics(),
  ]);
  return getOperationsReadiness({
    storage,
    ledgerAnalytics,
    mentor: getMentorProviderStatus(),
    contentControl: getContentControlRegister(),
  });
}

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const readiness = await loadReadiness();
  return NextResponse.json(await getReleaseGovernance(readiness));
}

export async function POST(request: Request) {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as {
    decision?: ReleaseDecisionType;
    note?: string;
  } | null;
  const validDecisions: ReleaseDecisionType[] = [
    "Approved",
    "Warnings accepted",
    "Rejected",
  ];
  if (
    !body ||
    !body.decision ||
    !validDecisions.includes(body.decision) ||
    typeof body.note !== "string"
  ) {
    return NextResponse.json(
      { error: "Enter a valid release decision and owner note." },
      { status: 400 },
    );
  }

  const readiness = await loadReadiness();
  try {
    const governance = await recordReleaseDecision({
      readiness,
      admin: auth.learner,
      decision: body.decision,
      note: body.note,
    });
    await recordObservabilityEvent({
      type: "admin.release.decision",
      actorId: auth.learner.id,
      actorRole: "admin",
      entityId: governance.readinessFingerprint,
      status: body.decision === "Rejected" ? "warning" : "success",
      summary: `Admin recorded release decision: ${body.decision}.`,
      metadata: {
        decision: body.decision,
        readinessStatus: readiness.status,
        warnings: readiness.summary.warnings,
        failed: readiness.summary.failed,
      },
    });
    return NextResponse.json(governance);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the release decision.",
      },
      { status: 400 },
    );
  }
}
