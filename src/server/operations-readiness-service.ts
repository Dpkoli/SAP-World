import "server-only";

import type { getStorageHealth } from "@/server/durable-store";
import type { getAuthAdministrationSnapshot } from "@/server/auth-repository";
import type { LedgerAnalyticsSnapshot } from "@/server/ledger-analytics-repository";
import type { getContentControlRegister } from "@/server/content-control-service";
import type { getEnterpriseIdentityProviderStatus } from "@/server/enterprise-identity-provider";
import type { getMentorProviderStatus } from "@/server/mentor-provider";
import { getHostedObservabilityStatus } from "@/server/observability-repository";
import { getReleaseAutomationStatus } from "@/server/release-operations-repository";

export type OperationsReadinessCheck = {
  id: string;
  area: string;
  status: "Pass" | "Warning" | "Fail";
  evidence: string;
  action: string;
};

type StorageHealth = Awaited<ReturnType<typeof getStorageHealth>>;
type AuthAdministration = Awaited<
  ReturnType<typeof getAuthAdministrationSnapshot>
>;
type ContentControl = ReturnType<typeof getContentControlRegister>;
type IdentityProvider = ReturnType<typeof getEnterpriseIdentityProviderStatus>;
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
  accounts: AuthAdministration;
  identityProvider: IdentityProvider;
}) {
  const insecureCookiesEnabled =
    process.env.SAP_WORLD_INSECURE_COOKIES === "true";
  const production = process.env.NODE_ENV === "production";
  const hostedObservability = getHostedObservabilityStatus();
  const releaseAutomation = getReleaseAutomationStatus();

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
      id: "managed-identity",
      area: "Access control",
      status: input.accounts.lifecycle.activeAdmins > 0 ? "Pass" : "Fail",
      evidence: `${input.accounts.lifecycle.activeAdmins} active administrator accounts are stored in the managed identity registry.`,
      action:
        input.accounts.lifecycle.activeAdmins > 0
          ? "Review organisation role assignments and lifecycle audit history before go-live."
          : "Bootstrap or reactivate at least one managed platform administrator.",
    }),
    check({
      id: "enterprise-identity-provider",
      area: "Enterprise identity",
      status:
        input.identityProvider.mode === "local-managed"
          ? "Warning"
          : input.identityProvider.configured
            ? "Pass"
            : "Fail",
      evidence:
        input.identityProvider.mode === "local-managed"
          ? "Durable local managed identity is active; external SSO is not selected."
          : `${input.identityProvider.mode.toUpperCase()} provider configuration is ${input.identityProvider.configured ? "complete" : "incomplete"}.`,
      action:
        input.identityProvider.mode === "local-managed"
          ? "Connect the documented OIDC or SAML adapter before enterprise rollout."
          : input.identityProvider.configured
            ? "Complete provider metadata and assertion smoke testing."
            : "Complete all required enterprise identity provider settings.",
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
      id: "dedicated-ledger-storage",
      area: "Enterprise data",
      status:
        input.storage.backend === "postgresql" &&
        input.ledgerAnalytics.readModel.backend === "dedicated-postgresql"
          ? "Pass"
          : "Warning",
      evidence: `Ledger read model backend is ${input.ledgerAnalytics.readModel.backend}.`,
      action:
        input.ledgerAnalytics.readModel.backend === "dedicated-postgresql"
          ? "No action required."
          : "Configure DATABASE_URL and run npm run db:migrate before hosted release.",
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
    check({
      id: "hosted-observability",
      area: "Hosted observability",
      status:
        hostedObservability.runtime === "vercel" ||
        hostedObservability.eventSinkConfigured
          ? "Pass"
          : "Warning",
      evidence: `${hostedObservability.runtime} runtime with Web Analytics and Speed Insights enabled; external event sink ${hostedObservability.eventSinkConfigured ? "configured" : "not configured"}.`,
      action:
        hostedObservability.runtime === "vercel" ||
        hostedObservability.eventSinkConfigured
          ? "Review runtime errors and Core Web Vitals after promotion."
          : "Link the hosted project or configure SAP_WORLD_OBSERVABILITY_WEBHOOK_URL.",
    }),
    check({
      id: "release-automation",
      area: "Release operations",
      status: releaseAutomation.configured ? "Pass" : "Warning",
      evidence: releaseAutomation.configured
        ? `${releaseAutomation.provider} promotion and rollback automation is configured.`
        : "Promotion and rollback requests are retained for manual execution.",
      action: releaseAutomation.configured
        ? "Validate the provider callback during preview smoke testing."
        : "Configure SAP_WORLD_RELEASE_AUTOMATION_URL and its deployment secret.",
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
