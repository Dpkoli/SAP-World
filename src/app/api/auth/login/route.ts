import { NextResponse } from "next/server";
import { verifyLearner } from "@/server/auth-repository";
import { startLearnerSession } from "@/server/auth-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let input: { email?: unknown; password?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const email = typeof input.email === "string" ? input.email : "";
  const password = typeof input.password === "string" ? input.password : "";
  const user = await verifyLearner(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  await startLearnerSession(user.id);
  return NextResponse.json({ user });
}
