import { NextResponse } from "next/server";

import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  return NextResponse.json(getContentControlRegister());
}
