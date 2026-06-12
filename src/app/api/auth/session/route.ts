import { NextResponse } from "next/server";
import {
  endLearnerSession,
  getCurrentLearner,
} from "@/server/auth-session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentLearner();
  return NextResponse.json({ authenticated: Boolean(user), user });
}

export async function DELETE() {
  await endLearnerSession();
  return NextResponse.json({ authenticated: false, user: null });
}
