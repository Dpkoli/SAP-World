import "server-only";

import {
  businessPartners,
  enterpriseSummary,
  enterpriseUnits,
  employees,
  plants,
} from "@/data/enterprise";
import {
  activity,
  kpis,
  learningPaths,
  processCatalog,
  processScenarios,
  processSteps,
} from "@/data/simulation";

export function getEnterpriseSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    enterprise: enterpriseSummary,
    organization: enterpriseUnits,
    plants,
    businessPartners,
    employees,
    operations: {
      kpis,
      activity,
      activeProcess: processSteps,
      processScenarios,
    },
    learning: {
      paths: learningPaths,
      processCatalog,
    },
  };
}
