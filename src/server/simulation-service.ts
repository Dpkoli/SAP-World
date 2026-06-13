import "server-only";

import {
  businessPartners,
  enterpriseSummary,
  enterpriseUnits,
  employees,
  plants,
} from "@/data/enterprise";
import { documentFlows } from "@/data/document-flows";
import {
  batches,
  billsOfMaterial,
  materials,
  qualitySpecifications,
  routings,
  sourceRecords,
  workCenters,
} from "@/data/master-data";
import {
  activity,
  kpis,
  learningPaths,
  processCatalog,
  processScenarios,
  processSteps,
} from "@/data/simulation";
import {
  analyticsPeriods,
  performanceDrivers,
  profitabilitySegments,
} from "@/data/analytics";
import {
  governanceAuditTrail,
  governanceDefinitions,
} from "@/data/governance";
import { workflowAuditTrail, workflowDefinitions } from "@/data/workflows";
import { advancedTransactionDefinitions } from "@/data/advanced-transactions";
import { industryBlueprints } from "@/data/industry-blueprints";
import { industryEnterprises } from "@/data/industries";
import { simulationFiscalYears } from "@/data/generated-simulations";

export function getEnterpriseSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    enterprise: enterpriseSummary,
    industryPortfolio: industryEnterprises.map((industry) => ({
      ...industry,
      blueprint: industryBlueprints.find(
        (blueprint) => blueprint.id === industry.id,
      ),
    })),
    simulationStudio: {
      deterministic: true,
      eventSourcedExecution: true,
      optimisticConcurrency: true,
      fiscalYears: simulationFiscalYears,
      templateVersion: "sap-world-v1",
      maxSavedPerLearner: 25,
      eventsPerExecution: 6,
      ledgerDocumentsPerSimulation: 144,
      ledgerProcessChains: 24,
      ledgerIntegrityChecks: true,
    },
    organization: enterpriseUnits,
    plants,
    businessPartners,
    employees,
    masterData: {
      materials,
      billsOfMaterial,
      routings,
      workCenters,
      batches,
      qualitySpecifications,
      sourceRecords,
    },
    operations: {
      kpis,
      activity,
      activeProcess: processSteps,
      processScenarios,
      documentFlows,
      workflows: workflowDefinitions,
      workflowAuditTrail,
      advancedTransactions: advancedTransactionDefinitions,
      analytics: {
        periods: analyticsPeriods,
        drivers: performanceDrivers,
        profitability: profitabilitySegments,
      },
      governance: {
        changeRequests: governanceDefinitions,
        auditTrail: governanceAuditTrail,
      },
    },
    learning: {
      paths: learningPaths,
      processCatalog,
    },
  };
}
