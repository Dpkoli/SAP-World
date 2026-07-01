import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { createDurableStore } from "@/server/durable-store";

export type ObservabilityEventType =
  | "mentor.question"
  | "mentor.feedback"
  | "simulation.generated"
  | "simulation.step.completed"
  | "tutor.guided.progress.saved"
  | "tutor.readiness.checked"
  | "tutor.capstone.checked"
  | "tutor.capstone.submitted"
  | "tutor.portfolio.checked"
  | "tutor.certification.exported"
  | "industry.journey.started"
  | "industry.task.completed"
  | "industry.period.closed"
  | "advanced.step.completed"
  | "workflow.decision"
  | "governance.decision"
  | "admin.readiness.checked"
  | "admin.release.decision"
  | "admin.release.promotion"
  | "admin.release.rollback"
  | "admin.certification.decision"
  | "admin.identity.changed"
  | "auth.password-recovery.requested"
  | "auth.password-recovery.completed"
  | "admin.content.checked"
  | "admin.observability.checked";

export type ObservabilityEvent = {
  id: string;
  type: ObservabilityEventType;
  occurredAt: string;
  actorId: string;
  actorRole: "learner" | "admin" | "system";
  entityId: string | null;
  status: "success" | "warning" | "failure";
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
};

type ObservabilityDatabase = {
  version: 1;
  events: ObservabilityEvent[];
};

function emptyDatabase(): ObservabilityDatabase {
  return { version: 1, events: [] };
}

function isObservabilityDatabase(
  value: unknown,
): value is ObservabilityDatabase {
  const candidate = value as Partial<ObservabilityDatabase> | null;
  return Boolean(candidate?.version === 1 && Array.isArray(candidate.events));
}

const observabilityStore = createDurableStore<ObservabilityDatabase>({
  key: "observability-events",
  fileName: "observability-events.json",
  empty: emptyDatabase,
  validate: isObservabilityDatabase,
});

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function getHostedObservabilityStatus() {
  return {
    runtime: process.env.VERCEL ? "vercel" as const : "local" as const,
    environment:
      process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    webAnalytics: true,
    speedInsights: true,
    eventSinkConfigured: Boolean(
      process.env.SAP_WORLD_OBSERVABILITY_WEBHOOK_URL?.trim(),
    ),
  };
}

async function deliverHostedEvent(event: ObservabilityEvent) {
  console.log(
    JSON.stringify({
      level: event.status === "failure" ? "error" : event.status === "warning" ? "warn" : "info",
      message: event.summary,
      service: "sap-world",
      eventId: event.id,
      eventType: event.type,
      actorRole: event.actorRole,
      entityId: event.entityId,
      status: event.status,
      metadata: event.metadata,
      occurredAt: event.occurredAt,
    }),
  );

  const endpoint = process.env.SAP_WORLD_OBSERVABILITY_WEBHOOK_URL?.trim();
  if (!endpoint) return true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SAP_WORLD_OBSERVABILITY_WEBHOOK_SECRET
          ? {
              Authorization: `Bearer ${process.env.SAP_WORLD_OBSERVABILITY_WEBHOOK_SECRET}`,
            }
          : {}),
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function recordObservabilityEvent(input: {
  type: ObservabilityEventType;
  actorId: string;
  actorRole: ObservabilityEvent["actorRole"];
  entityId?: string | null;
  status?: ObservabilityEvent["status"];
  summary: string;
  metadata?: ObservabilityEvent["metadata"];
}) {
  const event: ObservabilityEvent = {
    id: randomUUID(),
    type: input.type,
    occurredAt: new Date().toISOString(),
    actorId: hashIdentifier(input.actorId),
    actorRole: input.actorRole,
    entityId: input.entityId ?? null,
    status: input.status ?? "success",
    summary: input.summary,
    metadata: input.metadata ?? {},
  };

  try {
    await observabilityStore.update((database) => {
      database.events = [event, ...database.events].slice(0, 1000);
    });
    return deliverHostedEvent(event);
  } catch {
    return false;
  }
}

export async function getObservabilitySnapshot() {
  const database = await observabilityStore.read();
  const events = database.events;
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const recent24h = events.filter(
    (event) => new Date(event.occurredAt).getTime() >= since,
  );

  const byType = events.reduce<Record<string, number>>((result, event) => {
    result[event.type] = (result[event.type] ?? 0) + 1;
    return result;
  }, {});
  const byStatus = events.reduce<Record<string, number>>((result, event) => {
    result[event.status] = (result[event.status] ?? 0) + 1;
    return result;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    hosted: getHostedObservabilityStatus(),
    retention: {
      maxEvents: 1000,
      storedEvents: events.length,
    },
    totals: {
      events: events.length,
      recent24h: recent24h.length,
      successes: byStatus.success ?? 0,
      warnings: byStatus.warning ?? 0,
      failures: byStatus.failure ?? 0,
    },
    byType,
    byStatus,
    latest: events.slice(0, 20),
  };
}
