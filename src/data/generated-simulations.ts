import type { IndustryId } from "@/data/industries";

export type SimulationFiscalYear =
  | "2023-2024"
  | "2024-2025"
  | "2025-2026";

export type SimulationVolumeTier =
  | "representative"
  | "growth"
  | "enterprise";

export type SimulationVolumeProfile = {
  tier: SimulationVolumeTier;
  label: string;
  processRunsPerYear: number;
  exposureMultiplier: number;
  description: string;
};

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

export type SimulationExecutionEvent = {
  id: string;
  simulationId: string;
  signature: string;
  version: number;
  type: "SimulationStepCompleted";
  step: number;
  title: string;
  documentNumber: string;
  actor: string;
  note: string;
  occurredAt: string;
};

export type SimulationExecution = {
  simulationId: string;
  signature: string;
  status: "Not started" | "In progress" | "Completed";
  version: number;
  currentStep: number | null;
  completedSteps: number[];
  completedDocuments: string[];
  operationalState: string;
  inventoryState: string;
  financialState: string;
  events: SimulationExecutionEvent[];
};

export type GeneratedSimulation = {
  id: string;
  signature: string;
  industryId: IndustryId;
  industry: string;
  enterprise: string;
  fiscalYear: SimulationFiscalYear;
  eventIndex: number;
  volumeTier: SimulationVolumeTier;
  volumeProfile: SimulationVolumeProfile;
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
  execution?: SimulationExecution;
};

export const simulationFiscalYears: SimulationFiscalYear[] = [
  "2023-2024",
  "2024-2025",
  "2025-2026",
];

export const simulationVolumeProfiles: Record<
  SimulationVolumeTier,
  SimulationVolumeProfile
> = {
  representative: {
    tier: "representative",
    label: "Representative",
    processRunsPerYear: 1,
    exposureMultiplier: 1,
    description:
      "One connected run per process and year for focused tutor walkthroughs.",
  },
  growth: {
    tier: "growth",
    label: "Growth company",
    processRunsPerYear: 3,
    exposureMultiplier: 2.4,
    description:
      "Three operating runs per process and year to show repeatable seasonal growth.",
  },
  enterprise: {
    tier: "enterprise",
    label: "Enterprise scale",
    processRunsPerYear: 5,
    exposureMultiplier: 4.8,
    description:
      "Five operating runs per process and year for larger multi-site transaction history.",
  },
};

export const simulationVolumeTiers = Object.keys(
  simulationVolumeProfiles,
) as SimulationVolumeTier[];

export function isSimulationVolumeTier(
  value: unknown,
): value is SimulationVolumeTier {
  return (
    typeof value === "string" &&
    simulationVolumeTiers.includes(value as SimulationVolumeTier)
  );
}

export function simulationVolumeProfileFor(
  value: SimulationVolumeTier | undefined,
) {
  return simulationVolumeProfiles[value ?? "representative"];
}
