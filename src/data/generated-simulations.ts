import type { IndustryId } from "@/data/industries";

export type SimulationFiscalYear =
  | "2023-2024"
  | "2024-2025"
  | "2025-2026";

export type GeneratedSimulationDocument = {
  sequence: number;
  type: string;
  number: string;
  module: string;
  purpose: string;
};

export type GeneratedSimulationStep = {
  sequence: number;
  title: string;
  role: string;
  app: string;
  instruction: string;
  why: string;
  result: string;
};

export type GeneratedSimulation = {
  id: string;
  signature: string;
  industryId: IndustryId;
  industry: string;
  enterprise: string;
  fiscalYear: SimulationFiscalYear;
  eventIndex: number;
  title: string;
  status: "Generated";
  generatedAt: string;
  operatingModel: string;
  customerPromise: string;
  businessContext: string;
  trigger: string;
  rootCause: string;
  seasonality: string;
  planningResponse: string;
  modules: string[];
  organization: string[];
  masterData: string[];
  upstreamDependencies: string[];
  operationalImpact: string;
  inventoryImpact: string;
  financialImpact: string;
  exposure: string;
  accountingEntries: Array<{
    debit: string;
    credit: string;
    amount: string;
    explanation: string;
  }>;
  documents: GeneratedSimulationDocument[];
  steps: GeneratedSimulationStep[];
  controls: string[];
  kpis: Array<{
    name: string;
    target: string;
    scenarioEffect: string;
  }>;
  history: Array<{
    fiscalYear: SimulationFiscalYear;
    state: string;
  }>;
};

export const simulationFiscalYears: SimulationFiscalYear[] = [
  "2023-2024",
  "2024-2025",
  "2025-2026",
];
