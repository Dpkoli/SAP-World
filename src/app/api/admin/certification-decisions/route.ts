import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import {
  getCertificationReview,
  recordCertificationDecision,
  type CertificationDecisionType,
} from "@/server/certification-review-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json(await getCertificationReview());
}

export async function POST(request: Request) {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as {
    certificateId?: unknown;
    processCode?: unknown;
    decision?: unknown;
    note?: unknown;
  } | null;
  const validDecisions: CertificationDecisionType[] = [
    "Approved",
    "Rejected",
    "Revision requested",
  ];
  if (
    !body ||
    typeof body.certificateId !== "string" ||
    typeof body.processCode !== "string" ||
    typeof body.decision !== "string" ||
    !validDecisions.includes(body.decision as CertificationDecisionType) ||
    (body.note !== undefined && typeof body.note !== "string")
  ) {
    return NextResponse.json(
      { error: "Enter a valid certificate, process, and assessor decision." },
      { status: 400 },
    );
  }

  try {
    const review = await recordCertificationDecision({
      admin: auth.learner,
      certificateId: body.certificateId,
      processCode: body.processCode,
      decision: body.decision as CertificationDecisionType,
      note: body.note ?? "",
    });
    await recordObservabilityEvent({
      type: "admin.certification.decision",
      actorId: auth.learner.id,
      actorRole: "admin",
      entityId: body.certificateId,
      status: body.decision === "Approved" ? "success" : "warning",
      summary: `Admin recorded certification decision: ${body.decision}.`,
      metadata: {
        certificateId: body.certificateId,
        processCode: body.processCode,
        decision: body.decision,
      },
    });
    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the certification decision.",
      },
      { status: 400 },
    );
  }
}
