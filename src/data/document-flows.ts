import {
  processScenarios,
  type ProcessScenario,
  type ProcessStep,
} from "@/data/simulation";
import type { ScenarioId } from "@/data/progress";

export type AccountingEntry = {
  debit: string;
  credit: string;
  amount: string;
  explanation: string;
};

export type DocumentFlowNode = ProcessStep & {
  sequence: number;
  objectType: string;
  postedAt: string;
  createdBy: string;
  purpose: string;
  approval: string;
  workflowStatus: string;
  inventoryImpact: string;
  accountingImpact: string;
  accountingEntries: AccountingEntry[];
  upstreamDocument: string | null;
  downstreamDocument: string | null;
};

export type DocumentFlow = {
  id: string;
  processId: ScenarioId;
  scenarioCode: string;
  title: string;
  businessObject: string;
  modules: string[];
  exceptionReference: string;
  nodes: DocumentFlowNode[];
};

type NodeDetail = Omit<
  DocumentFlowNode,
  keyof ProcessStep | "sequence" | "upstreamDocument" | "downstreamDocument"
>;

const noEntry: AccountingEntry[] = [];

const details: Record<ScenarioId, Record<string, NodeDetail>> = {
  p2p: {
    PR: detail("Purchase Requisition", "12 Jun 2026 08:14", "MRP Controller", "Signals an approved internal need for malt.", "Manager approval complete", "Released", "No stock movement.", "No FI posting.", noEntry),
    PO: detail("Purchase Order", "12 Jun 2026 09:02", "Buyer", "Creates the commercial commitment with Highland Maltings.", "Purchasing approval complete", "Sent to supplier", "No stock movement; ordered stock is visible as an expected receipt.", "Commitment only; no G/L posting.", noEntry),
    GR: detail("Material Document", "12 Jun 2026 13:42", "Warehouse Operative", "Records physical receipt against the purchase order.", "Warehouse posting authority", "Posted", "20,000 KG enters quality-inspection stock.", "Inventory is debited and GR/IR is credited.", [entry("Raw material inventory", "GR/IR clearing", "GBP 14,800", "Recognizes received malt before the supplier invoice.")]),
    QI: detail("Inspection Lot", "12 Jun 2026 13:42", "SAP QM", "Controls laboratory checks before production can consume the batch.", "Quality usage decision pending", "In inspection", "Stock remains in quality inspection.", "No additional FI posting unless disposition changes value.", noEntry),
    IV: detail("Supplier Invoice", "Pending", "Accounts Payable", "Matches the supplier claim to the PO and accepted receipt.", "Three-way match pending", "Waiting", "No stock movement.", "Clears GR/IR and creates the supplier liability.", [entry("GR/IR clearing", "Supplier payable", "GBP 14,800", "Recognizes the vendor liability after matching.")]),
    PAY: detail("Payment Document", "Pending", "Treasury", "Settles the approved supplier liability.", "Payment proposal approval pending", "Waiting", "No stock movement.", "Clears the supplier and credits bank.", [entry("Supplier payable", "Bank clearing", "GBP 14,800", "Settles the approved invoice.")]),
  },
  o2c: {
    SO: detail("Sales Order", "12 Jun 2026 10:18", "Sales Coordinator", "Captures customer demand, pricing, dates, and credit exposure.", "Credit check passed", "Confirmed", "400 kegs are confirmed but not removed.", "No FI posting at order entry.", noEntry),
    ATP: detail("Availability Confirmation", "12 Jun 2026 10:18", "SAP ATP", "Protects inventory and planned supply for the requested date.", "Automatic availability policy", "Confirmed", "400 kegs are allocated to the requirement.", "No G/L posting.", noEntry),
    DLV: detail("Outbound Delivery", "12 Jun 2026 11:05", "Shipping Coordinator", "Creates the executable warehouse and transport requirement.", "Delivery release complete", "In warehouse", "Stock becomes delivery-relevant but remains on hand.", "No G/L posting.", noEntry),
    PGI: detail("Goods Issue Material Document", "Pending", "Warehouse Supervisor", "Records the legal and physical handover to the carrier.", "Picking and loading completion required", "Waiting", "400 kegs leave finished-goods stock.", "Credits inventory and debits cost of goods sold.", [entry("Cost of goods sold", "Finished-goods inventory", "GBP 27,200", "Recognizes product cost at customer handover.")]),
    BIL: detail("Billing Document", "Pending", "Billing Clerk", "Creates the customer invoice from the completed delivery.", "Billing due-list control", "Waiting", "No stock movement.", "Debits customer receivable and credits revenue and tax.", [entry("Customer receivable", "Revenue and output tax", "GBP 46,720", "Recognizes the commercial sale.")]),
    PAY: detail("Incoming Payment", "Pending", "Accounts Receivable", "Matches customer cash to the open invoice.", "Bank statement matching", "Waiting", "No stock movement.", "Debits bank and clears the customer receivable.", [entry("Bank", "Customer receivable", "GBP 46,720", "Settles the customer balance.")]),
  },
  ptp: {
    DEM: detail("Planned Independent Requirement", "11 Jun 2026 17:00", "Demand Planner", "Represents approved replenishment demand for Amber Ale.", "S&OP plan approved", "Active", "Creates planning demand only.", "No FI posting.", noEntry),
    MRP: detail("MRP Run", "12 Jun 2026 05:30", "SAP MRP Live", "Nets demand, stock, receipts, lead times, BOMs, and lot sizes.", "Scheduled planning job", "Completed", "Calculates shortages and dated requirements.", "No FI posting.", noEntry),
    PLN: detail("Planned Order", "12 Jun 2026 05:34", "SAP MRP Live", "Proposes 500 HL of supply to cover the shortage.", "Planner review complete", "Converted", "Creates dependent component requirements.", "Carries planned cost only.", noEntry),
    PRD: detail("Production Order", "12 Jun 2026 09:25", "Production Planner", "Authorizes brewing operations, materials, capacity, and cost collection.", "Release checks passed", "Released", "Reserves BOM components.", "Creates commitments and a cost collector.", noEntry),
    STG: detail("Warehouse Staging Tasks", "Pending", "Warehouse Team", "Moves malt, hops, yeast, kegs, and labels to production supply.", "Order release required", "Waiting", "Transfers components to production staging.", "Usually no value change between locations.", noEntry),
    CNF: detail("Order Confirmation and Receipt", "Pending", "Production Supervisor", "Records yield, activity, component consumption, and finished output.", "Process completion checks", "Waiting", "Consumes components and receives finished beer.", "Posts material consumption, activity cost, and finished-goods receipt.", [entry("Production order", "Raw material inventory", "GBP 18,640", "Records component consumption."), entry("Finished-goods inventory", "Production order", "GBP 31,480", "Receives planned output.")]),
    SET: detail("Settlement Document", "Pending", "Cost Accountant", "Clears the production-order balance and assigns variances.", "Period-end settlement approval", "Waiting", "No physical stock movement.", "Settles production variance to inventory or profitability.", [entry("Production variance", "Production order", "GBP 1,120", "Clears the remaining order balance.")]),
  },
  r2r: {
    SUB: detail("Subledger Reconciliation", "30 Jun 2026 18:10", "Financial Accountant", "Proves AP, AR, inventory, and asset balances agree with the G/L.", "Close task sign-off", "Completed", "No stock movement.", "Validates balances without posting.", noEntry),
    ACC: detail("Accrual Journal", "30 Jun 2026 19:05", "Financial Accountant", "Recognizes utilities consumed before the supplier invoice arrives.", "Journal approval complete", "Posted", "No stock movement.", "Debits expense and credits accrued liability.", [entry("Utilities expense", "Accrued liabilities", "GBP 86,400", "Matches expense to the period consumed.")]),
    ALL: detail("CO Allocation", "30 Jun 2026 20:20", "Cost Accountant", "Distributes shared service cost to operational cost centres.", "Allocation cycle approved", "Posted", "No stock movement.", "Reassigns management-accounting cost.", [entry("Receiver cost centres", "Shared service cost centre", "GBP 312,400", "Moves cost to the consuming functions.")]),
    VAR: detail("Variance Calculation", "30 Jun 2026 21:00", "Product Cost Controller", "Explains actual versus target production cost.", "Production orders technically complete", "Calculated", "No quantity movement.", "Calculates settlement-relevant production variance.", noEntry),
    SET: detail("Order Settlement", "30 Jun 2026 21:35", "Product Cost Controller", "Transfers production-order balances to their final receivers.", "Settlement run approved", "Posted", "May adjust inventory valuation depending on policy.", "Clears production orders and posts variances.", [entry("Variance / inventory receiver", "Production orders", "GBP 142,800", "Clears period production balances.")]),
    CLS: detail("Period Close", "30 Jun 2026 23:00", "Finance Manager", "Locks normal posting after close evidence is approved.", "Controller sign-off complete", "Closed", "No stock movement.", "Prevents unauthorized late financial change.", noEntry),
    RPT: detail("Financial Report", "01 Jul 2026 07:30", "Group Reporting Analyst", "Publishes reconciled statutory and management results for the closed period.", "Finance director sign-off required", "Waiting", "No stock movement.", "Reports approved balances without creating a new posting.", noEntry),
  },
  qm: {
    GR: detail("Material Document", "12 Jun 2026 13:42", "Warehouse Operative", "Receives inspection-relevant malt into controlled stock.", "Warehouse posting authority", "Posted", "20,000 KG enters quality-inspection stock.", "Posts inventory against GR/IR.", [entry("Raw material inventory", "GR/IR clearing", "GBP 14,800", "Recognizes the received batch.")]),
    LOT: detail("Inspection Lot", "12 Jun 2026 13:42", "SAP QM", "Creates the inspection scope, sample, and characteristics.", "Automatic inspection type 01", "Created", "Entire batch remains unavailable.", "No additional posting.", noEntry),
    SMP: detail("Physical Sample", "12 Jun 2026 14:05", "Quality Technician", "Provides a traceable laboratory sample from the supplier batch.", "Sampling procedure approved", "Taken", "No quantity or value change.", "No FI posting.", noEntry),
    RES: detail("Inspection Results", "12 Jun 2026 15:20", "Quality Technician", "Records moisture, protein, extract, colour, and contamination evidence.", "Results validation pending", "Recorded", "Stock remains in inspection.", "No FI posting.", noEntry),
    DEF: detail("Quality Notification", "12 Jun 2026 15:24", "Quality Technician", "Records the out-of-specification moisture defect and supplier responsibility.", "Quality manager review", "Open", "Batch remains blocked from use.", "Potential claim only; no posting yet.", noEntry),
    UD: detail("Usage Decision", "Pending", "Quality Manager", "Authorizes release, return, concession, rework, or scrap.", "Quality disposition authority", "Waiting", "Chosen code determines the final stock type.", "Return or scrap can reverse value or create loss.", noEntry),
    STK: detail("Stock Posting", "Pending", "SAP QM / MM", "Executes the approved usage-decision disposition.", "Usage decision required", "Waiting", "Moves stock to unrestricted, blocked, return, or scrap.", "Posts only when the disposition changes value.", noEntry),
    VEN: detail("Supplier Evaluation", "Pending", "Supplier Quality Engineer", "Updates supplier quality performance from the inspection and defect outcome.", "Usage decision and notification completion", "Waiting", "No stock movement.", "Can influence sourcing decisions without creating an FI posting.", noEntry),
  },
  pm: {
    NTF: detail("Maintenance Notification", "12 Jun 2026 06:18", "Utilities Operator", "Records pump failure, priority, symptoms, and technical object.", "Priority validation complete", "Created", "No stock movement.", "No FI posting.", noEntry),
    ORD: detail("Maintenance Order", "12 Jun 2026 06:42", "Maintenance Planner", "Authorizes labour, materials, safety, purchasing, and cost capture.", "Maintenance manager approval", "Released", "Reserves required spare parts.", "Creates commitments on the maintenance order.", noEntry),
    RSV: detail("Material Reservation", "12 Jun 2026 06:45", "SAP PM", "Protects the bearing and seal kit for the repair.", "Order release required", "Shortage", "Confirmed quantity is zero for the critical bearing.", "No actual cost until goods issue.", noEntry),
    REL: detail("Order Release", "12 Jun 2026 07:02", "Maintenance Manager", "Confirms that scope, permits, capacity, and planned cost are authorized for execution.", "Maintenance and safety approval", "Released", "Enables reservations and goods issue but does not move stock.", "Creates executable commitments without actual posting.", noEntry),
    EXE: detail("Execution and Confirmation", "Pending", "Maintenance Technician", "Issues approved spares and records labour, work, and failure evidence.", "Available stock and safe-work permit required", "Waiting", "Reduces spare-parts inventory when components are issued.", "Posts material and activity cost to the maintenance order.", [entry("Maintenance order", "Spare-parts inventory", "GBP 2,850", "Captures actual repair material cost."), entry("Maintenance order", "Internal activity allocation", "GBP 7,100", "Captures technician and workshop activity.")]),
    TEC: detail("Technical Completion", "Pending", "Maintenance Supervisor", "Confirms the asset is restored and closes operational commitments.", "Completion checks and test evidence required", "Waiting", "Releases unused reservations.", "Stops most new commitments and prepares final settlement.", noEntry),
    SET: detail("Maintenance Settlement", "Pending", "Cost Accountant", "Transfers final repair cost to the utilities cost centre.", "Technical completion required", "Waiting", "No stock movement.", "Clears the order to BR01-UTIL.", [entry("Utilities cost centre", "Maintenance order", "GBP 12,450", "Assigns breakdown cost to the responsible function.")]),
    PMF: detail("Maintenance Plan Update", "Pending", "Reliability Engineer", "Feeds failure evidence into the preventive strategy and inspection interval.", "Reliability review required", "Waiting", "No stock movement.", "No FI posting; improves future cost and uptime control.", noEntry),
  },
  h2r: {
    POS: detail("Position Approval", "02 Jun 2026 09:10", "Quality Manager", "Requests approved headcount for a Quality Technician.", "Headcount and budget approved", "Approved", "No inventory impact.", "Creates a workforce commitment, not a posting.", noEntry),
    REC: detail("Recruitment and Offer", "04 Jun 2026 16:20", "Talent Acquisition", "Records candidate selection, approved offer, and pre-hire checks.", "Hiring manager and HR approval", "Completed", "No inventory impact.", "No FI posting.", noEntry),
    HIR: detail("Hire Event", "05 Jun 2026 15:30", "HR Operations", "Creates the effective-dated employment relationship.", "Offer and right-to-work checks complete", "Completed", "No inventory impact.", "No FI posting.", noEntry),
    ORG: detail("Organizational Assignment", "05 Jun 2026 15:32", "HR Operations", "Connects employee, position, manager, company code, and cost centre.", "Position occupancy validation", "Replicated", "No inventory impact.", "Determines future payroll cost assignment.", noEntry),
    TIM: detail("Time and Benefits Profile", "05 Jun 2026 15:35", "HR Operations", "Assigns work schedule, absence, benefit, and time-valuation rules.", "HR policy rules", "Active", "No inventory impact.", "No FI posting.", noEntry),
    PAY: detail("Payroll and FI Posting", "Pending", "Payroll Administrator", "Calculates gross-to-net pay and transfers expense and liabilities to FI and CO.", "Payroll simulation and posting approval required", "Waiting", "No inventory impact.", "Debits labour cost and credits payroll liabilities.", [entry("Quality labour cost", "Payroll liabilities", "GBP 3,420", "Records salary and employer cost for the period.")]),
    DEV: detail("Learning and Performance", "Pending", "HR and Quality Manager", "Assigns compliance learning, probation objectives, and role capability evidence.", "Manager and learning-owner review", "Waiting", "No inventory impact.", "No FI posting; supports compliant role readiness.", noEntry),
    SEP: detail("Separation Event", "Future lifecycle", "HR Operations", "Ends employment, access, benefits, assets, and final pay consistently.", "Manager and HR approval required", "Future", "May trigger asset return.", "Posts final payroll and clears employee liabilities.", noEntry),
  },
  w2d: {
    OBD: detail("Outbound Delivery", "12 Jun 2026 11:05", "Shipping Coordinator", "Creates the warehouse request for the customer commitment.", "Delivery release complete", "Distributed", "400 kegs are due for warehouse execution.", "No FI posting.", noEntry),
    WAVE: detail("Warehouse Wave", "12 Jun 2026 12:00", "Warehouse Supervisor", "Groups delivery work by route, departure, labour, and door capacity.", "Wave release authority", "Released", "No stock movement.", "No FI posting.", noEntry),
    PICK: detail("Warehouse Task", "12 Jun 2026 12:08", "SAP EWM", "Directs batch-controlled stock from source bins to outbound staging.", "Wave release required", "Partially confirmed", "376 of 400 kegs moved operationally to staging.", "No FI posting before PGI.", noEntry),
    PACK: detail("Handling Units", "Pending", "Warehouse Operative", "Creates scannable load units with product, batch, weight, and labels.", "Full picking or approved short pick required", "Waiting", "No quantity or value change.", "No FI posting.", noEntry),
    LOAD: detail("Freight Order", "Pending", "Transport Planner", "Connects handling units, carrier, vehicle, door, and route milestones.", "Carrier and door assignment", "Waiting", "Stock remains company-owned until goods issue.", "No FI posting.", noEntry),
    PGI: detail("Goods Issue Material Document", "Pending", "Warehouse Supervisor", "Records carrier handover and completes the outbound movement.", "Picking, packing, and loading complete", "Blocked", "Reduces finished-goods stock by 400 kegs.", "Debits COGS and credits finished-goods inventory.", [entry("Cost of goods sold", "Finished-goods inventory", "GBP 27,200", "Recognizes product cost at dispatch.")]),
    POD: detail("Proof of Delivery", "Pending", "Carrier Integration", "Records delivery completion, shortages, damage, and customer evidence.", "Carrier milestone receipt", "Waiting", "No inventory movement.", "Supports claims and billing disputes; normally no posting.", noEntry),
  },
};

function detail(
  objectType: string,
  postedAt: string,
  createdBy: string,
  purpose: string,
  approval: string,
  workflowStatus: string,
  inventoryImpact: string,
  accountingImpact: string,
  accountingEntries: AccountingEntry[],
): NodeDetail {
  return {
    objectType,
    postedAt,
    createdBy,
    purpose,
    approval,
    workflowStatus,
    inventoryImpact,
    accountingImpact,
    accountingEntries,
  };
}

function entry(
  debit: string,
  credit: string,
  amount: string,
  explanation: string,
): AccountingEntry {
  return { debit, credit, amount, explanation };
}

const exceptionReferences: Record<ScenarioId, string> = {
  p2p: "P2P-EX-001",
  o2c: "O2C-EX-001",
  ptp: "PTP-EX-001",
  r2r: "R2R-EX-001",
  qm: "QM-EX-001",
  pm: "PM-EX-001",
  h2r: "H2R-EX-001",
  w2d: "W2D-EX-001",
};

function buildFlow(scenario: ProcessScenario): DocumentFlow {
  const nodes = scenario.steps.map((step, index) => {
    const nodeDetail = details[scenario.id][step.id];
    if (!nodeDetail) {
      throw new Error(`Missing document detail for ${scenario.id}:${step.id}`);
    }

    return {
      ...step,
      ...nodeDetail,
      sequence: index + 1,
      upstreamDocument: index === 0 ? null : scenario.steps[index - 1].document,
      downstreamDocument:
        index === scenario.steps.length - 1
          ? null
          : scenario.steps[index + 1].document,
    };
  });

  return {
    id: `FLOW-${scenario.id.toUpperCase()}-001`,
    processId: scenario.id,
    scenarioCode: scenario.code,
    title: scenario.title,
    businessObject: scenario.scenario,
    modules: Array.from(new Set(nodes.flatMap((node) => node.module.split(" / ")))),
    exceptionReference: exceptionReferences[scenario.id],
    nodes,
  };
}

export const documentFlows = processScenarios.map(buildFlow);

export function documentFlowFor(processId: ScenarioId) {
  return documentFlows.find((flow) => flow.processId === processId)!;
}
