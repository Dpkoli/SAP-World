import type { ScenarioId } from "@/data/progress";

export type WorkflowStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Information required";

export type WorkflowAction = "approve" | "reject" | "request-information";

export type WorkflowStep = {
  sequence: number;
  role: string;
  assignee: string;
  status: "Completed" | "Current" | "Waiting";
  completedAt: string | null;
  decision: string | null;
  comment: string | null;
};

export type WorkflowDefinition = {
  id: string;
  scenarioId: ScenarioId;
  title: string;
  documentType: string;
  documentNumber: string;
  module: string;
  requestedBy: string;
  requestedAt: string;
  dueAt: string;
  priority: "Normal" | "High" | "Critical";
  amount: string;
  businessReason: string;
  policyRule: string;
  risk: string;
  blockingImpact: string;
  controlEvidence: string[];
  status: WorkflowStatus;
  currentStep: number;
  allowedActions: WorkflowAction[];
  steps: WorkflowStep[];
};

export type WorkflowAuditEntry = {
  id: string;
  workflowId: string;
  at: string;
  actor: string;
  actorRole: string;
  action: string;
  comment: string;
};

export type WorkflowCase = WorkflowDefinition & {
  auditTrail: WorkflowAuditEntry[];
};

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "WF-P2P-PO-001",
    scenarioId: "p2p",
    title: "Release malt purchase order",
    documentType: "Purchase Order",
    documentNumber: "4500011842",
    module: "MM / Flexible Workflow",
    requestedBy: "Emma Clarke, Buyer",
    requestedAt: "2026-06-12T08:42:00.000Z",
    dueAt: "2026-06-12T10:00:00.000Z",
    priority: "High",
    amount: "GBP 14,800",
    businessReason:
      "Replenish seven days of Pale Ale Malt demand before the next brewing campaign.",
    policyRule:
      "Raw-material purchase orders above GBP 10,000 require Category Manager approval.",
    risk:
      "Late approval creates a production-material shortage; premature approval accepts supplier, price, and quality commitments.",
    blockingImpact:
      "The purchase order cannot be sent to Highland Maltings until release is complete.",
    controlEvidence: [
      "Approved source PIR-1000012-MALT",
      "Contract price GBP 0.74/KG",
      "Supplier quality score 94/100",
      "Demand traced to purchase requisition 10002871",
    ],
    status: "Approved",
    currentStep: 2,
    allowedActions: [],
    steps: [
      { sequence: 1, role: "Buyer", assignee: "Emma Clarke", status: "Completed", completedAt: "2026-06-12T08:42:00.000Z", decision: "Submitted", comment: "PO created from approved MRP requisition." },
      { sequence: 2, role: "Category Manager", assignee: "Oliver Grant", status: "Completed", completedAt: "2026-06-12T09:02:00.000Z", decision: "Approved", comment: "Price and source align to contract." },
    ],
  },
  {
    id: "WF-O2C-CREDIT-001",
    scenarioId: "o2c",
    title: "Release customer credit block",
    documentType: "Credit Case / Sales Order",
    documentNumber: "182934",
    module: "FSCM Credit Management / SD",
    requestedBy: "Maya Evans, Sales Coordinator",
    requestedAt: "2026-06-12T10:22:00.000Z",
    dueAt: "2026-06-12T12:00:00.000Z",
    priority: "Critical",
    amount: "GBP 46,720",
    businessReason:
      "Northern Taverns requires the order for weekend on-trade demand and has requested same-day release.",
    policyRule:
      "Exposure above the GBP 175,000 limit or invoices more than 14 days overdue require Credit Manager acceptance.",
    risk:
      "Customer exposure is GBP 184,000 and invoice 900771 is 22 days overdue.",
    blockingImpact:
      "Delivery creation and warehouse allocation remain blocked until the credit decision is recorded.",
    controlEvidence: [
      "Current exposure GBP 184,000",
      "Credit limit GBP 175,000",
      "Overdue invoice 900771: GBP 31,000",
      "Customer payment history: 91% on time",
    ],
    status: "Pending",
    currentStep: 2,
    allowedActions: ["approve", "reject", "request-information"],
    steps: [
      { sequence: 1, role: "Sales Coordinator", assignee: "Maya Evans", status: "Completed", completedAt: "2026-06-12T10:22:00.000Z", decision: "Submitted", comment: "Customer requested urgent weekend replenishment." },
      { sequence: 2, role: "Credit Manager", assignee: "Lauren Price", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Sales Director", assignee: "James Walker", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "WF-PTP-SUB-001",
    scenarioId: "ptp",
    title: "Approve substitute hop batch",
    documentType: "Production Deviation",
    documentNumber: "DEV-1000051842",
    module: "PP / QM / Workflow",
    requestedBy: "Noah Foster, Production Planner",
    requestedAt: "2026-06-12T09:36:00.000Z",
    dueAt: "2026-06-12T11:00:00.000Z",
    priority: "Critical",
    amount: "GBP 9,740 material exposure",
    businessReason:
      "The planned Citra batch is blocked; an approved substitute is needed to protect production order 1000051842.",
    policyRule:
      "Recipe component substitutions require Quality and Brewmaster approval before production-order release.",
    risk:
      "An unvalidated substitute can change bitterness, aroma, allergen evidence, and finished-batch traceability.",
    blockingImpact:
      "Production order release remains blocked with missing-parts status.",
    controlEvidence: [
      "Substitute batch analytical certificate",
      "Recipe tolerance assessment",
      "Customer specification impact review",
      "Updated batch genealogy proposal",
    ],
    status: "Pending",
    currentStep: 2,
    allowedActions: ["approve", "reject", "request-information"],
    steps: [
      { sequence: 1, role: "Production Planner", assignee: "Noah Foster", status: "Completed", completedAt: "2026-06-12T09:36:00.000Z", decision: "Submitted", comment: "Primary batch HOPS-260410-C is blocked." },
      { sequence: 2, role: "Quality Manager", assignee: "Martin Hughes", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Brewmaster", assignee: "Sarah Bennett", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "WF-R2R-JRN-001",
    scenarioId: "r2r",
    title: "Approve utilities accrual journal",
    documentType: "G/L Journal Entry",
    documentNumber: "1900005184",
    module: "FI-GL / Journal Entry Workflow",
    requestedBy: "Grace Turner, Financial Accountant",
    requestedAt: "2026-06-30T18:44:00.000Z",
    dueAt: "2026-06-30T20:00:00.000Z",
    priority: "High",
    amount: "GBP 86,400",
    businessReason:
      "Recognize June utilities consumed before the supplier invoice arrives.",
    policyRule:
      "Manual journals above GBP 50,000 require Financial Controller approval and supporting calculation.",
    risk:
      "An unsupported accrual can materially misstate operating expense and liabilities.",
    blockingImpact:
      "Period-close task ACCRUAL-03 cannot complete until approval and posting.",
    controlEvidence: [
      "Meter consumption report",
      "Approved tariff schedule",
      "Prior-month reasonableness comparison",
      "Automatic reversal date 1 July 2026",
    ],
    status: "Approved",
    currentStep: 2,
    allowedActions: [],
    steps: [
      { sequence: 1, role: "Financial Accountant", assignee: "Grace Turner", status: "Completed", completedAt: "2026-06-30T18:44:00.000Z", decision: "Submitted", comment: "Calculation attached and reversal scheduled." },
      { sequence: 2, role: "Financial Controller", assignee: "Ethan Brooks", status: "Completed", completedAt: "2026-06-30T19:05:00.000Z", decision: "Approved", comment: "Consumption and tariff evidence reconciled." },
    ],
  },
  {
    id: "WF-QM-UD-001",
    scenarioId: "qm",
    title: "Decide disposition of failed malt batch",
    documentType: "Usage Decision",
    documentNumber: "0400001844",
    module: "QM / MM",
    requestedBy: "Aisha Rahman, Quality Technician",
    requestedAt: "2026-06-12T15:28:00.000Z",
    dueAt: "2026-06-12T17:00:00.000Z",
    priority: "Critical",
    amount: "GBP 14,800 inventory",
    businessReason:
      "Moisture measured 6.4% against a 5.5% maximum; the batch is needed for next week's brew plan.",
    policyRule:
      "Critical specification failures require Quality Manager disposition and Procurement acknowledgement.",
    risk:
      "Concession may affect yield and storage stability; rejection may create a production shortage.",
    blockingImpact:
      "20,000 KG remains in quality-inspection stock and cannot be consumed.",
    controlEvidence: [
      "Result MIC-MALT-MOIST: 6.4%",
      "Specification maximum: 5.5%",
      "Retest and calibration evidence",
      "Supplier notification draft",
    ],
    status: "Pending",
    currentStep: 2,
    allowedActions: ["approve", "reject", "request-information"],
    steps: [
      { sequence: 1, role: "Quality Technician", assignee: "Aisha Rahman", status: "Completed", completedAt: "2026-06-12T15:28:00.000Z", decision: "Submitted", comment: "Recommend supplier return after confirmed retest." },
      { sequence: 2, role: "Quality Manager", assignee: "Martin Hughes", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Procurement Manager", assignee: "Oliver Grant", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "WF-PM-EMG-001",
    scenarioId: "pm",
    title: "Authorize emergency bearing procurement",
    documentType: "Emergency Purchase Requisition",
    documentNumber: "PR-EMG-260612-04",
    module: "PM / MM / Flexible Workflow",
    requestedBy: "Daniel Cooper, Maintenance Planner",
    requestedAt: "2026-06-12T06:54:00.000Z",
    dueAt: "2026-06-12T07:30:00.000Z",
    priority: "Critical",
    amount: "GBP 4,860",
    businessReason:
      "The boiler feed pump is down and unrestricted stock of bearing SP-BRG-6312 is zero.",
    policyRule:
      "Emergency procurement with premium freight requires Maintenance Manager and Procurement Manager approval.",
    risk:
      "Delay extends brewery utility downtime; uncontrolled substitution creates equipment and safety risk.",
    blockingImpact:
      "Maintenance execution cannot proceed until an approved bearing is available.",
    controlEvidence: [
      "Equipment BOM confirms SP-BRG-6312",
      "No approved substitute",
      "Downtime cost GBP 8,200/hour",
      "Supplier lead time reduced from 10 days to 6 hours",
    ],
    status: "Approved",
    currentStep: 3,
    allowedActions: [],
    steps: [
      { sequence: 1, role: "Maintenance Planner", assignee: "Daniel Cooper", status: "Completed", completedAt: "2026-06-12T06:54:00.000Z", decision: "Submitted", comment: "Critical utility asset unavailable." },
      { sequence: 2, role: "Maintenance Manager", assignee: "Priya Shah", status: "Completed", completedAt: "2026-06-12T07:04:00.000Z", decision: "Approved", comment: "Technical requirement and downtime impact confirmed." },
      { sequence: 3, role: "Procurement Manager", assignee: "Oliver Grant", status: "Completed", completedAt: "2026-06-12T07:12:00.000Z", decision: "Approved", comment: "Premium freight accepted against outage exposure." },
    ],
  },
  {
    id: "WF-H2R-HIRE-001",
    scenarioId: "h2r",
    title: "Approve Quality Technician hire",
    documentType: "Position / Hire Workflow",
    documentNumber: "POS-BR01-QA-07",
    module: "SuccessFactors / HCM",
    requestedBy: "Martin Hughes, Quality Manager",
    requestedAt: "2026-06-02T08:20:00.000Z",
    dueAt: "2026-06-03T17:00:00.000Z",
    priority: "Normal",
    amount: "GBP 36,800 annual salary",
    businessReason:
      "Inspection workload increased with retail volume and requires one additional Quality Technician.",
    policyRule:
      "New headcount requires department, finance, and HR approval against the workforce plan.",
    risk:
      "Unapproved headcount creates budget and access risk; delay leaves laboratory capacity below demand.",
    blockingImpact:
      "Recruitment and employee creation cannot begin until position approval is complete.",
    controlEvidence: [
      "Approved workforce plan vacancy",
      "Cost centre BR01-QA budget",
      "Position grade and salary band",
      "Segregation-of-duties role review",
    ],
    status: "Approved",
    currentStep: 3,
    allowedActions: [],
    steps: [
      { sequence: 1, role: "Quality Manager", assignee: "Martin Hughes", status: "Completed", completedAt: "2026-06-02T08:20:00.000Z", decision: "Submitted", comment: "Volume growth increased inspection demand." },
      { sequence: 2, role: "Finance Business Partner", assignee: "Ethan Brooks", status: "Completed", completedAt: "2026-06-02T14:40:00.000Z", decision: "Approved", comment: "Position is within FY27 workforce budget." },
      { sequence: 3, role: "HR Business Partner", assignee: "Amelia Scott", status: "Completed", completedAt: "2026-06-03T09:15:00.000Z", decision: "Approved", comment: "Grade, contract, and organization are valid." },
    ],
  },
  {
    id: "WF-W2D-SHORT-001",
    scenarioId: "w2d",
    title: "Approve short-delivery quantity change",
    documentType: "Outbound Delivery Change",
    documentNumber: "800018447",
    module: "EWM / SD",
    requestedBy: "Sophie Williams, Warehouse Team Lead",
    requestedAt: "2026-06-12T14:18:00.000Z",
    dueAt: "2026-06-12T14:45:00.000Z",
    priority: "Critical",
    amount: "24 kegs / GBP 2,880 revenue",
    businessReason:
      "Twenty-four kegs are unavailable after a batch block; the carrier is waiting at door D04.",
    policyRule:
      "Customer delivery reductions require Sales approval and a documented customer-service response.",
    risk:
      "Unauthorized reduction creates customer, billing, and proof-of-delivery disputes.",
    blockingImpact:
      "Picking completion and post goods issue remain blocked.",
    controlEvidence: [
      "Warehouse exception DIFW for 24 EA",
      "No unrestricted replacement batch",
      "Customer service contacted",
      "Revised delivery and billing quantity proposal",
    ],
    status: "Pending",
    currentStep: 2,
    allowedActions: ["approve", "reject", "request-information"],
    steps: [
      { sequence: 1, role: "Warehouse Team Lead", assignee: "Sophie Williams", status: "Completed", completedAt: "2026-06-12T14:18:00.000Z", decision: "Submitted", comment: "No unrestricted stock before carrier cut-off." },
      { sequence: 2, role: "Sales Manager", assignee: "James Walker", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Customer Service", assignee: "Maya Evans", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
];

export const workflowAuditTrail: WorkflowAuditEntry[] =
  workflowDefinitions.flatMap((workflow) =>
    workflow.steps
      .filter((step) => step.completedAt && step.decision)
      .map((step) => ({
        id: `${workflow.id}-${step.sequence}`,
        workflowId: workflow.id,
        at: step.completedAt!,
        actor: step.assignee,
        actorRole: step.role,
        action: step.decision!,
        comment: step.comment ?? "",
      })),
  );

export function workflowById(id: string) {
  return workflowDefinitions.find((workflow) => workflow.id === id);
}
