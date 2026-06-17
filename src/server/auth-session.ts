import "server-only";

import { cookies } from "next/headers";
import {
  createLearnerSession,
  getLearnerBySession,
  revokeLearnerSession,
} from "@/server/auth-repository";
import type { UserRole } from "@/data/auth";

const sessionCookieName = "sap-world-session";
const useSecureCookies =
  process.env.NODE_ENV === "production" &&
  process.env.SAP_WORLD_INSECURE_COOKIES !== "true";

export async function getCurrentLearner() {
  const cookieStore = await cookies();
  return getLearnerBySession(cookieStore.get(sessionCookieName)?.value);
}

export async function requireLearnerRole(role: UserRole) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return { learner: null, status: 401 as const, error: "Sign in required." };
  }
  if (role === "admin" && learner.role !== "admin") {
    return {
      learner,
      status: 403 as const,
      error: "Admin role required.",
    };
  }
  return { learner, status: 200 as const, error: null };
}

export async function startLearnerSession(userId: string) {
  const cookieStore = await cookies();
  const session = await createLearnerSession(userId);
  cookieStore.set(sessionCookieName, session.token, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function endLearnerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  await revokeLearnerSession(token);
  cookieStore.delete(sessionCookieName);
}
