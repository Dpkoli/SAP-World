import "server-only";

import type { getStorageHealth } from "@/server/durable-store";
import type { LedgerAnalyticsSnapshot } from "@/server/ledger-analytics-repository";
import type { getContentControlRegister } from "@/server/content-control-service";
import type { getMentorProviderStatus } from "@/server/mentor-provider";

export type OperationsReadinessCheck = {
  id: string;
  area: string;
  status: "Pass" | "Warning" | "Fail";
  evidence: string;
  action: string;
};

type StorageHealth = Awaited<ReturnType<typeof getStorageHealth>>;
type ContentControl = ReturnType<typeof getContentControlRegister>;
type MentorProvider = ReturnType<typeof getMentorProviderStatus>;

function check(input: OperationsReadinessCheck) {
  return input;
}

function statusFor(checks: OperationsReadinessCheck[]) {
  if (checks.some((item) => item.status === "Fail")) return "Blocked" as const;
  if (checks.some((item) => item.status === "Warning")) {
    return "Ready with warnings" as const;
  }
  return "Ready" as const;
}

export function getOperationsReadiness(input: {
  storage: StorageHealth;
  mentor: MentorProvider;
  ledgerAnalytics: LedgerAnalyticsSnapshot;
  contentControl: ContentControl;
}) {
  const adminEmailsConfigured = Boolean(
    process.env.SAP_WORLD_ADMIN_EMAILS?.trim(),
  );
  const insecureCookiesEnabled =
    process.env.SAP_WORLD_INSECURE_COOKIES === "true";
  const production = process.env.NODE_ENV === "production";

  const checks = [
    check({
      id: "storage-durable",
      area: "Persistence",
      status: input.storage.durable ? "Pass" : "Warning",
      evidence: input.storage.durable
        ? `Using ${input.storage.backend} durable storage.`
        : "Using local-file storage.",
      action: input.storage.durable
        ? "No action required."
        : "Configure DATABASE_URL before hosted deployment.",
    }),
    check({
      id: "admin-allow-list",
      area: "Access control",
      status: adminEmailsConfigured ? "Pass" : "Fail",
      evidence: adminEmailsConfigured
        ? "SAP_WORLD_ADMIN_EMAILS is configured."
        : "SAP_WORLD_ADMIN_EMAILS is not configured.",
      action: adminEmailsConfigured
        ? "Review the allow-list before go-live."
        : "Set SAP_WORLD_ADMIN_EMAILS for platform owner accounts.",
    }),
    check({
      id: "cookie-security",
      area: "Session security",
      status: production && insecureCookiesEnabled ? "Fail" : "Pass",
      evidence: insecureCookiesEnabled
        ? "SAP_WORLD_INSECURE_COOKIES is enabled."
        : "Secure cookie mode is active.",
      action:
        production && insecureCookiesEnabled
          ? "Remove SAP_WORLD_INSECURE_COOKIES from hosted environments."
          : "No action required.",
    }),
    check({
      id: "content-release",
      area: "Content control",
      status:
        input.contentControl.summary.blocked > 0
          ? "Fail"
          : input.contentControl.summary.reviewRequired > 0
            ? "Warning"
            : "Pass",
      evidence: `${input.contentControl.summary.released}/${input.contentControl.summary.domains} content domains released at ${input.contentControl.summary.averageReadiness}% average readiness.`,
      action:
        input.contentControl.summary.blocked > 0
          ? "Resolve blocked content gates before release."
          : input.contentControl.summary.reviewRequired > 0
            ? "Review warning gates and approve exceptions."
            : "No action required.",
    }),
    check({
      id: "ledger-integrity",
      area: "Simulation integrity",
      status:
        input.ledgerAnalytics.integrity.status === "Passed"
          ? "Pass"
          : "Fail",
      evidence: `${input.ledgerAnalytics.totals.documents.toLocaleString("en-GB")} ledger documents, ${input.ledgerAnalytics.integrity.brokenLinks} broken links, ${input.ledgerAnalytics.integrity.orphanDocuments} orphan documents.`,
      action:
        input.ledgerAnalytics.integrity.status === "Passed"
          ? "No action required."
          : "Regenerate or repair affected simulation ledgers before release.",
    }),
    check({
      id: "mentor-provider",
      area: "AI mentor",
      status: input.mentor.configured ? "Pass" : "Warning",
      evidence: input.mentor.configured
        ? `External mentor provider configured with model ${input.mentor.model}.`
        : "Using deterministic local mentor fallback.",
      action: input.mentor.configured
        ? "Monitor provider latency and fallback rate after deployment."
        : "Optional: configure SAP_WORLD_AI_* variables for model-enhanced explanations.",
    }),
  ];

  const status = statusFor(checks);

  return {
    generatedAt: new Date().toISOString(),
    status,
    summary: {
      checks: checks.length,
      passed: checks.filter((item) => item.status === "Pass").length,
      warnings: checks.filter((item) => item.status === "Warning").length,
      failed: checks.filter((item) => item.status === "Fail").length,
    },
    checks,
    deploymentGate:
      status === "Ready"
        ? "Production deployment can proceed."
        : status === "Ready with warnings"
          ? "Production deployment can proceed after accepting documented warnings."
          : "Production deployment should not proceed until failed checks are resolved.",
  };
}
