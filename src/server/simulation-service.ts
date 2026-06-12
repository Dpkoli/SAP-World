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
import { workflowAuditTrail, workflowDefinitions } from "@/data/workflows";

export function getEnterpriseSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    enterprise: enterpriseSummary,
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
    },
    learning: {
      paths: learningPaths,
      processCatalog,
    },
  };
}
