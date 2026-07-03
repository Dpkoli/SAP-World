import "server-only";

import { advancedTransactionDefinitions } from "@/data/advanced-transactions";
import { analyticsPeriods, performanceDrivers } from "@/data/analytics";
import { governanceDefinitions } from "@/data/governance";
import { implementationBlueprints } from "@/data/implementation";
import { industryBlueprints } from "@/data/industry-blueprints";
import { industryPracticeCoverage } from "@/data/industry-practice-data";
import { industryEnterprises } from "@/data/industries";
import {
  batches,
  billsOfMaterial,
  materials,
  qualitySpecifications,
  routings,
  sourceRecords,
  workCenters,
} from "@/data/master-data";
import { processScenarios } from "@/data/simulation";
import { transactionPlaybooks } from "@/data/transaction-playbooks";
import { troubleshootingCases } from "@/data/troubleshooting";
import { workflowDefinitions } from "@/data/workflows";

type GateStatus = "Pass" | "Warning" | "Fail";

export type ContentControlGate = {
  label: string;
  status: GateStatus;
  evidence: string;
};

export type ContentControlItem = {
  id: string;
  domain: string;
  owner: string;
  version: string;
  status: "Released" | "Review required" | "Blocked";
  records: number;
  readiness: number;
  gates: ContentControlGate[];
  releaseNotes: string[];
};

function gate(
  label: string,
  condition: boolean,
  evidence: string,
  warning = false,
): ContentControlGate {
  return {
    label,
    status: condition ? "Pass" : warning ? "Warning" : "Fail",
    evidence,
  };
}

function item(input: {
  id: string;
  domain: string;
  owner: string;
  version: string;
  records: number;
  gates: ContentControlGate[];
  releaseNotes: string[];
}): ContentControlItem {
  const score = input.gates.reduce((total, current) => {
    if (current.status === "Pass") return total + 1;
    if (current.status === "Warning") return total + 0.5;
    return total;
  }, 0);
  const readiness = Math.round((score / Math.max(1, input.gates.length)) * 100);
  const hasFailure = input.gates.some((current) => current.status === "Fail");
  const hasWarning = input.gates.some((current) => current.status === "Warning");

  return {
    ...input,
    readiness,
    status: hasFailure
      ? "Blocked"
      : hasWarning
        ? "Review required"
        : "Released",
  };
}

export function getContentControlRegister() {
  const liveIndustries = industryEnterprises.filter(
    (industry) => industry.status === "live",
  ).length;
  const processCoverage = processScenarios.length;
  const masterRecords =
    materials.length +
    billsOfMaterial.length +
    routings.length +
    workCenters.length +
    batches.length +
    qualitySpecifications.length +
    sourceRecords.length;

  const register = [
    item({
      id: "industry-blueprints",
      domain: "Industry blueprints",
      owner: "SAP Industry Architect",
      version: "sap-world-industry-v2",
      records: industryBlueprints.length,
      gates: [
        gate(
          "Ten target industries covered",
          industryBlueprints.length === 10,
          `${industryBlueprints.length}/10 industry blueprints`,
        ),
        gate(
          "All industry enterprises live",
          liveIndustries === 10,
          `${liveIndustries}/10 live industry enterprises`,
        ),
        gate(
          "Three-year practice data complete",
          industryPracticeCoverage.every(
            (coverage) =>
              coverage.monthlyRecords === 36 &&
              coverage.fiscalYears === 3 &&
              coverage.specialistTransactions >= 3,
          ),
          `${industryPracticeCoverage.reduce((total, coverage) => total + coverage.monthlyRecords, 0)} monthly industry records`,
        ),
        gate(
          "Compliance and seasonality documented",
          industryBlueprints.every(
            (blueprint) =>
              blueprint.compliance.length > 0 &&
              blueprint.seasonality.length > 0,
          ),
          "Compliance and demand behavior present",
        ),
      ],
      releaseNotes: [
        "Industry models define operating model, value chain, compliance, KPIs, dependencies, and common failures.",
        "All ten industries include three fiscal years, monthly operating and financial data, SAP configuration workstreams, costing models, and specialist transaction chains.",
      ],
    }),
    item({
      id: "process-curriculum",
      domain: "Process curriculum",
      owner: "SAP Solution Lead",
      version: "sap-world-process-v1",
      records: processCoverage,
      gates: [
        gate(
          "Eight core process flows covered",
          processCoverage === 8,
          `${processCoverage}/8 process scenarios`,
        ),
        gate(
          "Tutor steps exist",
          processScenarios.every((scenario) => scenario.tutorSteps.length >= 4),
          "Every scenario has guided steps",
        ),
        gate(
          "Knowledge checks exist",
          processScenarios.every(
            (scenario) => scenario.knowledgeCheck.options.length >= 3,
          ),
          "Every scenario has an assessed question",
        ),
      ],
      releaseNotes: [
        "P2P, O2C, PTP, R2R, QM, PM, H2R, and W2D have connected learner flows.",
        "Readiness is calculated from learner progress and diagnostic completion.",
      ],
    }),
    item({
      id: "transaction-playbooks",
      domain: "Transaction playbooks",
      owner: "SAP Training Lead",
      version: "sap-world-playbook-v1",
      records: transactionPlaybooks.length,
      gates: [
        gate(
          "Playbook per guided process",
          transactionPlaybooks.length === processScenarios.length,
          `${transactionPlaybooks.length}/${processScenarios.length} playbooks`,
        ),
        gate(
          "Prerequisites captured",
          transactionPlaybooks.every(
            (playbook) => playbook.prerequisites.length >= 3,
          ),
          "Prerequisite checks available",
        ),
        gate(
          "Common mistakes captured",
          transactionPlaybooks.every(
            (playbook) => playbook.commonErrors.length >= 2,
          ),
          "Error prevention and correction available",
        ),
      ],
      releaseNotes: [
        "Playbooks define SAP entry points, fields, validations, document chains, and completion evidence.",
        "The mentor retrieval corpus uses the same controlled playbook content.",
      ],
    }),
    item({
      id: "implementation-blueprints",
      domain: "Implementation blueprints",
      owner: "SAP Implementation Manager",
      version: "sap-world-implementation-v1",
      records: implementationBlueprints.length,
      gates: [
        gate(
          "Blueprint per process",
          implementationBlueprints.length === processScenarios.length,
          `${implementationBlueprints.length}/${processScenarios.length} implementation blueprints`,
        ),
        gate(
          "Configuration decisions present",
          implementationBlueprints.every(
            (blueprint) => blueprint.configuration.length >= 3,
          ),
          "Configuration controls documented",
        ),
        gate(
          "Validation tests present",
          implementationBlueprints.every(
            (blueprint) => blueprint.validationTests.length >= 3,
          ),
          "Test evidence defined",
        ),
      ],
      releaseNotes: [
        "Each process includes organization, master data, configuration, integrations, tests, and go-live controls.",
      ],
    }),
    item({
      id: "master-data-model",
      domain: "Master data model",
      owner: "SAP Data Architect",
      version: "sap-world-masterdata-v1",
      records: masterRecords,
      gates: [
        gate(
          "Material records maintained",
          materials.length > 0,
          `${materials.length} material records`,
        ),
        gate(
          "Manufacturing dependencies maintained",
          billsOfMaterial.length > 0 &&
            routings.length > 0 &&
            workCenters.length > 0,
          `${billsOfMaterial.length} BOMs / ${routings.length} routings / ${workCenters.length} work centres`,
        ),
        gate(
          "Quality and sourcing maintained",
          qualitySpecifications.length > 0 && sourceRecords.length > 0,
          `${qualitySpecifications.length} specs / ${sourceRecords.length} source records`,
        ),
      ],
      releaseNotes: [
        "Master data connects material, valuation, MRP, sourcing, batches, quality, BOM, routing, and work centres.",
      ],
    }),
    item({
      id: "exception-labs",
      domain: "Troubleshooting labs",
      owner: "SAP Support Lead",
      version: "sap-world-exception-v1",
      records: troubleshootingCases.length,
      gates: [
        gate(
          "Exception per process",
          troubleshootingCases.length === processScenarios.length,
          `${troubleshootingCases.length}/${processScenarios.length} diagnostic labs`,
        ),
        gate(
          "Evidence and recovery defined",
          troubleshootingCases.every(
            (lab) => lab.evidence.length >= 3 && lab.recoverySteps.length >= 2,
          ),
          "Diagnostic evidence and recovery steps present",
        ),
        gate(
          "Business impact documented",
          troubleshootingCases.every(
            (lab) => lab.impact.financial && lab.impact.operational,
          ),
          "Operational, inventory, and financial impact present",
        ),
      ],
      releaseNotes: [
        "Troubleshooting labs teach root cause, SAP evidence inspection, controlled recovery, and prevention.",
      ],
    }),
    item({
      id: "workflow-governance",
      domain: "Workflow and data governance",
      owner: "SAP Controls Lead",
      version: "sap-world-controls-v1",
      records: workflowDefinitions.length + governanceDefinitions.length,
      gates: [
        gate(
          "Workflow cases released",
          workflowDefinitions.length >= processScenarios.length,
          `${workflowDefinitions.length} workflow cases`,
        ),
        gate(
          "Governance cases released",
          governanceDefinitions.length >= 6,
          `${governanceDefinitions.length} governance requests`,
        ),
        gate(
          "Validation gates present",
          governanceDefinitions.every(
            (request) => request.validations.length >= 3,
          ),
          "Field-level validations documented",
        ),
      ],
      releaseNotes: [
        "Approval and governance cases preserve delegated authority, evidence, dependencies, and audit trails.",
      ],
    }),
    item({
      id: "advanced-transactions",
      domain: "Advanced transactions",
      owner: "SAP Senior Consultant",
      version: "sap-world-advanced-v1",
      records: advancedTransactionDefinitions.length,
      gates: [
        gate(
          "Advanced cases released",
          advancedTransactionDefinitions.length >= 5,
          `${advancedTransactionDefinitions.length} advanced cases`,
        ),
        gate(
          "Sequential execution defined",
          advancedTransactionDefinitions.every(
            (definition) => definition.steps.length >= 3,
          ),
          "Step-level execution paths present",
        ),
        gate(
          "Accounting controls present",
          advancedTransactionDefinitions.some((definition) =>
            definition.steps.some((step) => step.accountingEntries.length > 0),
          ),
          "Accounting entries available",
        ),
      ],
      releaseNotes: [
        "Advanced labs cover stock transfer, returns, asset accounting, VAT adjustment, and year-end close.",
      ],
    }),
    item({
      id: "analytics-content",
      domain: "Analytics and performance",
      owner: "Enterprise Performance Lead",
      version: "sap-world-analytics-v1",
      records: analyticsPeriods.length + performanceDrivers.length,
      gates: [
        gate(
          "Three-year analytics present",
          analyticsPeriods.length >= 12,
          `${analyticsPeriods.length} quarterly periods`,
        ),
        gate(
          "Driver explanations present",
          performanceDrivers.length >= 8,
          `${performanceDrivers.length} performance drivers`,
        ),
        gate(
          "SAP evidence linked",
          performanceDrivers.every((driver) => driver.sapEvidence.length > 0),
          "Drivers include SAP evidence references",
        ),
      ],
      releaseNotes: [
        "Analytics content explains revenue, margin, service, inventory, downtime, waste, and working-capital movement.",
      ],
    }),
  ];

  const summary = {
    domains: register.length,
    released: register.filter((entry) => entry.status === "Released").length,
    reviewRequired: register.filter((entry) => entry.status === "Review required").length,
    blocked: register.filter((entry) => entry.status === "Blocked").length,
    averageReadiness: Math.round(
      register.reduce((total, entry) => total + entry.readiness, 0) /
        Math.max(1, register.length),
    ),
    records: register.reduce((total, entry) => total + entry.records, 0),
  };

  return {
    generatedAt: new Date().toISOString(),
    summary,
    register,
  };
}
