import { NextResponse } from "next/server";

import { getAuthAdministrationSnapshot } from "@/server/auth-repository";
import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";
import { getStorageHealth } from "@/server/durable-store";
import { getEnterpriseIdentityProviderStatus } from "@/server/enterprise-identity-provider";
import { getPlatformLedgerAnalytics } from "@/server/ledger-analytics-repository";
import { getMentorProviderStatus } from "@/server/mentor-provider";
import { recordObservabilityEvent } from "@/server/observability-repository";
import { getOperationsReadiness } from "@/server/operations-readiness-service";
import { getReleaseGovernance } from "@/server/release-governance-repository";
import {
  getReleaseOperationsSnapshot,
  requestReleaseOperation,
  type ReleaseOperationAction,
} from "@/server/release-operations-repository";

export const runtime = "nodejs";

async function currentGovernance() {
  const [storage, ledgerAnalytics, accounts] = await Promise.all([
    getStorageHealth(),
    getPlatformLedgerAnalytics(),
    getAuthAdministrationSnapshot(),
  ]);
  const readiness = getOperationsReadiness({
    storage,
    ledgerAnalytics,
    mentor: getMentorProviderStatus(),
    contentControl: getContentControlRegister(),
    accounts,
    identityProvider: getEnterpriseIdentityProviderStatus(),
  });
  return getReleaseGovernance(readiness);
}

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json(await getReleaseOperationsSnapshot());
}

export async function POST(request: Request) {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    target?: unknown;
    note?: unknown;
  } | null;
  const actions: ReleaseOperationAction[] = ["Promote", "Rollback"];
  if (
    !body ||
    typeof body.action !== "string" ||
    !actions.includes(body.action as ReleaseOperationAction) ||
    typeof body.target !== "string" ||
    typeof body.note !== "string"
  ) {
    return NextResponse.json(
      { error: "Enter a valid promotion or rollback request." },
      { status: 400 },
    );
  }
  try {
    const operation = await requestReleaseOperation({
      action: body.action as ReleaseOperationAction,
      target: body.target,
      note: body.note,
      admin: auth.learner,
      governance: await currentGovernance(),
    });
    await recordObservabilityEvent({
      type:
        operation.action === "Promote"
          ? "admin.release.promotion"
          : "admin.release.rollback",
      actorId: auth.learner.id,
      actorRole: "admin",
      entityId: operation.id,
      status: operation.status === "Failed" ? "failure" : "warning",
      summary: `Admin requested production release action: ${operation.action}.`,
      metadata: {
        operationStatus: operation.status,
        readinessFingerprint: operation.readinessFingerprint,
      },
    });
    return NextResponse.json({
      operation,
      snapshot: await getReleaseOperationsSnapshot(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to request release operation.",
      },
      { status: 400 },
    );
  }
}
