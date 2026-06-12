import type { ScenarioId } from "@/data/progress";

export type ImplementationItem = {
  name: string;
  purpose: string;
  example: string;
};

export type ConfigurationControl = {
  area: string;
  decision: string;
  businessEffect: string;
  owner: string;
};

export type IntegrationPoint = {
  from: string;
  to: string;
  trigger: string;
  result: string;
};

export type ValidationTest = {
  id: string;
  test: string;
  expected: string;
  evidence: string;
};

export type ImplementationBlueprint = {
  scenarioId: ScenarioId;
  title: string;
  objective: string;
  consultantRole: string;
  organizationalUnits: ImplementationItem[];
  masterData: ImplementationItem[];
  configuration: ConfigurationControl[];
  integrations: IntegrationPoint[];
  validationTests: ValidationTest[];
  goLiveControls: string[];
};

export const implementationBlueprints: ImplementationBlueprint[] = [
  {
    scenarioId: "p2p",
    title: "Implement controlled Procure to Pay",
    objective:
      "Enable approved purchasing, goods receipt, quality control, invoice matching, and supplier payment with complete MM-FI integration.",
    consultantRole: "SAP MM / FI Integration Consultant",
    organizationalUnits: [
      { name: "Company code", purpose: "Owns legal accounting and supplier liabilities.", example: "BCB1" },
      { name: "Purchasing organization", purpose: "Negotiates and governs procurement.", example: "P100" },
      { name: "Plant and storage locations", purpose: "Define where demand, receipt, and stock are managed.", example: "BR01 / RM01 / QI01" },
    ],
    masterData: [
      { name: "Business Partner supplier", purpose: "Provides ordering, payment, tax, and partner data.", example: "1000012 Highland Maltings PLC" },
      { name: "Material master", purpose: "Controls purchasing, valuation, quality, and inventory behaviour.", example: "RM-MALT-PALE-01" },
      { name: "Purchasing info record", purpose: "Links supplier, material, price, lead time, and tolerance.", example: "P100 / 1000012 / RM-MALT-PALE-01" },
    ],
    configuration: [
      { area: "Document types and number ranges", decision: "Define PR, PO, material, and invoice document controls.", businessEffect: "Separates purchasing scenarios and creates auditable document numbering.", owner: "MM" },
      { area: "Release strategy or workflow", decision: "Set approval rules by value, category, and account assignment.", businessEffect: "Prevents unauthorized commercial commitments.", owner: "MM / Workflow" },
      { area: "Movement types and account determination", decision: "Configure movement 101 and OBYC valuation postings.", businessEffect: "Goods receipt updates stock and posts Inventory versus GR/IR correctly.", owner: "MM / FI" },
      { area: "Invoice tolerances", decision: "Set quantity and price variance limits.", businessEffect: "Invoices outside policy are blocked instead of overpaid.", owner: "MM / FI-AP" },
    ],
    integrations: [
      { from: "MM Purchasing", to: "MM Inventory", trigger: "PO-based goods receipt", result: "Stock and PO history increase." },
      { from: "MM Inventory", to: "FI General Ledger", trigger: "Valuated goods movement", result: "Inventory and GR/IR accounts post." },
      { from: "MM Invoice Verification", to: "FI Accounts Payable", trigger: "Accepted supplier invoice", result: "Supplier payable and tax are created." },
    ],
    validationTests: [
      { id: "P2P-T01", test: "Create and approve a PO above the approval threshold.", expected: "PO cannot be released without the assigned approver.", evidence: "Workflow log and released PO" },
      { id: "P2P-T02", test: "Post a 101 receipt for a quality-managed material.", expected: "Stock enters quality inspection and FI posts Inventory / GR-IR.", evidence: "Material and accounting documents" },
      { id: "P2P-T03", test: "Post an invoice above quantity tolerance.", expected: "Invoice is blocked for payment with a traceable variance reason.", evidence: "Blocked invoice and tolerance message" },
    ],
    goLiveControls: ["Supplier bank-data approval", "Open PO migration reconciliation", "GR/IR ownership", "Posting-period readiness"],
  },
  {
    scenarioId: "o2c",
    title: "Implement integrated Order to Cash",
    objective:
      "Control customer demand from order capture through availability, delivery, goods issue, billing, receivables, and credit risk.",
    consultantRole: "SAP SD / FI-AR Integration Consultant",
    organizationalUnits: [
      { name: "Sales organization", purpose: "Owns commercial sales responsibility.", example: "S100" },
      { name: "Distribution channel and division", purpose: "Segment route-to-market and product responsibility.", example: "10 / 00" },
      { name: "Delivering plant and shipping point", purpose: "Determine fulfilment location and dispatch execution.", example: "DC01 / DC10" },
    ],
    masterData: [
      { name: "Customer Business Partner", purpose: "Supplies sales, shipping, tax, payment, and credit data.", example: "2000017 Northern Taverns Ltd" },
      { name: "Material sales views", purpose: "Control sales units, item category, tax, loading, and availability.", example: "FG-AMBER-KEG-50" },
      { name: "Condition records", purpose: "Determine price, discount, freight, and tax.", example: "PR00 / K007 / MWST" },
    ],
    configuration: [
      { area: "Sales document flow", decision: "Configure order, delivery, billing types, copying controls, and item categories.", businessEffect: "Creates a consistent commercial document chain.", owner: "SD" },
      { area: "Availability checking", decision: "Choose checking groups, scope, and confirmation rules.", businessEffect: "Protects supply commitments and dates.", owner: "SD / PP" },
      { area: "Credit management", decision: "Set credit segments, limits, checks, and release authority.", businessEffect: "Blocks unacceptable customer exposure.", owner: "FSCM / FI-AR" },
      { area: "Revenue account determination", decision: "Map sales conditions and account keys to G/L accounts.", businessEffect: "Billing posts revenue, tax, discounts, and receivables correctly.", owner: "SD / FI" },
    ],
    integrations: [
      { from: "SD Sales", to: "PP / Inventory", trigger: "Availability check", result: "Confirmed quantities and dates are reserved commercially." },
      { from: "SD Delivery", to: "MM / FI", trigger: "Post goods issue", result: "Inventory decreases and cost of goods sold posts." },
      { from: "SD Billing", to: "FI-AR", trigger: "Billing release", result: "Customer receivable, revenue, and tax post." },
    ],
    validationTests: [
      { id: "O2C-T01", test: "Create an order with valid pricing and available stock.", expected: "Price and schedule lines determine without manual overrides.", evidence: "Sales order condition and availability logs" },
      { id: "O2C-T02", test: "Post goods issue for a picked delivery.", expected: "Stock and COGS update with a complete document flow.", evidence: "Material, FI, and delivery documents" },
      { id: "O2C-T03", test: "Exceed the customer credit limit.", expected: "Order or delivery is blocked and requires authorized release.", evidence: "Credit decision log" },
    ],
    goLiveControls: ["Customer credit migration", "Open order reconciliation", "Pricing sign-off", "Billing-to-GL reconciliation"],
  },
  {
    scenarioId: "ptp",
    title: "Implement Plan to Produce",
    objective:
      "Convert demand into feasible planned supply and controlled production execution with material, capacity, and cost integration.",
    consultantRole: "SAP PP / CO Integration Consultant",
    organizationalUnits: [
      { name: "Plant", purpose: "Owns planning, production, inventory, and costing.", example: "BR01" },
      { name: "MRP areas", purpose: "Segment supply planning by plant or storage responsibility.", example: "BR01 and packaging area" },
      { name: "Work centres", purpose: "Represent capacity, scheduling, and activity costing.", example: "BREW-HOUSE-02" },
    ],
    masterData: [
      { name: "Material MRP and work-scheduling views", purpose: "Define planning type, lot size, lead time, and production control.", example: "FG-AMBER-KEG-50" },
      { name: "Bill of material", purpose: "Defines component quantities and scrap factors.", example: "Amber Ale recipe BOM" },
      { name: "Routing and production version", purpose: "Connect operations, work centres, BOM, and valid production method.", example: "PV01 / routing 500001" },
    ],
    configuration: [
      { area: "MRP parameters", decision: "Set planning horizons, scheduling, lot sizing, and exception behaviour.", businessEffect: "Creates realistic supply proposals and dates.", owner: "PP" },
      { area: "Order types and scheduling", decision: "Configure production order controls, availability, release, and confirmations.", businessEffect: "Governs authorized shop-floor execution.", owner: "PP" },
      { area: "Backflush and goods movements", decision: "Define component issue and finished-goods receipt behaviour.", businessEffect: "Inventory reflects actual production consumption and output.", owner: "PP / MM" },
      { area: "Costing and settlement", decision: "Assign costing variants, activity prices, variance keys, and settlement profiles.", businessEffect: "Production cost and variance reach inventory and CO correctly.", owner: "CO / PP" },
    ],
    integrations: [
      { from: "Demand Management / SD", to: "PP MRP", trigger: "Forecast or sales demand", result: "Planned orders and component requirements are generated." },
      { from: "PP Production", to: "MM Inventory", trigger: "Goods issue and receipt", result: "Components decrease and finished stock increases." },
      { from: "PP Production", to: "CO", trigger: "Confirmations and settlement", result: "Labour, machine, overhead, and variance costs post." },
    ],
    validationTests: [
      { id: "PTP-T01", test: "Run MRP for finished-product demand.", expected: "Planned supply and dated dependent requirements reflect BOM and lead times.", evidence: "MRP list and stock/requirements list" },
      { id: "PTP-T02", test: "Release an order with a missing component.", expected: "Availability status and configured release rule expose or block the shortage.", evidence: "Order status and availability log" },
      { id: "PTP-T03", test: "Confirm production and post finished-goods receipt.", expected: "Quantities, activities, inventory, and order costs reconcile.", evidence: "Confirmation, material documents, and cost analysis" },
    ],
    goLiveControls: ["BOM/routing approval", "Capacity calendar validation", "Activity price readiness", "Open production order migration"],
  },
  {
    scenarioId: "r2r",
    title: "Implement Record to Report",
    objective:
      "Create a controlled financial close covering ledgers, subledgers, accruals, allocations, valuation, settlement, and reporting.",
    consultantRole: "SAP FI / CO Consultant",
    organizationalUnits: [
      { name: "Company code", purpose: "Defines the legal accounting entity.", example: "BCB1" },
      { name: "Controlling area", purpose: "Integrates cost accounting and management reporting.", example: "A100" },
      { name: "Profit and cost centres", purpose: "Assign responsibility for revenue, cost, and performance.", example: "PC-BREW / BR01-QA / BR01-MAINT" },
    ],
    masterData: [
      { name: "G/L accounts", purpose: "Define financial statement classification and posting controls.", example: "Inventory, GR/IR, accrual, variance accounts" },
      { name: "Cost elements and centres", purpose: "Capture and allocate operational cost.", example: "Utilities, quality, maintenance, production" },
      { name: "Financial statement version", purpose: "Maps balances into statutory and management reporting.", example: "BCB-UK-GAAP" },
    ],
    configuration: [
      { area: "Ledgers and currencies", decision: "Set accounting principles, fiscal year, periods, and currency types.", businessEffect: "Creates compliant parallel valuation and reporting.", owner: "FI" },
      { area: "Posting controls", decision: "Configure document types, number ranges, field status, and periods.", businessEffect: "Prevents invalid or late postings.", owner: "FI" },
      { area: "Accruals and allocations", decision: "Define methods, cycles, senders, receivers, and reversal rules.", businessEffect: "Recognizes period cost and assigns it to responsible objects.", owner: "FI / CO" },
      { area: "Close jobs and settlement", decision: "Sequence valuation, depreciation, overhead, variance, settlement, and reporting.", businessEffect: "Produces complete and reproducible period results.", owner: "FI / CO" },
    ],
    integrations: [
      { from: "MM / SD / HCM / PM", to: "FI General Ledger", trigger: "Operational postings", result: "Subledger and automatic G/L entries update." },
      { from: "FI", to: "CO", trigger: "Primary cost postings", result: "Costs reach cost centres, orders, and profit centres." },
      { from: "CO", to: "FI / Margin Analysis", trigger: "Allocation and settlement", result: "Operational balances are cleared and profitability updated." },
    ],
    validationTests: [
      { id: "R2R-T01", test: "Post and reverse a period-end accrual.", expected: "Expense and liability occur in the correct periods.", evidence: "Accrual and reversal documents" },
      { id: "R2R-T02", test: "Run allocation and production settlement.", expected: "Sender balances and receiver postings reconcile.", evidence: "Cycle logs and settlement documents" },
      { id: "R2R-T03", test: "Close the period and attempt a late posting.", expected: "Unauthorized posting is rejected while adjustment authorization remains controlled.", evidence: "Period-control log" },
    ],
    goLiveControls: ["Opening balance reconciliation", "Subledger-to-GL sign-off", "Close calendar ownership", "Reporting validation"],
  },
  {
    scenarioId: "qm",
    title: "Implement Quality Management",
    objective:
      "Control inspection planning, result recording, defect management, usage decisions, stock disposition, and supplier quality.",
    consultantRole: "SAP QM / MM Integration Consultant",
    organizationalUnits: [
      { name: "Plant", purpose: "Owns inspection processing and stock disposition.", example: "BR01" },
      { name: "Quality work centre", purpose: "Provides laboratory capacity and cost assignment.", example: "BR01-LAB" },
      { name: "Storage locations and stock types", purpose: "Separate quality, unrestricted, blocked, and return stock.", example: "QI01 / RM01" },
    ],
    masterData: [
      { name: "Material quality view", purpose: "Activates inspection types and quality controls.", example: "Inspection type 01 for malt" },
      { name: "Master inspection characteristics", purpose: "Standardize methods, limits, units, and valuation.", example: "Moisture maximum 5.5%" },
      { name: "Inspection plan and quality info record", purpose: "Connect material, supplier, sampling, tests, and procurement release.", example: "Malt incoming inspection plan" },
    ],
    configuration: [
      { area: "Inspection types", decision: "Configure origin, lot creation, stock posting, and result control.", businessEffect: "Creates the correct inspection lot at the business trigger.", owner: "QM" },
      { area: "Sampling and valuation", decision: "Set sample procedures, specifications, and acceptance rules.", businessEffect: "Makes quality decisions consistent and auditable.", owner: "QM / Business" },
      { area: "Usage decisions", decision: "Define decision codes, follow-up actions, and stock postings.", businessEffect: "Controls release, return, rework, or scrap.", owner: "QM / MM" },
      { area: "Quality notifications", decision: "Configure defect catalogues, tasks, causes, and partner determination.", businessEffect: "Creates structured corrective-action and supplier history.", owner: "QM" },
    ],
    integrations: [
      { from: "MM Goods Receipt", to: "QM", trigger: "Receipt of inspection-relevant material", result: "Inspection lot and quality stock are created." },
      { from: "QM Usage Decision", to: "MM Inventory", trigger: "Accepted or rejected disposition", result: "Stock moves to the authorized stock type." },
      { from: "QM Supplier Quality", to: "MM Purchasing", trigger: "Defect and quality score update", result: "Source approval and supplier evaluation are affected." },
    ],
    validationTests: [
      { id: "QM-T01", test: "Receive an inspection-controlled material.", expected: "Inspection lot is created and stock is not available for use.", evidence: "Material document, lot, and stock overview" },
      { id: "QM-T02", test: "Record an out-of-specification result.", expected: "Characteristic is rejected and defect workflow is available.", evidence: "Result valuation and notification" },
      { id: "QM-T03", test: "Post accepted and rejected usage decisions.", expected: "Stock disposition and any value effects follow the selected code.", evidence: "Usage decision and material/FI documents" },
    ],
    goLiveControls: ["Specification approval", "Lab authorization", "Open inspection lot migration", "Supplier quality baseline"],
  },
  {
    scenarioId: "pm",
    title: "Implement Plant Maintenance",
    objective:
      "Connect technical assets, notifications, maintenance planning, work execution, spare parts, safety, cost capture, and preventive strategy.",
    consultantRole: "SAP EAM / PM Consultant",
    organizationalUnits: [
      { name: "Maintenance plant and planning plant", purpose: "Define asset location and planning responsibility.", example: "BR01" },
      { name: "Planner groups and work centres", purpose: "Assign planning ownership, capacity, and activity cost.", example: "UTIL / MECH-BR01" },
      { name: "Cost centres", purpose: "Receive settled maintenance cost.", example: "BR01-UTIL" },
    ],
    masterData: [
      { name: "Functional locations and equipment", purpose: "Create the technical hierarchy and failure history.", example: "BR01-UTIL-BOIL / PUMP-BR01-014" },
      { name: "Maintenance BOM and task lists", purpose: "Standardize spares, operations, labour, and safety steps.", example: "Pump spare-parts BOM" },
      { name: "Maintenance plans", purpose: "Generate preventive work by time, counter, or strategy.", example: "Quarterly pump inspection" },
    ],
    configuration: [
      { area: "Notification and order types", decision: "Define priorities, statuses, partner roles, and order controls.", businessEffect: "Separates failure reporting from authorized work execution.", owner: "PM" },
      { area: "Planning and scheduling", decision: "Configure control keys, work centres, capacity, and permits.", businessEffect: "Creates executable and safe maintenance work.", owner: "PM / EHS" },
      { area: "Materials and services", decision: "Set reservation, procurement, and goods-issue integration.", businessEffect: "Protects spares and captures actual material/service cost.", owner: "PM / MM" },
      { area: "Costing and settlement", decision: "Assign settlement profiles, cost elements, and receiver rules.", businessEffect: "Transfers order cost to the responsible asset or cost centre.", owner: "PM / CO" },
    ],
    integrations: [
      { from: "PM Order", to: "MM Inventory / Purchasing", trigger: "Reserved or externally procured component", result: "Stock commitment, goods issue, or purchase demand is created." },
      { from: "PM Confirmation", to: "CO", trigger: "Labour and activity confirmation", result: "Actual internal activity cost posts to the order." },
      { from: "PM Completion", to: "Asset history / CO", trigger: "Technical completion and settlement", result: "Failure history updates and residual cost clears." },
    ],
    validationTests: [
      { id: "PM-T01", test: "Create a breakdown notification and convert it to an order.", expected: "Technical object, priority, operations, and cost collector remain linked.", evidence: "Notification-order document flow" },
      { id: "PM-T02", test: "Reserve and issue a critical spare.", expected: "Inventory decreases and actual cost debits the maintenance order.", evidence: "Reservation and material/FI documents" },
      { id: "PM-T03", test: "Confirm, technically complete, and settle the order.", expected: "Work history is complete and order balance clears to its receiver.", evidence: "Confirmation, status, and settlement log" },
    ],
    goLiveControls: ["Technical-object migration", "Critical spare verification", "Preventive-plan start dates", "Open order reconciliation"],
  },
  {
    scenarioId: "h2r",
    title: "Implement Hire to Retire",
    objective:
      "Create an effective-dated employee lifecycle connected to organization, time, payroll, learning, security, and financial posting.",
    consultantRole: "SAP HCM / SuccessFactors Integration Consultant",
    organizationalUnits: [
      { name: "Legal entity and company code", purpose: "Own employment and payroll accounting.", example: "Burton Craft Beverages / BCB1" },
      { name: "Personnel area and payroll area", purpose: "Control administration, calendars, and payroll grouping.", example: "BR01 / GB-M1" },
      { name: "Organization, position, and cost centre", purpose: "Define reporting, authorization, capacity, and cost assignment.", example: "Quality Assurance / POS-BR01-QA-07 / BR01-QA" },
    ],
    masterData: [
      { name: "Job and position", purpose: "Define role, grade, capacity, and organizational assignment.", example: "Quality Technician" },
      { name: "Employee and employment records", purpose: "Store effective-dated personal, contract, organization, and status data.", example: "700184 Aisha Rahman" },
      { name: "Pay components and time profile", purpose: "Drive gross pay, attendance, leave, and statutory calculations.", example: "Annual salary £36,800 / standard shift profile" },
    ],
    configuration: [
      { area: "Hire and lifecycle events", decision: "Configure business rules, workflows, effective dating, and event reasons.", businessEffect: "Creates controlled hire, transfer, leave, and separation actions.", owner: "HCM / SuccessFactors" },
      { area: "Time management", decision: "Set work schedules, absence types, quotas, and valuation.", businessEffect: "Converts attendance and leave into payroll-relevant time.", owner: "HCM Time" },
      { area: "Payroll schema and posting", decision: "Configure wage types, deductions, tax, retroactivity, and FI/CO account mapping.", businessEffect: "Calculates net pay and posts labour cost and liabilities correctly.", owner: "Payroll / FI" },
      { area: "Identity and learning integration", decision: "Map role, position, access, onboarding, and mandatory training triggers.", businessEffect: "Employees receive compliant access and capability by start date.", owner: "HCM / Security / LMS" },
    ],
    integrations: [
      { from: "SuccessFactors Employee Central", to: "Payroll / S/4HANA", trigger: "Effective-dated employee change", result: "Employment and account assignments replicate." },
      { from: "Time Management", to: "Payroll", trigger: "Approved attendance or absence", result: "Pay and deductions use valued time." },
      { from: "Payroll", to: "FI / CO", trigger: "Payroll posting run", result: "Salary, employer cost, net pay, tax, and cost centre postings are created." },
    ],
    validationTests: [
      { id: "H2R-T01", test: "Hire an employee with approvals and effective date.", expected: "Personnel number, position occupancy, and onboarding tasks are created once.", evidence: "Employee event, workflow, and replication logs" },
      { id: "H2R-T02", test: "Run payroll simulation with time and statutory data.", expected: "Gross-to-net calculation is correct and errors are explainable.", evidence: "Payroll log and payslip" },
      { id: "H2R-T03", test: "Post payroll to FI/CO.", expected: "Posting balances and costs reach the valid employee cost centre.", evidence: "Payroll posting and accounting documents" },
    ],
    goLiveControls: ["Employee data privacy", "Opening payroll balances", "Bank and tax validation", "Role/access segregation"],
  },
];

export function implementationBlueprintFor(scenarioId: ScenarioId) {
  return implementationBlueprints.find(
    (blueprint) => blueprint.scenarioId === scenarioId,
  )!;
}
