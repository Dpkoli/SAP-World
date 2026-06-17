import {
  processScenarios,
  type ProcessScenario,
  type TutorStep,
} from "@/data/simulation";

type ScenarioId = ProcessScenario["id"];

export type TransactionPlaybookStage = {
  sequence: number;
  title: string;
  app: string;
  transactionCode: string;
  screenArea: string;
  action: string;
  why: string;
  expectedResult: string;
  keyFields: { label: string; value: string }[];
  validations: string[];
};

export type TransactionPlaybook = {
  scenarioId: ScenarioId;
  processCode: string;
  title: string;
  module: string;
  sapEntry: {
    fioriApp: string;
    transactionCode: string;
    role: string;
  };
  businessTrigger: string;
  prerequisites: string[];
  documentChain: string[];
  processingRules: string[];
  stages: TransactionPlaybookStage[];
  completionEvidence: string[];
  commonErrors: {
    symptom: string;
    prevention: string;
    correction: string;
  }[];
};

const prerequisiteMap: Record<ScenarioId, string[]> = {
  p2p: [
    "Approved purchase order exists with open quantity.",
    "Material is extended to the receiving plant and storage location.",
    "Supplier delivery note and batch details are available.",
    "Quality inspection setup is active for the material.",
  ],
  o2c: [
    "Sold-to, ship-to, payer, and bill-to partners are maintained.",
    "Customer credit exposure is within the agreed limit or has approval.",
    "Material pricing, tax, and delivery plant determination are complete.",
    "Requested delivery date is supported by ATP or supply commitment.",
  ],
  ptp: [
    "Finished product has a valid BOM, routing, and production version.",
    "Demand exists from forecast, sales order, or replenishment plan.",
    "Work centres and activity prices are current for costing and scheduling.",
    "Component source records and lead times are maintained.",
  ],
  r2r: [
    "Subledger close tasks are complete or exception-approved.",
    "Open inventory, production, asset, tax, and bank tasks are reviewed.",
    "Posting period is open only for authorized close roles.",
    "Close evidence folder and ownership matrix are ready.",
  ],
  qm: [
    "Inspection lot exists from the goods receipt or production event.",
    "Inspection plan and quality specifications are released.",
    "Sample results and defect evidence are available.",
    "Usage decision authorization is assigned to the quality role.",
  ],
  pm: [
    "Maintenance notification captures equipment, symptom, and priority.",
    "Safety isolation and permit requirements are understood.",
    "Spares availability and technician capacity are checked.",
    "Settlement receiver and cost centre are valid.",
  ],
  h2r: [
    "Approved position, offer, and start date are available.",
    "Organization, cost centre, payroll area, and work schedule are known.",
    "Identity, bank, tax, and statutory information is complete.",
    "Onboarding, equipment, and learning tasks are assigned.",
  ],
  w2d: [
    "Outbound delivery is due and not blocked.",
    "Warehouse stock, batches, route, carrier, and door capacity are available.",
    "Picking wave rules and handling-unit packaging are configured.",
    "Transport handover requirements are agreed with the carrier.",
  ],
};

const ruleMap: Record<ScenarioId, string[]> = {
  p2p: [
    "Always receive against the purchase order, not as an unreferenced movement.",
    "Post into the correct stock type so quality, inventory, and FI stay aligned.",
    "Do not change the PO quantity during receipt; handle differences as controlled exceptions.",
  ],
  o2c: [
    "Do not save the order until pricing, tax, partner, route, and credit status are understood.",
    "Order creation does not post revenue or inventory; financial impact starts later in the flow.",
    "Use customer reference data so service teams can trace the commercial commitment.",
  ],
  ptp: [
    "Treat MRP output as a proposal until planner validation confirms feasibility.",
    "Release production only after capacity and component availability checks are acceptable.",
    "Keep the production order as the cost collector for actual materials, labour, and overhead.",
  ],
  r2r: [
    "Close tasks must follow dependency order: subledgers, adjustments, allocations, settlement, reporting.",
    "Every manual posting needs a business reason, approver, and reversal logic when applicable.",
    "Published periods should be protected from routine late postings.",
  ],
  qm: [
    "Record measured results before the usage decision.",
    "Do not release quality stock without evidence and authorization.",
    "Defects, returns, scrap, and supplier score changes must reconcile to the usage decision.",
  ],
  pm: [
    "Separate notification evidence from maintenance-order execution.",
    "Reserve spares before issuing them so availability is visible.",
    "Technician confirmation, goods issue, and settlement must all agree before closure.",
  ],
  h2r: [
    "Use effective dates consistently across employment, organization, time, and payroll records.",
    "Payroll-relevant data must be correct before the first payroll simulation.",
    "Security, equipment, learning, and statutory tasks must close the onboarding loop.",
  ],
  w2d: [
    "Picking and packing change warehouse status; post goods issue changes inventory valuation.",
    "Carrier loading must not be confirmed until handling units and quantities are verified.",
    "Proof-of-delivery exceptions must remain linked to the original delivery and freight order.",
  ],
};

const errorMap: Record<ScenarioId, TransactionPlaybook["commonErrors"]> = {
  p2p: [
    {
      symptom: "SAP proposes the wrong quantity or blocks posting.",
      prevention: "Check open PO quantity, overdelivery tolerance, and prior receipts before posting.",
      correction: "Use the PO history and material document list to identify the mismatch, then correct the receipt or adjust the PO through approval.",
    },
    {
      symptom: "The batch cannot be released to production.",
      prevention: "Post to quality inspection stock when inspection is required.",
      correction: "Complete results recording and usage decision before moving stock to unrestricted use.",
    },
  ],
  o2c: [
    {
      symptom: "The sales order saves with a credit or delivery block.",
      prevention: "Review customer credit exposure, payment terms, and delivery dates before save.",
      correction: "Resolve the block through credit release or delivery rescheduling before warehouse execution.",
    },
    {
      symptom: "Pricing or VAT differs from the customer agreement.",
      prevention: "Validate condition records, customer tax classification, and contract reference.",
      correction: "Correct the pricing condition or tax data before delivery and billing.",
    },
  ],
  ptp: [
    {
      symptom: "MRP creates proposals that production cannot execute.",
      prevention: "Validate capacity, BOM status, routing, and component availability before conversion.",
      correction: "Reschedule, split quantity, substitute components, or escalate supply shortage before release.",
    },
    {
      symptom: "Production cost variance becomes unexplained.",
      prevention: "Confirm that planned cost, activity rates, and material standards are current.",
      correction: "Review confirmations, goods issues, scrap, and settlement receiver before closing the order.",
    },
  ],
  r2r: [
    {
      symptom: "Trial balance changes after close review.",
      prevention: "Restrict posting periods and keep late adjustments on an approval route.",
      correction: "Identify the late document, assess reporting impact, reverse or approve it, then republish evidence.",
    },
    {
      symptom: "Subledger does not reconcile to the general ledger.",
      prevention: "Run reconciliation before manual close journals.",
      correction: "Age the difference by source document and correct the subledger or approved GL adjustment.",
    },
  ],
  qm: [
    {
      symptom: "Accepted results do not make stock available.",
      prevention: "Remember that results recording is evidence; usage decision is the release transaction.",
      correction: "Post the correct usage decision and confirm the stock-type movement.",
    },
    {
      symptom: "Supplier performance is not updated.",
      prevention: "Link defect codes and inspection outcomes to vendor evaluation logic.",
      correction: "Complete defect recording and supplier quality action before closing the lot.",
    },
  ],
  pm: [
    {
      symptom: "Spares are unavailable during emergency work.",
      prevention: "Create reservations and review stock before dispatching technicians.",
      correction: "Escalate substitute material, urgent procurement, or cannibalization through controlled approval.",
    },
    {
      symptom: "Maintenance order cannot close.",
      prevention: "Confirm labour, issue materials, attach test evidence, and settle costs before technical completion.",
      correction: "Clear open confirmations, reservations, and settlement errors, then complete the order.",
    },
  ],
  h2r: [
    {
      symptom: "Payroll simulation rejects the employee.",
      prevention: "Complete payroll area, bank, tax, time, and cost-centre infotypes before simulation.",
      correction: "Fix the missing effective-dated record and rerun payroll simulation before live posting.",
    },
    {
      symptom: "Labour cost posts to the wrong department.",
      prevention: "Validate organizational assignment and cost centre before the first payroll run.",
      correction: "Correct master data and post payroll cost reclassification if the period has already posted.",
    },
  ],
  w2d: [
    {
      symptom: "Post goods issue is blocked.",
      prevention: "Confirm picking, packing, delivery completeness, route, and batch status before PGI.",
      correction: "Resolve the failed status in delivery or warehouse monitor, then rerun PGI.",
    },
    {
      symptom: "Customer claim cannot be traced.",
      prevention: "Keep handling units, freight order, seal number, and proof-of-delivery evidence linked.",
      correction: "Reconstruct the chain from delivery, warehouse task, HU, freight order, and POD records.",
    },
  ],
};

function screenAreaFor(step: TutorStep) {
  if (step.title.toLowerCase().includes("open")) return "Launchpad or SAP Easy Access";
  if (step.title.toLowerCase().includes("review")) return "Overview and status tabs";
  if (step.title.toLowerCase().includes("check")) return "Validation messages";
  if (step.title.toLowerCase().includes("post")) return "Posting or save action";
  return "Transaction header and item details";
}

function validationFor(step: TutorStep) {
  return [
    "Confirm the SAP object number and organizational unit before continuing.",
    "Resolve red or blocking messages rather than bypassing them.",
    ...(step.fields ?? []).map(
      (field) => `Validate ${field.label.toLowerCase()} = ${field.value}.`,
    ),
  ];
}

function buildPlaybook(scenario: ProcessScenario): TransactionPlaybook {
  return {
    scenarioId: scenario.id,
    processCode: scenario.code,
    title: scenario.tutorTitle,
    module: scenario.module,
    sapEntry: {
      fioriApp: scenario.appName,
      transactionCode: scenario.transactionCode,
      role: scenario.partyLabel,
    },
    businessTrigger: `${scenario.scenario}: ${scenario.party} (${scenario.value}).`,
    prerequisites: prerequisiteMap[scenario.id],
    documentChain: scenario.steps.map(
      (step) => `${step.label} (${step.module}) - ${step.document}`,
    ),
    processingRules: ruleMap[scenario.id],
    stages: scenario.tutorSteps.map((step) => ({
      sequence: step.number,
      title: step.title,
      app: scenario.appName,
      transactionCode: scenario.transactionCode,
      screenArea: screenAreaFor(step),
      action: step.instruction,
      why: step.why,
      expectedResult: step.result,
      keyFields: step.fields ?? [],
      validations: validationFor(step),
    })),
    completionEvidence: [
      `Completed ${scenario.title} lesson with knowledge check evidence.`,
      ...scenario.steps
        .filter((step) => step.document !== "Pending")
        .map((step) => `${step.label} document ${step.document}`),
      ...scenario.impacts.map((impact) => `${impact.label}: ${impact.title}`),
    ],
    commonErrors: errorMap[scenario.id],
  };
}

export const transactionPlaybooks = processScenarios.map(buildPlaybook);

export function transactionPlaybookFor(scenarioId: string) {
  return transactionPlaybooks.find(
    (playbook) => playbook.scenarioId === scenarioId,
  );
}
