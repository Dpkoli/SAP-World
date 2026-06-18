import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearner } from "@/server/auth-session";
import {
  decideWorkflow,
  getWorkflowCases,
} from "@/server/workflow-repository";
import type { WorkflowAction } from "@/data/workflows";
import { recordObservabilityEvent } from "@/server/observability-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const scenarioId = request.nextUrl.searchParams.get("scenario");
  let workflows = await getWorkflowCases(learner.id);
  if (status) {
    workflows = workflows.filter(
      (workflow) => workflow.status.toLowerCase() === status.toLowerCase(),
    );
  }
  if (scenarioId) {
    workflows = workflows.filter(
      (workflow) => workflow.scenarioId === scenarioId,
    );
  }

  return NextResponse.json({
    total: workflows.length,
    pending: workflows.filter((workflow) => workflow.status === "Pending").length,
    overdue: workflows.filter(
      (workflow) =>
        workflow.status === "Pending" &&
        new Date(workflow.dueAt).getTime() < Date.now(),
    ).length,
    workflows,
  });
}

export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let input: {
    workflowId?: unknown;
    action?: unknown;
    comment?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid workflow decision." }, { status: 400 });
  }

  const workflowId =
    typeof input.workflowId === "string" ? input.workflowId.trim() : "";
  const action =
    input.action === "approve" ||
    input.action === "reject" ||
    input.action === "request-information"
      ? (input.action as WorkflowAction)
      : null;
  const comment =
    typeof input.comment === "string" ? input.comment.trim() : "";

  if (!workflowId || !action) {
    return NextResponse.json({ error: "Select a valid workflow action." }, { status: 400 });
  }
  if (comment.length < 5 || comment.length > 500) {
    return NextResponse.json(
      { error: "Decision rationale must contain between 5 and 500 characters." },
      { status: 400 },
    );
  }

  const workflow = await decideWorkflow(
    learner.id,
    workflowId,
    action,
    comment,
  );
  if (!workflow) {
    return NextResponse.json(
      { error: "This workflow is unavailable or already decided." },
      { status: 409 },
    );
  }
  const wasOverdue = new Date(workflow.dueAt).getTime() < Date.now();
  await recordObservabilityEvent({
    type: "workflow.decision",
    actorId: learner.id,
    actorRole: learner.role,
    entityId: workflow.id,
    status: wasOverdue ? "warning" : "success",
    summary: "Learner recorded a workflow decision.",
    metadata: {
      action,
      status: workflow.status,
      scenarioId: workflow.scenarioId,
      wasOverdue,
    },
  });

  return NextResponse.json({
    workflow,
    wasOverdue,
  });
}
