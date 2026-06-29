import "server-only";

import type { getContentControlRegister } from "@/server/content-control-service";
import type { LedgerAnalyticsSnapshot } from "@/server/ledger-analytics-repository";
import type { getMentorProviderStatus } from "@/server/mentor-provider";
import type { getOperationsReadiness } from "@/server/operations-readiness-service";

type ContentControl = ReturnType<typeof getContentControlRegister>;
type MentorProvider = ReturnType<typeof getMentorProviderStatus>;
type OperationsReadiness = ReturnType<typeof getOperationsReadiness>;

export type DevelopmentMilestone = {
  id: string;
  title: string;
  status: "Complete" | "In progress" | "Planned";
  weight: number;
  progress: number;
  summary: string;
  evidence: string[];
  nextAction: string;
};

function milestone(input: DevelopmentMilestone) {
  return input;
}

export function getDevelopmentRoadmap(input: {
  contentControl: ContentControl;
  ledgerAnalytics: LedgerAnalyticsSnapshot;
  mentor: MentorProvider;
  readiness: OperationsReadiness;
}) {
  const productionProgress = Math.round(
    (input.readiness.summary.passed / Math.max(1, input.readiness.summary.checks)) *
      100,
  );
  const modelProgress = input.mentor.configured ? 50 : 20;

  const milestones = [
    milestone({
      id: "enterprise-foundation",
      title: "Enterprise platform foundation",
      status: "Complete",
      weight: 10,
      progress: 100,
      summary:
        "Authenticated Next.js platform shell, enterprise navigation, role model, and durable repository pattern.",
      evidence: [
        "Learner and admin authentication with secure sessions",
        "Local JSON and PostgreSQL storage modes",
        "Responsive enterprise workspace",
      ],
      nextAction: "Maintain the foundation while product modules expand.",
    }),
    milestone({
      id: "sap-curriculum",
      title: "Core SAP curriculum and tutor",
      status: "Complete",
      weight: 20,
      progress: 100,
      summary:
        "Eight connected SAP process pathways with guided processing, playbooks, impact explanations, and diagnostics.",
      evidence: [
        `${input.contentControl.summary.released}/${input.contentControl.summary.domains} controlled content domains released`,
        "Step-level SAP processing and transaction evidence guidance",
        "Tutor readiness and troubleshooting across core processes",
      ],
      nextAction: "Deepen specialist and industry-specific transaction coverage.",
    }),
    milestone({
      id: "simulation-ledger",
      title: "Simulation and enterprise ledger",
      status: "Complete",
      weight: 18,
      progress: 100,
      summary:
        "Deterministic multi-year scenarios, connected SAP documents, execution events, and normalized analytics.",
      evidence: [
        input.ledgerAnalytics.totals.documents > 0
          ? `${input.ledgerAnalytics.totals.documents.toLocaleString("en-GB")} saved ledger documents across ${input.ledgerAnalytics.totals.processChains.toLocaleString("en-GB")} process chains`
          : "Ledger generation is implemented; no simulation has been saved for this admin account yet",
        "Connected document, journal, exception, and execution-event models",
        "Configurable representative, growth, and enterprise volume profiles",
        "Generated ledger records are persisted and reused by analytics",
        `Current saved-ledger integrity: ${input.ledgerAnalytics.integrity.status}`,
      ],
      nextAction: "Extend configurable histories to high-volume operational persistence.",
    }),
    milestone({
      id: "learner-evidence",
      title: "Learner evidence and assessment",
      status: "Complete",
      weight: 17,
      progress: 100,
      summary:
        "Account-backed progress, evidence quality coaching, readiness scoring, capstones, and portfolio review.",
      evidence: [
        "Guided step notes and evidence-gap tracking",
        "Assessed diagnostics and capstone submissions",
        "Learner capability portfolio with next actions",
        "Certification-style evidence export with privacy-safe verification notes",
        "Admin certification review metrics and process queues",
        "Persistent per-process assessor decisions and certification approval history",
      ],
      nextAction: "Add external certification issuer handoff and credential verification.",
    }),
    milestone({
      id: "admin-controls",
      title: "Admin governance and controls",
      status: "Complete",
      weight: 12,
      progress: 100,
      summary:
        "Owner access, content controls, production gates, telemetry, learner activity, and safe model visibility.",
      evidence: [
        "Admin-only control plane and operations API",
        "Controlled content release register",
        "Production readiness and observability summaries",
        "Certification assessor workspace with learner and process audit history",
        "Durable role assignment, suspension, reactivation, and identity audit history",
      ],
      nextAction: "Connect deployment-specific OIDC or SAML provider credentials.",
    }),
    milestone({
      id: "production-foundation",
      title: "Production deployment foundation",
      status: productionProgress === 100 ? "Complete" : "In progress",
      weight: 10,
      progress: productionProgress,
      summary:
        "Environment, security, storage, content, ledger, and mentor checks required for hosted operation.",
      evidence: [
        `${input.readiness.summary.passed}/${input.readiness.summary.checks} readiness checks passed`,
        `${input.readiness.summary.warnings} warnings and ${input.readiness.summary.failed} failures`,
        `Current deployment gate: ${input.readiness.status}`,
      ],
      nextAction: input.readiness.deploymentGate,
    }),
    milestone({
      id: "enterprise-scale",
      title: "Enterprise-scale data and identity",
      status: "In progress",
      weight: 8,
      progress: 65,
      summary:
        "Scale analytical read models, generated transaction volume, and managed enterprise identity.",
      evidence: [
        "PostgreSQL aggregate persistence is available",
        "Ledger analytics snapshots are persisted and fingerprinted by learner/admin scope",
        "Generated ledgers support configurable transaction volume profiles",
        "Generated ledger documents are materialized into durable simulation-ledger records",
        "Organisation-managed roles and account lifecycle controls are established",
        "Password recovery and access lifecycle audit history are available",
        "OIDC and SAML adapter contracts are documented for production wiring",
        "Dedicated warehouse-style read tables remain planned",
      ],
      nextAction:
        "Promote analytics snapshots and high-volume operational records to dedicated PostgreSQL tables.",
    }),
    milestone({
      id: "managed-operations",
      title: "Managed model and release operations",
      status: "Planned",
      weight: 5,
      progress: modelProgress,
      summary:
        "External model enhancement, hosted telemetry, release promotion, and production support controls.",
      evidence: [
        input.mentor.configured
          ? `External mentor model ${input.mentor.model} is configured`
          : "Grounded local mentor is active; external model remains optional",
        "Compact internal observability is available",
        "External telemetry and managed promotion remain planned",
      ],
      nextAction:
        "Connect hosted model and observability providers, then automate release promotion.",
    }),
  ];

  const overallProgress = Math.round(
    milestones.reduce(
      (total, current) => total + current.weight * (current.progress / 100),
      0,
    ),
  );
  const currentFocus =
    milestones.find((current) => current.status === "In progress") ??
    milestones.find((current) => current.status === "Planned") ??
    milestones[milestones.length - 1];

  return {
    version: "MVP foundation",
    overallProgress,
    status:
      overallProgress >= 100
        ? "Complete"
        : overallProgress >= 75
          ? "Advanced build"
          : overallProgress >= 40
            ? "Core build"
            : "Foundation",
    summary: {
      milestones: milestones.length,
      complete: milestones.filter((current) => current.status === "Complete")
        .length,
      inProgress: milestones.filter(
        (current) => current.status === "In progress",
      ).length,
      planned: milestones.filter((current) => current.status === "Planned")
        .length,
    },
    currentFocus: {
      id: currentFocus.id,
      title: currentFocus.title,
      nextAction: currentFocus.nextAction,
    },
    milestones,
    estimateNote:
      "Completion is a weighted product-roadmap estimate based on implemented capabilities and live readiness evidence; it is not a deployment approval.",
  };
}
