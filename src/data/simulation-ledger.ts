import type { SimulationFiscalYear } from "@/data/generated-simulations";

export const simulationLedgerProcesses = [
  "Procure-to-Pay",
  "Order-to-Cash",
  "Plan-to-Produce",
  "Record-to-Report",
  "Warehouse-to-Dispatch",
  "Quality Management",
  "Plant Maintenance",
  "Hire-to-Retire",
] as const;

export type SimulationLedgerProcess =
  (typeof simulationLedgerProcesses)[number];

export type SimulationLedgerJournalEntry = {
  debit: string;
  credit: string;
  amount: number;
  currency: "GBP";
};

export type SimulationLedgerDocument = {
  id: string;
  chainId: string;
  simulationId: string;
  signature: string;
  fiscalYear: SimulationFiscalYear;
  postingDate: string;
  process: SimulationLedgerProcess;
  sequence: number;
  type: string;
  number: string;
  module: string;
  status: "Posted" | "Approved" | "Completed" | "Exception resolved";
  businessPurpose: string;
  quantity: number | null;
  unit: string | null;
  amount: number;
  currency: "GBP";
  upstreamDocument: string | null;
  downstreamDocument: string | null;
  inventoryImpact: string;
  accountingImpact: string;
  journalEntries: SimulationLedgerJournalEntry[];
  exception: {
    issue: string;
    signal: string;
    resolution: string;
  } | null;
};

export type SimulationLedgerYearSummary = {
  fiscalYear: SimulationFiscalYear;
  documents: number;
  processChains: number;
  transactionValue: number;
  exceptions: number;
};

export type SimulationLedgerSummary = {
  simulationId: string;
  signature: string;
  documentCount: number;
  processChainCount: number;
  transactionValue: number;
  exceptionCount: number;
  fiscalYears: SimulationLedgerYearSummary[];
  processCoverage: SimulationLedgerProcess[];
  integrity: {
    orphanDocuments: number;
    brokenLinks: number;
    balancedJournalDocuments: number;
    status: "Passed" | "Failed";
  };
};

export type SimulationLedger = {
  summary: SimulationLedgerSummary;
  documents: SimulationLedgerDocument[];
};
