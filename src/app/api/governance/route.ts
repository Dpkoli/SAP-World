import { NextRequest, NextResponse } from "next/server";
import type {
  GovernanceAction,
  GovernanceDomain,
} from "@/data/governance";
import { getCurrentLearner } from "@/server/auth-session";
import {
  decideGovernanceCase,
  getGovernanceCases,
} from "@/server/governance-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const domain = request.nextUrl.searchParams.get("domain");
  const status = request.nextUrl.searchParams.get("status");
  let requests = await getGovernanceCases(learner.id);
  if (domain) {
    requests = requests.filter(
      (item) => item.domain.toLowerCase() === domain.toLowerCase(),
    );
  }
  if (status) {
    requests = requests.filter(
      (item) => item.status.toLowerCase() === status.toLowerCase(),
    );
  }

  return NextResponse.json({
    total: requests.length,
    open: requests.filter(
      (item) => item.status === "Draft" || item.status === "Pending",
    ).length,
    validationFailures: requests.filter((item) =>
      item.validations.some((validation) => validation.status === "Fail"),
    ).length,
    domains: Array.from(
      new Set(requests.map((item) => item.domain as GovernanceDomain)),
    ),
    requests,
  });
}

export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let input: {
    requestId?: unknown;
    action?: unknown;
    comment?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter a valid governance decision." },
      { status: 400 },
    );
  }

  const requestId =
    typeof input.requestId === "string" ? input.requestId.trim() : "";
  const action =
    input.action === "submit" ||
    input.action === "approve" ||
    input.action === "reject" ||
    input.action === "request-changes"
      ? (input.action as GovernanceAction)
      : null;
  const comment =
    typeof input.comment === "string" ? input.comment.trim() : "";

  if (!requestId || !action) {
    return NextResponse.json(
      { error: "Select a valid governance action." },
      { status: 400 },
    );
  }
  if (comment.length < 5 || comment.length > 500) {
    return NextResponse.json(
      { error: "Decision rationale must contain between 5 and 500 characters." },
      { status: 400 },
    );
  }

  const governanceCase = await decideGovernanceCase(
    learner.id,
    requestId,
    action,
    comment,
  );
  if (!governanceCase) {
    return NextResponse.json(
      { error: "This action is unavailable for the current governance state." },
      { status: 409 },
    );
  }

  return NextResponse.json({ request: governanceCase });
}
