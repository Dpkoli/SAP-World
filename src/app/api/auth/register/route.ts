import { NextResponse } from "next/server";
import { createLearner } from "@/server/auth-repository";
import { startLearnerSession } from "@/server/auth-session";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let input: { name?: unknown; email?: unknown; password?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter valid account details." }, { status: 400 });
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (!isValidEmail(email) || email.length > 160) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (
    password.length < 10 ||
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return NextResponse.json(
      { error: "Use at least 10 characters with a letter and number." },
      { status: 400 },
    );
  }

  const user = await createLearner(name, email, password);
  if (!user) {
    return NextResponse.json(
      { error: "An account already exists for this email." },
      { status: 409 },
    );
  }

  await startLearnerSession(user.id);
  return NextResponse.json({ user }, { status: 201 });
}
