import "server-only";

import { randomUUID } from "node:crypto";

import type { LearnerProfile } from "@/data/auth";
import { createDurableStore } from "@/server/durable-store";
import type { getReleaseGovernance } from "@/server/release-governance-repository";

type ReleaseGovernance = Awaited<ReturnType<typeof getReleaseGovernance>>;
export type ReleaseOperationAction = "Promote" | "Rollback";
export type ReleaseOperationStatus =
  | "Requested"
  | "Accepted"
  | "Succeeded"
  | "Failed"
  | "Manual action required";

export type ReleaseOperation = {
  id: string;
  action: ReleaseOperationAction;
  status: ReleaseOperationStatus;
  target: string;
  environment: "production";
  readinessFingerprint: string;
  releaseDecisionId: string | null;
  note: string;
  requestedAt: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  providerReference: string | null;
  providerUrl: string | null;
  providerMessage: string | null;
};

type ReleaseOperationsStore = {
  version: 1;
  operations: ReleaseOperation[];
};

function emptyStore(): ReleaseOperationsStore {
  return { version: 1, operations: [] };
}

function isReleaseOperationsStore(
  value: unknown,
): value is ReleaseOperationsStore {
  const candidate = value as Partial<ReleaseOperationsStore> | null;
  return Boolean(candidate?.version === 1 && Array.isArray(candidate.operations));
}

const operationsStore = createDurableStore<ReleaseOperationsStore>({
  key: "release-operations",
  fileName: "release-operations.json",
  empty: emptyStore,
  validate: isReleaseOperationsStore,
});

export function getReleaseAutomationStatus() {
  return {
    configured: Boolean(process.env.SAP_WORLD_RELEASE_AUTOMATION_URL?.trim()),
    provider: process.env.SAP_WORLD_RELEASE_PROVIDER?.trim() || "manual",
    productionTarget:
      process.env.SAP_WORLD_PRODUCTION_URL?.trim() || null,
  };
}

async function dispatchOperation(operation: ReleaseOperation) {
  const endpoint = process.env.SAP_WORLD_RELEASE_AUTOMATION_URL?.trim();
  if (!endpoint) {
    return {
      status: "Manual action required" as const,
      providerReference: null,
      providerUrl: null,
      providerMessage: "No release automation endpoint is configured.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SAP_WORLD_RELEASE_AUTOMATION_SECRET
          ? {
              Authorization: `Bearer ${process.env.SAP_WORLD_RELEASE_AUTOMATION_SECRET}`,
            }
          : {}),
      },
      body: JSON.stringify({
        operationId: operation.id,
        action: operation.action.toLowerCase(),
        target: operation.target,
        environment: operation.environment,
        readinessFingerprint: operation.readinessFingerprint,
        releaseDecisionId: operation.releaseDecisionId,
        note: operation.note,
      }),
      signal: controller.signal,
    });
    const result = (await response.json().catch(() => null)) as {
      id?: unknown;
      url?: unknown;
      message?: unknown;
      status?: unknown;
    } | null;
    return {
      status: response.ok
        ? result?.status === "succeeded"
          ? "Succeeded" as const
          : "Accepted" as const
        : "Failed" as const,
      providerReference:
        typeof result?.id === "string" ? result.id.slice(0, 200) : null,
      providerUrl:
        typeof result?.url === "string" ? result.url.slice(0, 500) : null,
      providerMessage:
        typeof result?.message === "string"
          ? result.message.slice(0, 500)
          : `Release provider returned HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      status: "Failed" as const,
      providerReference: null,
      providerUrl: null,
      providerMessage:
        error instanceof Error ? error.message : "Release provider unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestReleaseOperation(input: {
  action: ReleaseOperationAction;
  target: string;
  note: string;
  admin: LearnerProfile;
  governance: ReleaseGovernance;
}) {
  const target = input.target.trim();
  const note = input.note.trim();
  if (target.length < 3 || target.length > 500) {
    throw new Error("Enter a valid deployment URL, id, or production alias.");
  }
  if (note.length < 20 || note.length > 1000) {
    throw new Error("Add an operational note between 20 and 1,000 characters.");
  }
  if (
    input.action === "Promote" &&
    (!input.governance.currentDecision ||
      input.governance.currentDecision.decision === "Rejected")
  ) {
    throw new Error(
      "Record an approval or warning acceptance for the current readiness snapshot before promotion.",
    );
  }

  const operation: ReleaseOperation = {
    id: randomUUID(),
    action: input.action,
    status: "Requested",
    target,
    environment: "production",
    readinessFingerprint: input.governance.readinessFingerprint,
    releaseDecisionId: input.governance.currentDecision?.id ?? null,
    note,
    requestedAt: new Date().toISOString(),
    requestedBy: {
      id: input.admin.id,
      name: input.admin.name,
      email: input.admin.email,
    },
    providerReference: null,
    providerUrl: null,
    providerMessage: null,
  };
  const provider = await dispatchOperation(operation);
  Object.assign(operation, provider);
  await operationsStore.update((store) => {
    store.operations = [operation, ...store.operations].slice(0, 200);
  });
  return operation;
}

export async function getReleaseOperationsSnapshot() {
  const store = await operationsStore.read();
  const automation = getReleaseAutomationStatus();
  return {
    automation,
    totals: {
      operations: store.operations.length,
      promotions: store.operations.filter((item) => item.action === "Promote").length,
      rollbacks: store.operations.filter((item) => item.action === "Rollback").length,
      failures: store.operations.filter((item) => item.status === "Failed").length,
      manualActions: store.operations.filter(
        (item) => item.status === "Manual action required",
      ).length,
    },
    latest: store.operations.slice(0, 20),
  };
}
