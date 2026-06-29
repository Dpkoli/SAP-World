import { NextResponse } from "next/server";

import { rolePermissions, type UserRole } from "@/data/auth";
import {
  getAuthAdministrationSnapshot,
  updateManagedAccount,
} from "@/server/auth-repository";
import { requireLearnerRole } from "@/server/auth-session";
import { getEnterpriseIdentityProviderStatus } from "@/server/enterprise-identity-provider";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

async function snapshot() {
  return {
    generatedAt: new Date().toISOString(),
    provider: getEnterpriseIdentityProviderStatus(),
    permissions: rolePermissions,
    accounts: await getAuthAdministrationSnapshot(),
  };
}

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json(await snapshot());
}

export async function PATCH(request: Request) {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as {
    userId?: unknown;
    action?: unknown;
    role?: unknown;
  } | null;
  const validActions = ["set-role", "suspend", "reactivate"] as const;
  const validRoles: UserRole[] = ["learner", "admin"];
  if (
    !body ||
    typeof body.userId !== "string" ||
    typeof body.action !== "string" ||
    !validActions.includes(body.action as (typeof validActions)[number]) ||
    (body.action === "set-role" &&
      (typeof body.role !== "string" ||
        !validRoles.includes(body.role as UserRole)))
  ) {
    return NextResponse.json(
      { error: "Choose a valid account lifecycle action." },
      { status: 400 },
    );
  }

  try {
    await updateManagedAccount({
      admin: auth.learner,
      userId: body.userId,
      action: body.action as (typeof validActions)[number],
      role: body.role as UserRole | undefined,
    });
    await recordObservabilityEvent({
      type: "admin.identity.changed",
      actorId: auth.learner.id,
      actorRole: "admin",
      entityId: body.userId,
      status: body.action === "suspend" ? "warning" : "success",
      summary: `Admin completed managed identity action: ${body.action}.`,
      metadata: {
        action: body.action,
        role: typeof body.role === "string" ? body.role : null,
      },
    });
    return NextResponse.json(await snapshot());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update managed identity.",
      },
      { status: 400 },
    );
  }
}
