import "server-only";

import {
  businessPartners,
  enterpriseSummary,
  enterpriseUnits,
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
