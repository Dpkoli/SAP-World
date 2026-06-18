import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import {
  getObservabilitySnapshot,
  recordObservabilityEvent,
} from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  await recordObservabilityEvent({
    type: "admin.observability.checked",
    actorId: auth.learner.id,
    actorRole: "admin",
    entityId: "observability",
    summary: "Admin reviewed the observability event stream.",
  });

  return NextResponse.json(await getObservabilitySnapshot());
}
