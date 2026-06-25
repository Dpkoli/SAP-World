import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { LearnerProfile } from "@/data/auth";
import { createDurableStore } from "@/server/durable-store";
import type { getOperationsReadiness } from "@/server/operations-readiness-service";

type OperationsReadiness = ReturnType<typeof getOperationsReadiness>;

export type ReleaseDecisionType =
  | "Approved"
  | "Warnings accepted"
  | "Rejected";

export type ReleaseDecision = {
  id: string;
  readinessFingerprint: string;
  readinessStatus: OperationsReadiness["status"];
  decision: ReleaseDecisionType;
  note: string;
  decidedAt: string;
  decidedBy: {
    id: string;
    name: string;
    email: string;
  };
  summary: OperationsReadiness["summary"];
};

type ReleaseGovernanceStore = {
  version: 1;
  decisions: ReleaseDecision[];
};

function emptyStore(): ReleaseGovernanceStore {
  return { version: 1, decisions: [] };
}

function isReleaseGovernanceStore(
  value: unknown,
): value is ReleaseGovernanceStore {
  const candidate = value as Partial<ReleaseGovernanceStore> | null;
  return Boolean(candidate?.version === 1 && Array.isArray(candidate.decisions));
}

const releaseGovernanceStore = createDurableStore<ReleaseGovernanceStore>({
  key: "release-governance",
  fileName: "release-governance.json",
  empty: emptyStore,
  validate: isReleaseGovernanceStore,
});

export function readinessFingerprint(readiness: OperationsReadiness) {
  const evidence = readiness.checks.map((check) => ({
    id: check.id,
    status: check.status,
    evidence: check.evidence,
  }));
  return createHash("sha256")
    .update(JSON.stringify(evidence))
    .digest("hex")
    .slice(0, 20);
}

export async function getReleaseGovernance(readiness: OperationsReadiness) {
  const store = await releaseGovernanceStore.read();
  const fingerprint = readinessFingerprint(readiness);
  const currentDecision =
    store.decisions.find(
      (decision) => decision.readinessFingerprint === fingerprint,
    ) ?? null;

  return {
    readinessFingerprint: fingerprint,
    currentDecision,
    history: store.decisions.slice(0, 20),
    totalDecisions: store.decisions.length,
  };
}

export async function recordReleaseDecision(input: {
  readiness: OperationsReadiness;
  admin: LearnerProfile;
  decision: ReleaseDecisionType;
  note: string;
}) {
  const note = input.note.trim();
  if (note.length < 20 || note.length > 1000) {
    throw new Error("Add a release note between 20 and 1,000 characters.");
  }

  if (input.decision === "Approved" && input.readiness.status !== "Ready") {
    throw new Error(
      "Only a readiness gate with no warnings or failures can be approved.",
    );
  }
  if (
    input.decision === "Warnings accepted" &&
    input.readiness.status !== "Ready with warnings"
  ) {
    throw new Error(
      "Warnings can be accepted only when the gate has warnings and no failures.",
    );
  }
  if (
    input.readiness.status === "Blocked" &&
    input.decision !== "Rejected"
  ) {
    throw new Error(
      "A blocked release must be rejected until failed checks are resolved.",
    );
  }

  const decision: ReleaseDecision = {
    id: randomUUID(),
    readinessFingerprint: readinessFingerprint(input.readiness),
    readinessStatus: input.readiness.status,
    decision: input.decision,
    note,
    decidedAt: new Date().toISOString(),
    decidedBy: {
      id: input.admin.id,
      name: input.admin.name,
      email: input.admin.email,
    },
    summary: input.readiness.summary,
  };

  await releaseGovernanceStore.update((store) => {
    store.decisions = [decision, ...store.decisions].slice(0, 200);
  });

  return getReleaseGovernance(input.readiness);
}
