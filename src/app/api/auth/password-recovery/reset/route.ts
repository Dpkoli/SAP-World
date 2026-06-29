import { NextResponse } from "next/server";

import { resetPassword } from "@/server/auth-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
    password?: unknown;
  } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (
    token.length < 32 ||
    password.length < 10 ||
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return NextResponse.json(
      { error: "Use a valid recovery link and a 10+ character password with a letter and number." },
      { status: 400 },
    );
  }

  const user = await resetPassword(token, password);
  if (!user) {
    return NextResponse.json(
      { error: "This recovery link is invalid, expired, or already used." },
      { status: 400 },
    );
  }
  await recordObservabilityEvent({
    type: "auth.password-recovery.completed",
    actorId: user.id,
    actorRole: user.role,
    entityId: "password-recovery",
    summary: "A learner completed password recovery.",
  });
  return NextResponse.json({ message: "Password updated. Sign in with your new password." });
}
