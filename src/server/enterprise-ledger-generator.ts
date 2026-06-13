import "server-only";

import { createHash } from "node:crypto";

import {
  simulationFiscalYears,
  type GeneratedSimulation,
  type SimulationFiscalYear,
} from "@/data/generated-simulations";
import {
  simulationLedgerProcesses,
  type SimulationLedger,
  type SimulationLedgerDocument,
  type SimulationLedgerProcess,
} from "@/data/simulation-ledger";
import { industryBlueprintById } from "@/data/industry-blueprints";

type DocumentTemplate = {
  type: string;
  module: string;
  purpose: string;
  inventoryImpact: string;
  debit: string | null;
  credit: string | null;
};

type ProcessTemplate = {
  code: string;
  unit: string | null;
  baseQuantity: number;
  baseAmount: number;
  documents: DocumentTemplate[];
};

const processTemplates: Record<SimulationLedgerProcess, ProcessTemplate> = {
  "Procure-to-Pay": {
    code: "P2P",
    unit: "EA",
    baseQuantity: 420,
    baseAmount: 46800,
    documents: [
      { type: "Purchase Requisition", module: "MM", purpose: "Records approved material or service demand.", inventoryImpact: "No stock movement; future supply is requested.", debit: null, credit: null },
      { type: "Purchase Order", module: "MM / Ariba", purpose: "Commits quantity, price, supplier, and delivery terms.", inventoryImpact: "Expected receipts become visible to planning.", debit: null, credit: null },
      { type: "Goods Receipt", module: "MM / EWM", purpose: "Records custody and accepted delivered quantity.", inventoryImpact: "Received stock increases in the controlled destination status.", debit: "Inventory or expense", credit: "GR/IR clearing" },
      { type: "Quality Decision", module: "QM", purpose: "Releases, blocks, or returns inspection-controlled supply.", inventoryImpact: "Accepted quantity becomes unrestricted; rejected quantity remains blocked.", debit: null, credit: null },
      { type: "Supplier Invoice", module: "FI / MM", purpose: "Matches supplier liability to order, receipt, and tax evidence.", inventoryImpact: "No quantity movement; price variance can affect inventory value.", debit: "GR/IR clearing and input tax", credit: "Supplier payable" },
      { type: "Vendor Payment", module: "FI", purpose: "Settles the approved supplier obligation.", inventoryImpact: "No inventory movement.", debit: "Supplier payable", credit: "Bank clearing" },
    ],
  },
  "Order-to-Cash": {
    code: "O2C",
    unit: "EA",
    baseQuantity: 315,
    baseAmount: 72900,
    documents: [
      { type: "Customer Order", module: "SD", purpose: "Captures requested product, price, delivery date, and customer commitment.", inventoryImpact: "Available stock is confirmed or future supply is requested.", debit: null, credit: null },
      { type: "Credit Approval", module: "SD / FI", purpose: "Authorizes exposure against customer credit policy.", inventoryImpact: "No stock movement; delivery eligibility is controlled.", debit: null, credit: null },
      { type: "Outbound Delivery", module: "SD / EWM", purpose: "Creates the warehouse fulfilment demand.", inventoryImpact: "Confirmed stock is allocated to the delivery.", debit: null, credit: null },
      { type: "Goods Issue", module: "EWM / MM", purpose: "Records legal and physical transfer of dispatched goods.", inventoryImpact: "Finished or merchandise stock decreases.", debit: "Cost of goods sold", credit: "Inventory" },
      { type: "Customer Billing", module: "SD / FI", purpose: "Recognizes revenue, tax, and the customer receivable.", inventoryImpact: "No further quantity movement.", debit: "Customer receivable", credit: "Revenue and output tax" },
      { type: "Customer Receipt", module: "FI", purpose: "Clears the customer open item against bank receipt.", inventoryImpact: "No inventory movement.", debit: "Bank clearing", credit: "Customer receivable" },
    ],
  },
  "Plan-to-Produce": {
    code: "PTP",
    unit: "EA",
    baseQuantity: 520,
    baseAmount: 58300,
    documents: [
      { type: "Planned Independent Requirement", module: "IBP / PP", purpose: "Translates demand into dated supply requirements.", inventoryImpact: "Projected demand reduces future available quantity.", debit: null, credit: null },
      { type: "MRP Planned Order", module: "PP / MM", purpose: "Creates feasible planned supply from demand and master data.", inventoryImpact: "Planned receipts and component requirements are created.", debit: null, credit: null },
      { type: "Production Order", module: "PP", purpose: "Authorizes production with BOM, routing, dates, and target cost.", inventoryImpact: "Components are reserved for execution.", debit: null, credit: null },
      { type: "Component Issue", module: "PP / EWM", purpose: "Posts consumed components to the production order.", inventoryImpact: "Raw material stock decreases and work in process increases.", debit: "Production order", credit: "Raw material inventory" },
      { type: "Production Confirmation", module: "PP / CO", purpose: "Records yield, scrap, labour, machine time, and completion.", inventoryImpact: "Work in process and expected finished quantity are updated.", debit: "Production order", credit: "Cost centre activity" },
      { type: "Finished Goods Receipt", module: "PP / FI", purpose: "Receives completed output and credits the production order.", inventoryImpact: "Finished-goods stock increases in the relevant quality status.", debit: "Finished goods inventory", credit: "Production order" },
    ],
  },
  "Record-to-Report": {
    code: "R2R",
    unit: null,
    baseQuantity: 0,
    baseAmount: 136000,
    documents: [
      { type: "Subledger Reconciliation", module: "FI", purpose: "Reconciles AP, AR, bank, inventory, and asset subledgers.", inventoryImpact: "No physical movement; quantity/value differences are identified.", debit: null, credit: null },
      { type: "Accrual Posting", module: "FI", purpose: "Recognizes evidenced cost in the correct accounting period.", inventoryImpact: "No quantity movement.", debit: "Operating expense", credit: "Accrued liability" },
      { type: "Cost Allocation", module: "CO", purpose: "Moves shared service cost to the consuming responsibility centres.", inventoryImpact: "No physical movement; product or service cost is completed.", debit: "Receiver cost centres", credit: "Sender cost centre" },
      { type: "Variance Calculation", module: "CO / PP", purpose: "Explains actual-versus-target production or service cost.", inventoryImpact: "Inventory valuation exposure is quantified.", debit: null, credit: null },
      { type: "Settlement", module: "CO / FI", purpose: "Clears order balances to their valid receivers.", inventoryImpact: "Inventory or profitability receives the approved variance.", debit: "Inventory or profitability", credit: "Order balance" },
      { type: "Financial Close", module: "FI / Analytics", purpose: "Closes the period and publishes reconciled reporting.", inventoryImpact: "No quantity movement; financial inventory value is finalized.", debit: null, credit: null },
    ],
  },
  "Warehouse-to-Dispatch": {
    code: "W2D",
    unit: "HU",
    baseQuantity: 84,
    baseAmount: 39700,
    documents: [
      { type: "Warehouse Request", module: "EWM", purpose: "Converts delivery demand into warehouse work.", inventoryImpact: "Stock becomes committed to an outbound requirement.", debit: null, credit: null },
      { type: "Wave Release", module: "EWM", purpose: "Groups work by route, cut-off, capacity, and priority.", inventoryImpact: "Committed stock is sequenced for picking.", debit: null, credit: null },
      { type: "Warehouse Task", module: "EWM", purpose: "Moves handling units from storage to staging.", inventoryImpact: "Stock location changes while ownership and value remain stable.", debit: null, credit: null },
      { type: "Packing Confirmation", module: "EWM", purpose: "Confirms packaging, labels, weight, and handling-unit hierarchy.", inventoryImpact: "Picked stock is packed and ready for load.", debit: null, credit: null },
      { type: "Freight Order", module: "TM", purpose: "Assigns carrier, vehicle, route, appointments, and freight cost.", inventoryImpact: "Staged stock is assigned to transport capacity.", debit: "Freight expense", credit: "Carrier accrual" },
      { type: "Dispatch Confirmation", module: "TM / SD", purpose: "Confirms loading, departure, custody, and customer ETA.", inventoryImpact: "Stock leaves the shipping location and is posted in transit or issued.", debit: "Cost of goods sold", credit: "Inventory" },
    ],
  },
  "Quality Management": {
    code: "QM",
    unit: "LOT",
    baseQuantity: 18,
    baseAmount: 28400,
    documents: [
      { type: "Inspection Lot", module: "QM", purpose: "Creates traceable inspection demand from a supply or production event.", inventoryImpact: "Affected quantity is held in quality inspection status.", debit: null, credit: null },
      { type: "Sample Record", module: "QM", purpose: "Records representative sample identity and custody.", inventoryImpact: "No quantity movement; sample consumption may be recorded.", debit: null, credit: null },
      { type: "Inspection Results", module: "QM", purpose: "Compares measured characteristics with approved specifications.", inventoryImpact: "Stock remains controlled pending usage decision.", debit: null, credit: null },
      { type: "Quality Notification", module: "QM", purpose: "Records defect, cause, responsibility, and corrective action.", inventoryImpact: "Defective quantity remains blocked or segregated.", debit: "Quality loss expense", credit: "Inventory provision" },
      { type: "Usage Decision", module: "QM / MM", purpose: "Authorizes release, rework, return, or scrap.", inventoryImpact: "Quantity moves to unrestricted, blocked, return, or scrap status.", debit: null, credit: null },
      { type: "Supplier Evaluation", module: "QM / MM", purpose: "Feeds quality performance into future sourcing decisions.", inventoryImpact: "No stock movement; source eligibility and risk are updated.", debit: null, credit: null },
    ],
  },
  "Plant Maintenance": {
    code: "PM",
    unit: "HR",
    baseQuantity: 46,
    baseAmount: 33100,
    documents: [
      { type: "Maintenance Notification", module: "PM", purpose: "Records technical failure, priority, safety, and production impact.", inventoryImpact: "No movement; critical spare demand may be triggered.", debit: null, credit: null },
      { type: "Maintenance Order", module: "PM / CO", purpose: "Authorizes work scope, resources, materials, and cost collection.", inventoryImpact: "Required spare parts are reserved.", debit: null, credit: null },
      { type: "Safety Clearance", module: "PM / EHS", purpose: "Confirms isolation, permits, and safe execution conditions.", inventoryImpact: "No inventory movement.", debit: null, credit: null },
      { type: "Spare Parts Issue", module: "MM / EWM", purpose: "Posts repair materials to the maintenance order.", inventoryImpact: "Spare-parts stock decreases.", debit: "Maintenance order", credit: "Spare-parts inventory" },
      { type: "Work Confirmation", module: "PM / CO", purpose: "Records labour, services, findings, and restoration time.", inventoryImpact: "No further stock movement.", debit: "Maintenance order", credit: "Cost centre activity" },
      { type: "Technical Completion", module: "PM / Analytics", purpose: "Closes execution and updates failure history and strategy.", inventoryImpact: "Reservations are cleared and unused parts are returned.", debit: "Maintenance expense", credit: "Maintenance order settlement" },
    ],
  },
  "Hire-to-Retire": {
    code: "H2R",
    unit: "EMP",
    baseQuantity: 12,
    baseAmount: 51600,
    documents: [
      { type: "Workforce Requisition", module: "SuccessFactors", purpose: "Records approved capacity, role, grade, and funding demand.", inventoryImpact: "No inventory impact.", debit: null, credit: null },
      { type: "Candidate Selection", module: "SuccessFactors", purpose: "Records compliant selection and offer evidence.", inventoryImpact: "No inventory impact.", debit: null, credit: null },
      { type: "Employee Master", module: "HCM", purpose: "Creates effective-dated personal and employment records.", inventoryImpact: "No inventory impact.", debit: null, credit: null },
      { type: "Organizational Assignment", module: "HCM / CO", purpose: "Connects employee, position, manager, company code, and cost centre.", inventoryImpact: "No inventory impact.", debit: null, credit: null },
      { type: "Payroll Posting", module: "HCM / FI", purpose: "Recognizes payroll expense, liabilities, and cost assignment.", inventoryImpact: "No inventory impact.", debit: "Payroll expense", credit: "Payroll liabilities" },
      { type: "Capability Record", module: "SuccessFactors", purpose: "Records mandatory learning, role readiness, and performance evidence.", inventoryImpact: "No inventory impact.", debit: null, credit: null },
    ],
  },
};

function deterministicNumber(seed: string, modulo: number, minimum = 0) {
  const hash = createHash("sha256").update(seed).digest("hex");
  return minimum + (Number.parseInt(hash.slice(0, 12), 16) % modulo);
}

function postingDate(
  fiscalYear: SimulationFiscalYear,
  processIndex: number,
  documentIndex: number,
) {
  const startYear = Number(fiscalYear.slice(0, 4));
  const monthOffset = processIndex;
  const month = 3 + monthOffset;
  const year = startYear + Math.floor(month / 12);
  const normalizedMonth = month % 12;
  const day = 4 + documentIndex * 3;
  return new Date(Date.UTC(year, normalizedMonth, day, 9 + documentIndex, 0, 0)).toISOString();
}

function documentNumber(
  signature: string,
  code: string,
  yearIndex: number,
  chainIndex: number,
  documentIndex: number,
) {
  const numeric = deterministicNumber(
    `${signature}|${code}|${yearIndex}|${chainIndex}|${documentIndex}`,
    10_000_000_000,
  );
  return `${code}-${String(numeric).padStart(10, "0")}`;
}

function summarize(
  simulation: GeneratedSimulation,
  documents: SimulationLedgerDocument[],
): SimulationLedger["summary"] {
  const chains = new Map<string, SimulationLedgerDocument[]>();
  for (const document of documents) {
    const chain = chains.get(document.chainId) ?? [];
    chain.push(document);
    chains.set(document.chainId, chain);
  }
  const chainValues = Array.from(chains.values()).map(
    (chain) => chain[0]?.amount ?? 0,
  );
  const documentNumbers = new Set(documents.map((document) => document.number));
  const brokenLinks = documents.reduce((count, document) => {
    const upstreamBroken =
      document.upstreamDocument !== null &&
      !documentNumbers.has(document.upstreamDocument);
    const downstreamBroken =
      document.downstreamDocument !== null &&
      !documentNumbers.has(document.downstreamDocument);
    return count + (upstreamBroken || downstreamBroken ? 1 : 0);
  }, 0);
  const orphanDocuments = Array.from(chains.values()).reduce(
    (count, chain) => count + (chain.length === 6 ? 0 : chain.length),
    0,
  );
  const balancedJournalDocuments = documents.filter(
    (document) =>
      document.journalEntries.length > 0 &&
      document.journalEntries.every((entry) => entry.amount > 0),
  ).length;

  return {
    simulationId: simulation.id,
    signature: simulation.signature,
    documentCount: documents.length,
    processChainCount: chains.size,
    transactionValue: chainValues.reduce((total, value) => total + value, 0),
    exceptionCount: documents.filter((document) => document.exception).length,
    fiscalYears: simulationFiscalYears.map((fiscalYear) => {
      const yearDocuments = documents.filter(
        (document) => document.fiscalYear === fiscalYear,
      );
      const yearChains = new Map(
        yearDocuments.map((document) => [document.chainId, document.amount]),
      );
      return {
        fiscalYear,
        documents: yearDocuments.length,
        processChains: yearChains.size,
        transactionValue: Array.from(yearChains.values()).reduce(
          (total, value) => total + value,
          0,
        ),
        exceptions: yearDocuments.filter((document) => document.exception)
          .length,
      };
    }),
    processCoverage: [...simulationLedgerProcesses],
    integrity: {
      orphanDocuments,
      brokenLinks,
      balancedJournalDocuments,
      status: orphanDocuments === 0 && brokenLinks === 0 ? "Passed" : "Failed",
    },
  };
}

export function generateEnterpriseLedger(
  simulation: GeneratedSimulation,
): SimulationLedger {
  const blueprint = industryBlueprintById(simulation.industryId);
  const documents: SimulationLedgerDocument[] = [];

  simulationFiscalYears.forEach((fiscalYear, yearIndex) => {
    const maturityMultiplier = 1 + yearIndex * 0.14;
    simulationLedgerProcesses.forEach((process, processIndex) => {
      const template = processTemplates[process];
      const chainId = `${simulation.id}-${fiscalYear}-${template.code}`;
      const quantity =
        template.baseQuantity === 0
          ? null
          : Math.round(
              template.baseQuantity *
                maturityMultiplier *
                (0.92 +
                  deterministicNumber(
                    `${simulation.signature}|${chainId}|quantity`,
                    17,
                  ) /
                    100),
            );
      const amount = Math.round(
        template.baseAmount *
          maturityMultiplier *
          (0.9 +
            deterministicNumber(
              `${simulation.signature}|${chainId}|amount`,
              23,
            ) /
              100),
      );
      const numbers = template.documents.map((_, documentIndex) =>
        documentNumber(
          simulation.signature,
          template.code,
          yearIndex,
          processIndex,
          documentIndex,
        ),
      );
      const hasException =
        (processIndex + yearIndex + simulation.eventIndex) % 3 === 0;
      const exceptionDocumentIndex = 2 + (simulation.eventIndex % 2);
      const selectedProblem =
        blueprint.commonProblems[
          (simulation.eventIndex + processIndex + yearIndex) %
            blueprint.commonProblems.length
        ];

      template.documents.forEach((document, documentIndex) => {
        const carriesException =
          hasException && documentIndex === exceptionDocumentIndex;
        const postingAmount =
          document.debit && document.credit
            ? Math.round(amount * (0.78 + documentIndex * 0.04))
            : 0;
        documents.push({
          id: `${chainId}-${documentIndex + 1}`,
          chainId,
          simulationId: simulation.id,
          signature: simulation.signature,
          fiscalYear,
          postingDate: postingDate(
            fiscalYear,
            processIndex,
            documentIndex,
          ),
          process,
          sequence: documentIndex + 1,
          type: document.type,
          number: numbers[documentIndex],
          module: document.module,
          status: carriesException
            ? "Exception resolved"
            : documentIndex === 1
              ? "Approved"
              : documentIndex === template.documents.length - 1
                ? "Completed"
                : "Posted",
          businessPurpose: document.purpose,
          quantity,
          unit: quantity === null ? null : template.unit,
          amount,
          currency: "GBP",
          upstreamDocument:
            documentIndex === 0 ? null : numbers[documentIndex - 1],
          downstreamDocument:
            documentIndex === numbers.length - 1
              ? null
              : numbers[documentIndex + 1],
          inventoryImpact: document.inventoryImpact,
          accountingImpact:
            document.debit && document.credit
              ? `Posts GBP ${postingAmount.toLocaleString("en-GB")} from ${document.credit} to ${document.debit}.`
              : "No FI journal is posted by this document; it controls a later operational or accounting event.",
          journalEntries:
            document.debit && document.credit
              ? [
                  {
                    debit: document.debit,
                    credit: document.credit,
                    amount: postingAmount,
                    currency: "GBP",
                  },
                ]
              : [],
          exception: carriesException
            ? {
                issue: selectedProblem.issue,
                signal: selectedProblem.signal,
                resolution: selectedProblem.sapResponse,
              }
            : null,
        });
      });
    });
  });

  documents.sort(
    (left, right) =>
      left.postingDate.localeCompare(right.postingDate) ||
      left.chainId.localeCompare(right.chainId) ||
      left.sequence - right.sequence,
  );

  return {
    summary: summarize(simulation, documents),
    documents,
  };
}
