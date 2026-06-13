export type GovernanceDomain =
  | "Material"
  | "Supplier"
  | "Customer"
  | "BOM"
  | "Pricing"
  | "Employee";

export type GovernanceStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Changes requested";

export type GovernanceAction =
  | "submit"
  | "approve"
  | "reject"
  | "request-changes";

export type GovernanceValidation = {
  id: string;
  label: string;
  status: "Pass" | "Warning" | "Fail";
  evidence: string;
};

export type GovernanceFieldChange = {
  field: string;
  before: string;
  after: string;
  rationale: string;
  critical: boolean;
};

export type GovernanceDependency = {
  object: string;
  relationship: string;
  impact: string;
};

export type GovernanceStep = {
  sequence: number;
  role: string;
  assignee: string;
  status: "Completed" | "Current" | "Waiting";
  completedAt: string | null;
  decision: string | null;
  comment: string | null;
};

export type GovernanceAuditEntry = {
  id: string;
  requestId: string;
  at: string;
  actor: string;
  actorRole: string;
  action: string;
  comment: string;
};

export type GovernanceDefinition = {
  id: string;
  domain: GovernanceDomain;
  objectId: string;
  objectName: string;
  title: string;
  requestedBy: string;
  requestedAt: string;
  effectiveDate: string;
  priority: "Normal" | "High" | "Critical";
  status: GovernanceStatus;
  currentStep: number;
  businessReason: string;
  governancePolicy: string;
  risk: string;
  fieldChanges: GovernanceFieldChange[];
  validations: GovernanceValidation[];
  dependencies: GovernanceDependency[];
  steps: GovernanceStep[];
};

export type GovernanceCase = GovernanceDefinition & {
  allowedActions: GovernanceAction[];
  auditTrail: GovernanceAuditEntry[];
};

export const governanceDefinitions: GovernanceDefinition[] = [
  {
    id: "MDG-MAT-260014",
    domain: "Material",
    objectId: "FG-AMBER-KEG-50",
    objectName: "Amber Ale 50L Keg",
    title: "Extend finished material to distribution centre",
    requestedBy: "Sophie Williams, Warehouse Team Lead",
    requestedAt: "2026-06-12T14:20:00.000Z",
    effectiveDate: "2026-06-16",
    priority: "High",
    status: "Draft",
    currentStep: 1,
    businessReason:
      "DC01 will hold saleable Amber Ale stock for northern customer dispatches and needs the material, sales, and warehouse views.",
    governancePolicy:
      "Plant or storage-location extensions require complete valuation, sales, warehouse, and quality-control views before activation.",
    risk:
      "An incomplete extension can create failed deliveries, incorrect valuation, missing batch controls, or stock that cannot be picked.",
    fieldChanges: [
      { field: "Plant", before: "BR01", after: "BR01 / DC01", rationale: "Enable distribution-centre stock ownership and planning.", critical: true },
      { field: "Storage location", before: "FG01", after: "FG01 / D001", rationale: "Create the finished-goods storage assignment at DC01.", critical: true },
      { field: "MRP area", before: "BR01", after: "BR01 / DC01", rationale: "Separate replenishment planning from brewery stock.", critical: false },
      { field: "Loading group", before: "0001", after: "0002", rationale: "Use keg-specific loading determination at DC01.", critical: false },
    ],
    validations: [
      { id: "VAL-MAT-01", label: "Valuation class inherited", status: "Pass", evidence: "7920 Finished beverages is valid for company code BCB1." },
      { id: "VAL-MAT-02", label: "Batch management consistent", status: "Pass", evidence: "Batch management remains active across BR01 and DC01." },
      { id: "VAL-MAT-03", label: "Warehouse product mapping", status: "Warning", evidence: "EWM putaway control is proposed but not yet confirmed by DC01." },
    ],
    dependencies: [
      { object: "Sales order 182934", relationship: "Delivering plant and ATP", impact: "DC01 can become the delivery source after stock transfer and ATP activation." },
      { object: "EWM warehouse DC01", relationship: "Warehouse product", impact: "Putaway, picking, staging, and handling-unit rules must exist." },
      { object: "Material ledger", relationship: "Valuation", impact: "DC01 stock retains the BCB1 standard price and valuation class." },
    ],
    steps: [
      { sequence: 1, role: "Requester", assignee: "Sophie Williams", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 2, role: "Material Data Steward", assignee: "Emily Carter", status: "Waiting", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Supply Chain Owner", assignee: "Lewis Grant", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "MDG-BP-260031",
    domain: "Supplier",
    objectId: "1000012",
    objectName: "Highland Maltings PLC",
    title: "Change supplier settlement bank account",
    requestedBy: "Vendor Administration Service",
    requestedAt: "2026-06-12T11:05:00.000Z",
    effectiveDate: "2026-06-14",
    priority: "Critical",
    status: "Pending",
    currentStep: 2,
    businessReason:
      "The supplier submitted a bank-account change following a treasury migration.",
    governancePolicy:
      "Supplier bank changes require independent callback verification, duplicate-account screening, and segregation between requester and approver.",
    risk:
      "Fraudulent bank changes can redirect approved payments even when purchasing and invoice documents are valid.",
    fieldChanges: [
      { field: "IBAN", before: "GB29 NWBK 6016 1331 9268 19", after: "GB71 BARC 2004 1536 7842 19", rationale: "Supplier treasury migration.", critical: true },
      { field: "Bank key", before: "NWBKGB2L", after: "BARCGB22", rationale: "New settlement bank.", critical: true },
      { field: "Payment method", before: "BACS", after: "BACS", rationale: "No payment-channel change requested.", critical: false },
    ],
    validations: [
      { id: "VAL-BP-01", label: "Independent callback", status: "Warning", evidence: "Callback is scheduled with the supplier contact already held in SAP." },
      { id: "VAL-BP-02", label: "Duplicate bank account", status: "Pass", evidence: "No other active business partner uses the proposed IBAN." },
      { id: "VAL-BP-03", label: "Open payment proposal", status: "Pass", evidence: "No payment run currently contains supplier 1000012." },
    ],
    dependencies: [
      { object: "Supplier invoices", relationship: "Payment destination", impact: "Open approved invoices will use the new account after the effective date." },
      { object: "Payment proposal", relationship: "Automatic payment program", impact: "The next F110 proposal must show the verified account and change log." },
      { object: "Ariba supplier profile", relationship: "Business-partner replication", impact: "The validated account must be synchronized without overwriting tax or purchasing data." },
    ],
    steps: [
      { sequence: 1, role: "Vendor Administrator", assignee: "Vendor Administration Service", status: "Completed", completedAt: "2026-06-12T11:05:00.000Z", decision: "Submitted", comment: "Supplier letter and bank evidence attached." },
      { sequence: 2, role: "Business Partner Steward", assignee: "Chloe Martin", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Treasury Approver", assignee: "Thomas Reed", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "MDG-CUST-260018",
    domain: "Customer",
    objectId: "2000017",
    objectName: "Northern Taverns Ltd",
    title: "Increase customer credit limit",
    requestedBy: "Maya Evans, Sales Coordinator",
    requestedAt: "2026-06-12T10:25:00.000Z",
    effectiveDate: "2026-06-13",
    priority: "Critical",
    status: "Pending",
    currentStep: 2,
    businessReason:
      "Seasonal demand and a new regional contract require additional exposure to release sales order 182934.",
    governancePolicy:
      "Credit-limit changes require current financial evidence, ageing review, risk-class validation, and Credit Manager ownership.",
    risk:
      "Increasing the limit without resolving overdue debt transfers sales urgency into receivables and bad-debt exposure.",
    fieldChanges: [
      { field: "Credit limit", before: "GBP 175,000", after: "GBP 225,000", rationale: "Support peak-season contracted volume.", critical: true },
      { field: "Risk class", before: "B", after: "B", rationale: "No risk downgrade proposed.", critical: true },
      { field: "Review date", before: "2026-07-01", after: "2026-07-15", rationale: "Two-week monitored exception.", critical: false },
    ],
    validations: [
      { id: "VAL-CUST-01", label: "Exposure simulation", status: "Warning", evidence: "Proposed limit covers order 182934 but leaves only GBP 41,000 headroom." },
      { id: "VAL-CUST-02", label: "Overdue ageing", status: "Warning", evidence: "Invoice 900771 for GBP 31,000 is 22 days overdue." },
      { id: "VAL-CUST-03", label: "Risk class consistency", status: "Pass", evidence: "Payment history remains 91% on time and supports risk class B." },
    ],
    dependencies: [
      { object: "Sales order 182934", relationship: "Credit check", impact: "Order can be rechecked and released only after the approved limit is active." },
      { object: "FSCM credit exposure", relationship: "Receivables and open orders", impact: "Exposure includes open AR, deliveries, billing, and the requested order." },
      { object: "Collections worklist", relationship: "Overdue invoice", impact: "The overdue item remains assigned for active collection after any limit increase." },
    ],
    steps: [
      { sequence: 1, role: "Sales Coordinator", assignee: "Maya Evans", status: "Completed", completedAt: "2026-06-12T10:25:00.000Z", decision: "Submitted", comment: "Regional contract and order evidence attached." },
      { sequence: 2, role: "Customer Data Steward", assignee: "Amelia Scott", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Credit Manager", assignee: "Lauren Price", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "MDG-BOM-260022",
    domain: "BOM",
    objectId: "BOM-FG-AMBER-01",
    objectName: "Amber Ale production BOM",
    title: "Substitute blocked hop component",
    requestedBy: "Noah Foster, Production Planner",
    requestedAt: "2026-06-12T09:40:00.000Z",
    effectiveDate: "2026-06-12",
    priority: "Critical",
    status: "Pending",
    currentStep: 2,
    businessReason:
      "The primary hop batch is blocked and production order 1000051842 requires a controlled substitute.",
    governancePolicy:
      "Recipe changes require quantity, specification, allergen, yield, costing, and production-version validation before release.",
    risk:
      "An unvalidated component change can alter flavour, product specification, batch genealogy, standard cost, and regulatory evidence.",
    fieldChanges: [
      { field: "Hop component", before: "RM-HOPS-CITRA", after: "RM-HOPS-MOSAIC", rationale: "Use available substitute stock.", critical: true },
      { field: "Quantity per 500 HL", before: "420 KG", after: "455 KG", rationale: "Match bitterness and aroma target.", critical: true },
      { field: "Alternative BOM", before: "01", after: "02", rationale: "Preserve the approved standard recipe as alternative 01.", critical: false },
    ],
    validations: [
      { id: "VAL-BOM-01", label: "Quality specification", status: "Pass", evidence: "Analytical certificate meets alpha-acid and contamination limits." },
      { id: "VAL-BOM-02", label: "Recipe tolerance", status: "Fail", evidence: "Brewmaster sensory assessment has not been recorded." },
      { id: "VAL-BOM-03", label: "Cost estimate", status: "Warning", evidence: "Substitution increases planned material cost by GBP 1,180." },
    ],
    dependencies: [
      { object: "Production order 1000051842", relationship: "Component reservation", impact: "Order release remains blocked until a valid BOM alternative is selected." },
      { object: "Finished batch genealogy", relationship: "Ingredient traceability", impact: "The substitute material and batch must appear in consumption and quality records." },
      { object: "Standard cost estimate", relationship: "Material quantity structure", impact: "The next costing run must evaluate alternative BOM 02." },
    ],
    steps: [
      { sequence: 1, role: "Production Planner", assignee: "Noah Foster", status: "Completed", completedAt: "2026-06-12T09:40:00.000Z", decision: "Submitted", comment: "Substitute component and certificate proposed." },
      { sequence: 2, role: "Recipe Data Steward", assignee: "Olivia Brooks", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Brewmaster", assignee: "Sarah Bennett", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "MDG-PRICE-260009",
    domain: "Pricing",
    objectId: "PR00-BM24",
    objectName: "BritMart Amber Ale base price",
    title: "Apply annual customer price increase",
    requestedBy: "Commercial Pricing Team",
    requestedAt: "2026-06-11T15:10:00.000Z",
    effectiveDate: "2026-07-01",
    priority: "High",
    status: "Pending",
    currentStep: 2,
    businessReason:
      "Packaging, energy, and distribution costs have increased since the national contract was signed.",
    governancePolicy:
      "Customer pricing changes require contract-date validation, margin simulation, approval authority, and non-overlapping condition records.",
    risk:
      "Incorrect dates or condition precedence can create billing disputes, margin leakage, or duplicate pricing.",
    fieldChanges: [
      { field: "PR00 base price", before: "GBP 108.40/KEG", after: "GBP 112.20/KEG", rationale: "Recover verified input-cost inflation.", critical: true },
      { field: "Valid from", before: "2024-06-21", after: "2026-07-01", rationale: "Apply at the contractual annual review.", critical: true },
      { field: "Promotional discount", before: "4.0%", after: "4.0%", rationale: "No promotion change.", critical: false },
    ],
    validations: [
      { id: "VAL-PRICE-01", label: "Condition overlap", status: "Pass", evidence: "Existing PR00 record ends on 2026-06-30." },
      { id: "VAL-PRICE-02", label: "Margin simulation", status: "Pass", evidence: "Expected customer contribution margin increases from 26.2% to 28.6%." },
      { id: "VAL-PRICE-03", label: "Contract notice period", status: "Pass", evidence: "Change is within the signed annual-review clause and notice period." },
    ],
    dependencies: [
      { object: "BritMart sales orders", relationship: "Pricing procedure", impact: "Orders created from 1 July derive the new PR00 condition." },
      { object: "Billing and FI-AR", relationship: "Revenue recognition", impact: "Billing posts higher revenue and tax from the agreed effective date." },
      { object: "Profitability analysis", relationship: "Net revenue", impact: "CO-PA contribution reporting reflects the new base price and unchanged discount." },
    ],
    steps: [
      { sequence: 1, role: "Pricing Analyst", assignee: "Commercial Pricing Team", status: "Completed", completedAt: "2026-06-11T15:10:00.000Z", decision: "Submitted", comment: "Cost and contract evidence attached." },
      { sequence: 2, role: "Pricing Data Steward", assignee: "Isla Morgan", status: "Current", completedAt: null, decision: null, comment: null },
      { sequence: 3, role: "Sales Director", assignee: "James Walker", status: "Waiting", completedAt: null, decision: null, comment: null },
    ],
  },
  {
    id: "MDG-EMP-260006",
    domain: "Employee",
    objectId: "700184",
    objectName: "Aisha Rahman",
    title: "Correct payroll-effective cost centre",
    requestedBy: "HR Operations",
    requestedAt: "2026-06-10T13:05:00.000Z",
    effectiveDate: "2026-06-15",
    priority: "High",
    status: "Approved",
    currentStep: 3,
    businessReason:
      "The onboarding record inherited a retired quality cost centre and would mispost June payroll.",
    governancePolicy:
      "Effective-dated organizational changes require valid position, manager, cost centre, payroll timing, and replication evidence.",
    risk:
      "An incorrect cost centre misstates departmental labour cost, profitability, and budget ownership.",
    fieldChanges: [
      { field: "Cost centre", before: "BR01-QA-OLD", after: "BR01-QA", rationale: "Use the active Quality Assurance cost object.", critical: true },
      { field: "Effective date", before: "2026-06-15", after: "2026-06-15", rationale: "Align with the employee start date.", critical: true },
    ],
    validations: [
      { id: "VAL-EMP-01", label: "Cost-centre validity", status: "Pass", evidence: "BR01-QA is active for company code BCB1 and plant BR01." },
      { id: "VAL-EMP-02", label: "Position assignment", status: "Pass", evidence: "Position POS-BR01-QA-07 belongs to Quality Assurance." },
      { id: "VAL-EMP-03", label: "Payroll control record", status: "Pass", evidence: "The June payroll period remains open for master-data correction." },
    ],
    dependencies: [
      { object: "June payroll result", relationship: "CO account assignment", impact: "Salary and employer cost post to BR01-QA." },
      { object: "SuccessFactors replication", relationship: "Effective-dated employment", impact: "The corrected assignment remains aligned across HR and S/4HANA." },
      { object: "Quality department budget", relationship: "Plan versus actual", impact: "Aisha's labour cost appears under the responsible manager." },
    ],
    steps: [
      { sequence: 1, role: "HR Operations", assignee: "HR Operations", status: "Completed", completedAt: "2026-06-10T13:05:00.000Z", decision: "Submitted", comment: "Replication error identified before payroll." },
      { sequence: 2, role: "Employee Data Steward", assignee: "Hannah Lewis", status: "Completed", completedAt: "2026-06-10T13:22:00.000Z", decision: "Validated", comment: "Position and cost-centre dates agree." },
      { sequence: 3, role: "Payroll Manager", assignee: "Rebecca Hall", status: "Completed", completedAt: "2026-06-10T13:41:00.000Z", decision: "Approved", comment: "Correction accepted before payroll simulation." },
    ],
  },
];

export const governanceAuditTrail: GovernanceAuditEntry[] =
  governanceDefinitions.flatMap((request) =>
    request.steps
      .filter((step) => step.completedAt)
      .map((step) => ({
        id: `${request.id}-${step.sequence}`,
        requestId: request.id,
        at: step.completedAt!,
        actor: step.assignee,
        actorRole: step.role,
        action: step.decision ?? "Completed",
        comment: step.comment ?? "Governance step completed.",
      })),
  );

export function actionsForGovernanceCase(
  request: Pick<GovernanceCase, "status" | "validations">,
): GovernanceAction[] {
  if (request.status === "Draft") return ["submit"];
  if (request.status !== "Pending") return [];
  const hasFailedValidation = request.validations.some(
    (validation) => validation.status === "Fail",
  );
  return hasFailedValidation
    ? ["request-changes", "reject"]
    : ["approve", "request-changes", "reject"];
}
