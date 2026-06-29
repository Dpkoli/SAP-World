import { NextResponse } from "next/server";

import { rolePermissions } from "@/data/auth";
import { getAuthAdministrationSnapshot } from "@/server/auth-repository";
import { requireLearnerRole } from "@/server/auth-session";
import { getContentControlRegister } from "@/server/content-control-service";
import { getDevelopmentRoadmap } from "@/server/development-roadmap-service";
import { getStorageHealth } from "@/server/durable-store";
import { getEnterpriseIdentityProviderStatus } from "@/server/enterprise-identity-provider";
import { getGeneratedSimulationStats } from "@/server/generated-simulation-repository";
import { getPlatformLedgerAnalytics } from "@/server/ledger-analytics-repository";
import { getMentorProviderStatus } from "@/server/mentor-provider";
import { getMentorAdministrationStats } from "@/server/mentor-conversation-repository";
import { getObservabilitySnapshot } from "@/server/observability-repository";
import { getOperationsReadiness } from "@/server/operations-readiness-service";
import { getLearningProgressStats } from "@/server/progress-repository";
import { getReleaseGovernance } from "@/server/release-governance-repository";
import { getReleaseOperationsSnapshot } from "@/server/release-operations-repository";
import { getSimulationLedgerPersistenceStats } from "@/server/simulation-ledger-repository";
import { getEnterpriseSnapshot } from "@/server/simulation-service";
import { getTutorCapstoneAdministrationStats } from "@/server/tutor-capstone-repository";
import { getTutorCertificationAdministrationStats } from "@/server/tutor-certification-service";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireLearnerRole("admin");
  if (!auth.learner || auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const [
    storage,
    accounts,
    progress,
    simulations,
    ledgerPersistence,
    ledgerAnalytics,
    observability,
    capstones,
    mentorConversations,
    releaseOperations,
  ] = await Promise.all([
    getStorageHealth(),
    getAuthAdministrationSnapshot(),
    getLearningProgressStats(),
    getGeneratedSimulationStats(),
    getSimulationLedgerPersistenceStats(),
    getPlatformLedgerAnalytics(),
    getObservabilitySnapshot(),
    getTutorCapstoneAdministrationStats(),
    getMentorAdministrationStats(),
    getReleaseOperationsSnapshot(),
  ]);
  const enterprise = getEnterpriseSnapshot();
  const contentControl = getContentControlRegister();
  const mentor = getMentorProviderStatus();
  const identityProvider = getEnterpriseIdentityProviderStatus();
  const readiness = getOperationsReadiness({
    storage,
    mentor,
    ledgerAnalytics,
    contentControl,
    accounts,
    identityProvider,
  });
  const development = getDevelopmentRoadmap({
    contentControl,
    ledgerAnalytics,
    mentor,
    mentorConversations,
    releaseOperations,
    readiness,
  });
  const releaseGovernance = await getReleaseGovernance(readiness);
  const certifications = getTutorCertificationAdministrationStats({
    progress,
    capstones,
  });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    admin: {
      id: auth.learner.id,
      email: auth.learner.email,
      permissions: rolePermissions.admin,
    },
    storage,
    mentor,
    mentorConversations,
    identityProvider,
    readiness,
    releaseGovernance,
    releaseOperations,
    development,
    observability,
    accounts,
    progress,
    capstones,
    certifications,
    simulations,
    ledgerPersistence,
    ledgerAnalytics,
    contentControl: contentControl.summary,
    content: {
      industries: enterprise.industryPortfolio.length,
      processScenarios: enterprise.operations.processScenarios.length,
      processDefinitions: enterprise.learning.processCatalog.length,
      workflowDefinitions: enterprise.operations.workflows.length,
      governanceDefinitions: enterprise.operations.governance.changeRequests.length,
      advancedTransactions: enterprise.operations.advancedTransactions.length,
      masterDataMaterials: enterprise.masterData.materials.length,
      masterDataPartners: enterprise.businessPartners.length,
    },
    controls: [
      "Admin roles and account lifecycle state are stored in the managed identity registry.",
      "Legacy administrator emails are used only for one-time bootstrap migration.",
      "Learner mutations remain scoped to the authenticated learner id.",
      "Storage health is verified server-side before this response is returned.",
      "Ledger analytics are projected from deterministic simulation documents with link-integrity checks.",
      "Generated enterprise ledgers are persisted by simulation signature before analytics reuse them.",
      "Content release readiness is calculated from controlled owner, version, evidence, and validation gates.",
      "Operations readiness combines deployment, security, content, ledger, storage, and mentor checks.",
      "Development completion is a weighted roadmap estimate and remains separate from deployment approval.",
      "Observability records compact server-side events without storing learner notes, passwords, or session tokens.",
      "Certification review metrics exclude raw learner notes and capstone response text.",
      "External mentor configuration is reported without exposing endpoint or API key values.",
      "Mentor conversations retain grounded responses, evidence references, quality checks, and learner feedback per account.",
      "This endpoint never returns password hashes, salts, or session tokens.",
    ],
  });
}
