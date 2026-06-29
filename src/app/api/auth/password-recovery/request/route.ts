import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/server/auth-repository";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!isValidEmail(email) || email.length > 160) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const recovery = await requestPasswordReset(email);
  if (recovery) {
    const resetUrl = new URL(
      `/reset-password/${encodeURIComponent(recovery.token)}`,
      request.url,
    );
    const webhook = process.env.SAP_WORLD_PASSWORD_RESET_WEBHOOK_URL?.trim();
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.SAP_WORLD_PASSWORD_RESET_WEBHOOK_SECRET
            ? {
                Authorization: `Bearer ${process.env.SAP_WORLD_PASSWORD_RESET_WEBHOOK_SECRET}`,
              }
            : {}),
        },
        body: JSON.stringify({
          recipient: recovery.email,
          name: recovery.name,
          resetUrl: resetUrl.toString(),
          expiresAt: recovery.expiresAt,
        }),
      }).catch(() => undefined);
    }
    await recordObservabilityEvent({
      type: "auth.password-recovery.requested",
      actorId: recovery.userId,
      actorRole: "learner",
      entityId: "password-recovery",
      summary: "A password recovery token was requested.",
    });
  }

  return NextResponse.json({
    message:
      "If an active account matches that email, password recovery instructions are available.",
    developmentToken:
      process.env.NODE_ENV !== "production" ? recovery?.token ?? null : null,
  });
}
