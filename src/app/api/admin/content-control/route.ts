import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const register = getContentControlRegister();
  await recordObservabilityEvent({
    type: "admin.content.checked",
    actorId: auth.learner.id,
    actorRole: "admin",
    entityId: "content-control",
    status: register.summary.blocked > 0 ? "failure" : "success",
    summary: "Admin reviewed the controlled content register.",
    metadata: {
      domains: register.summary.domains,
      released: register.summary.released,
      blocked: register.summary.blocked,
      averageReadiness: register.summary.averageReadiness,
    },
  });

  return NextResponse.json(register);
}
