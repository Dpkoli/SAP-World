import {
  industryById,
  type IndustryId,
} from "@/data/industries";
import { industryBlueprintById } from "@/data/industry-blueprints";
import type { ScenarioId } from "@/data/progress";

export type CurriculumLevel = "Foundation" | "Practitioner" | "Expert";
export type CurriculumYear = 1 | 2 | 3;

export type IndustryJourneyTarget =
  | "industries"
  | "structure"
  | "masterdata"
  | "governance"
  | "plants"
  | "partners"
  | "studio"
  | "processes"
  | "advanced"
  | "analytics"
  | "history"
  | "workflows"
  | "tutor";

export type ExternalSapInstruction = {
  workspace: string;
  appOrTransaction: string;
  navigation: string;
  prerequisites: string[];
  steps: string[];
  expectedInput: string[];
  expectedResult: string[];
  evidence: string[];
  caution?: string;
};

export type IndustryCurriculumTask = {
  id: string;
  phaseId: string;
  year: CurriculumYear;
  level: CurriculumLevel;
  title: string;
  objective: string;
  target: IndustryJourneyTarget;
  scenarioId?: ScenarioId;
  externalSap: ExternalSapInstruction;
};

export type IndustryCurriculumPhase = {
  id: string;
  number: number;
  title: string;
  level: CurriculumLevel;
  outcome: string;
  mandatory: true;
};

export type IndustryJourneyProgress = {
  industryId: IndustryId;
  startedAt: string;
  updatedAt: string;
  currentTaskId: string | null;
  completedTaskIds: string[];
  completedPeriodIds: string[];
  completedAt: string | null;
};

export type ClosingCalendarPeriod = {
  id: string;
  year: CurriculumYear;
  month: number;
  label: string;
  focus: string;
  closeType: "Monthly" | "Quarterly" | "Yearly";
  requiredActions: string[];
  expectedResult: string;
};

export const industryCurriculumPhases: IndustryCurriculumPhase[] = [
  {
    id: "orientation",
    number: 1,
    title: "Understand the industry",
    level: "Foundation",
    outcome: "Explain the customer promise, value chain, operating model, risks, and SAP scope.",
    mandatory: true,
  },
  {
    id: "enterprise-design",
    number: 2,
    title: "Configure the enterprise",
    level: "Foundation",
    outcome: "Design company, plant, sales, purchasing, warehouse, finance, and controlling structures.",
    mandatory: true,
  },
  {
    id: "master-data",
    number: 3,
    title: "Build governed master data",
    level: "Foundation",
    outcome: "Create the records that transactions, costing, planning, quality, and reporting depend on.",
    mandatory: true,
  },
  {
    id: "transactions",
    number: 4,
    title: "Run every core process",
    level: "Practitioner",
    outcome: "Execute and explain all eight end-to-end SAP business process chains.",
    mandatory: true,
  },
  {
    id: "costing",
    number: 5,
    title: "Cost and control the business",
    level: "Practitioner",
    outcome: "Calculate planned and actual cost, analyse variances, settle work, and explain profitability.",
    mandatory: true,
  },
  {
    id: "finance-close",
    number: 6,
    title: "Close and report",
    level: "Practitioner",
    outcome: "Complete monthly and yearly close and produce reconciled financial and management reporting.",
    mandatory: true,
  },
  {
    id: "three-year-operation",
    number: 7,
    title: "Operate for three years",
    level: "Expert",
    outcome: "Stabilise, grow, and optimise the same enterprise across three complete fiscal years.",
    mandatory: true,
  },
  {
    id: "controls-recovery",
    number: 8,
    title: "Control and recover",
    level: "Expert",
    outcome: "Diagnose failures, correct them safely, preserve evidence, and strengthen preventive controls.",
    mandatory: true,
  },
  {
    id: "expert-capstone",
    number: 9,
    title: "Prove expert capability",
    level: "Expert",
    outcome: "Defend an end-to-end design and operating result using SAP documents, controls, cost, and reports.",
    mandatory: true,
  },
];

const commonCaution =
  "SAP Fiori app names and classic transaction availability vary by S/4HANA edition and customer configuration. Use your organisation's authorised training client, role, and transport process; never change production configuration while practising.";

function instruction(input: ExternalSapInstruction): ExternalSapInstruction {
  return { ...input, caution: input.caution ?? commonCaution };
}

type ProcessTask = {
  scenarioId: ScenarioId;
  title: string;
  objective: string;
  workspace: string;
  transaction: string;
  navigation: string;
  steps: string[];
  inputs: string[];
  results: string[];
  evidence: string[];
};

const processTasks: ProcessTask[] = [
  {
    scenarioId: "h2r",
    title: "Hire, assign, and pay the workforce",
    objective: "Create the people and organisational capacity required to operate the enterprise.",
    workspace: "SAP Fiori Human Resources / SuccessFactors integration",
    transaction: "Manage Workforce / PA40 (where available) / payroll control apps",
    navigation: "Human Resources -> Workforce Administration -> Hire and assign employee",
    steps: [
      "Create the worker using a non-production training identity and valid employment dates.",
      "Assign company code, personnel area, organisational unit, position, cost centre, and work schedule.",
      "Maintain pay and bank-test data permitted by the training system.",
      "Run the payroll validation or simulation, resolve errors, and release the payroll result.",
      "Post payroll results to FI/CO and reconcile the posting document to the payroll result.",
    ],
    inputs: ["Employee and employment dates", "Organisation and position", "Cost centre", "Pay components and work schedule"],
    results: ["Active worker assignment", "Validated payroll result", "Balanced FI/CO payroll posting"],
    evidence: ["Personnel or workforce ID", "Organisation assignment", "Payroll result status", "Accounting document number"],
  },
  {
    scenarioId: "p2p",
    title: "Procure materials and pay the supplier",
    objective: "Run the complete controlled purchase-to-payment document chain.",
    workspace: "SAP Fiori Sourcing and Procurement",
    transaction: "ME51N -> ME21N -> MIGO -> MIRO -> F110/F-53",
    navigation: "Sourcing and Procurement -> Operational Procurement -> Purchasing",
    steps: [
      "Create a purchase requisition from approved demand and verify account assignment.",
      "Convert the requisition into a purchase order using an approved supplier and purchasing conditions.",
      "Approve the order, post goods receipt, and confirm quantity, plant, storage location, batch, and quality status.",
      "Post the supplier invoice with three-way-match checks and resolve tolerance exceptions.",
      "Execute or simulate payment and reconcile supplier, bank-clearing, and GR/IR balances.",
    ],
    inputs: ["Material or service", "Quantity and delivery date", "Plant/storage location", "Supplier and price", "Tax and payment terms"],
    results: ["Approved purchase order", "Accepted inventory or service", "Posted invoice", "Cleared supplier item"],
    evidence: ["PR and PO numbers", "Material document", "Invoice document", "Payment/clearing document", "GR/IR reconciliation"],
  },
  {
    scenarioId: "qm",
    title: "Inspect and release incoming quality",
    objective: "Prevent unapproved material from entering unrestricted operations.",
    workspace: "SAP Fiori Quality Management",
    transaction: "QA32 -> QE51N -> QA11",
    navigation: "Quality Management -> Quality Inspection -> Manage inspection lots",
    steps: [
      "Find the inspection lot created by goods receipt and verify material, supplier, batch, and specification.",
      "Record inspection results with units, tolerances, and defect information.",
      "Evaluate characteristic acceptance and document any deviation or supplier notification.",
      "Make the usage decision and post the correct stock disposition.",
      "Verify stock type, batch status, supplier score, and downstream availability.",
    ],
    inputs: ["Inspection lot", "Specification and sampling plan", "Measured results", "Defect code and disposition"],
    results: ["Completed results recording", "Usage decision", "Released, blocked, returned, or scrapped stock"],
    evidence: ["Inspection lot", "Characteristic results", "Usage-decision code", "Stock movement/material document"],
  },
  {
    scenarioId: "ptp",
    title: "Plan and produce the required output",
    objective: "Translate demand into material, capacity, production, inventory, and cost evidence.",
    workspace: "SAP Fiori Manufacturing and MRP",
    transaction: "MD01N/MD02 -> CO01/CO02 -> MIGO -> CO11N",
    navigation: "Manufacturing -> Material Requirements Planning -> Production Orders",
    steps: [
      "Run MRP for the approved planning horizon and review shortages, dates, and exception messages.",
      "Convert the planned order or create the production/process order with the correct version, BOM, routing/recipe, and dates.",
      "Check material availability and capacity before release.",
      "Post component issue, confirmations, activity quantities, yield, scrap, and finished receipt.",
      "Review actual cost, variance, order balance, and document links before settlement.",
    ],
    inputs: ["Demand quantity/date", "BOM or recipe", "Routing/work centre", "Production version", "Component batches and activity quantities"],
    results: ["Released order", "Consumed components", "Confirmed operations", "Finished inventory", "Actual order cost"],
    evidence: ["MRP result", "Planned/production order", "Goods issue and receipt", "Confirmation", "Cost analysis"],
  },
  {
    scenarioId: "pm",
    title: "Maintain critical equipment",
    objective: "Restore asset reliability while controlling safety, materials, labour, and cost.",
    workspace: "SAP Fiori Asset Management",
    transaction: "IW21 -> IW31/IW32 -> IW41 -> TECO/KO88",
    navigation: "Asset Management -> Maintenance Management -> Orders and notifications",
    steps: [
      "Create a maintenance notification with equipment, functional location, priority, symptom, and safety context.",
      "Plan the order with operations, work centre, components, permits, labour, and expected duration.",
      "Release the order after material, capacity, and safety checks.",
      "Issue parts, confirm work and time, record findings, and return the equipment to service.",
      "Technically complete, settle cost, and update preventive-maintenance learning.",
    ],
    inputs: ["Equipment/functional location", "Failure and priority", "Operations and parts", "Safety permits", "Labour and completion readings"],
    results: ["Controlled maintenance order", "Restored equipment", "Captured failure history", "Settled maintenance cost"],
    evidence: ["Notification", "Maintenance order", "Material issue", "Confirmation", "Technical completion and settlement"],
  },
  {
    scenarioId: "w2d",
    title: "Store, pick, ship, and account for dispatch",
    objective: "Move released inventory through warehouse and transport controls to goods issue.",
    workspace: "SAP Fiori Warehouse and Transportation Management",
    transaction: "/SCWM/MON, /SCWM/PRDO, VL02N and transport apps",
    navigation: "Warehouse Management -> Outbound Processing -> Monitor and execute",
    steps: [
      "Confirm the outbound requirement, stock availability, batch, shelf-life, and delivery priority.",
      "Create or release warehouse tasks and waves according to the training warehouse design.",
      "Pick, stage, pack, label, and verify handling units and quantities.",
      "Plan transport/carrier execution and complete loading checks.",
      "Post goods issue and reconcile warehouse, delivery, inventory, and FI/CO effects.",
    ],
    inputs: ["Outbound delivery", "Warehouse number and storage type", "Batch/stock", "Handling unit", "Route/carrier"],
    results: ["Confirmed warehouse tasks", "Packed and loaded goods", "Posted goods issue", "Reduced inventory and accounting effect"],
    evidence: ["Outbound delivery", "Warehouse tasks", "Handling units", "Shipment/freight document", "Goods-issue material document"],
  },
  {
    scenarioId: "o2c",
    title: "Sell, deliver, invoice, and collect",
    objective: "Run a controlled customer order through fulfilment and cash collection.",
    workspace: "SAP Fiori Sales",
    transaction: "VA01 -> VL01N/VL02N -> VF01 -> F-28",
    navigation: "Sales -> Sales Orders -> Delivery and Billing",
    steps: [
      "Create the sales order and validate customer, material/service, quantity, price, tax, dates, and credit status.",
      "Resolve availability, credit, delivery-block, or pricing exceptions before fulfilment.",
      "Create and execute delivery, picking, packing, and goods issue where physical fulfilment applies.",
      "Create the billing document and verify revenue, tax, receivable, COGS, and profitability assignments.",
      "Post incoming payment and clear the customer item; explain any deduction or residual balance.",
    ],
    inputs: ["Customer and sales area", "Product/service and quantity", "Pricing and tax", "Requested date", "Payment and delivery terms"],
    results: ["Confirmed order", "Fulfilled delivery/service", "Customer invoice", "Cleared receivable"],
    evidence: ["Sales order", "Delivery/service entry", "Billing and accounting documents", "Incoming payment/clearing document"],
  },
  {
    scenarioId: "r2r",
    title: "Record, reconcile, close, and report",
    objective: "Convert operational postings into a controlled financial close and explainable reports.",
    workspace: "SAP Fiori Finance",
    transaction: "Manage Journal Entries/FB50/F-02 -> reconciliation apps -> F.01/reporting apps",
    navigation: "Finance -> General Ledger -> Closing Operations and Reporting",
    steps: [
      "Review open posting periods and validate all source-process interfaces and document completeness.",
      "Post authorised accruals, deferrals, reclassifications, provisions, depreciation, and corrections.",
      "Reconcile AP, AR, inventory, GR/IR, assets, tax, bank, intercompany, cost centres, and production orders.",
      "Execute allocations, overhead, variance calculation, settlement, currency valuation, and close controls.",
      "Produce trial balance, income statement, balance sheet, cash-flow support, and management profitability reporting.",
    ],
    inputs: ["Posting period and ledger", "Reconciliation balances", "Approved journals", "Allocation/settlement rules", "Reporting hierarchy"],
    results: ["Reconciled ledger", "Controlled period close", "Financial statements", "Management and profitability reports"],
    evidence: ["Journal documents", "Reconciliation sign-offs", "Close monitor", "Trial balance", "Financial and management reports"],
  },
];

function task(
  industryId: IndustryId,
  input: Omit<IndustryCurriculumTask, "id"> & { id: string },
): IndustryCurriculumTask {
  return { ...input, id: `${industryId}-${input.id}` };
}

export function industryCurriculumTasks(
  industryId: IndustryId,
): IndustryCurriculumTask[] {
  const industry = industryById(industryId);
  const blueprint = industryBlueprintById(industryId);
  const companyCode = industry.companyCode ?? "the training company code defined in your design workbook";
  const primaryLocation = blueprint.organizationalTemplate[1] ?? "the primary operating location";
  const masterDataExamples = blueprint.masterData.slice(0, 4);

  const tasks: IndustryCurriculumTask[] = [
    task(industryId, {
      id: "map-value-chain",
      phaseId: "orientation",
      year: 1,
      level: "Foundation",
      title: `Map the ${industry.industry} value chain`,
      objective: `Explain how ${industry.enterprise} creates value and where SAP records operational and financial evidence.`,
      target: "industries",
      externalSap: instruction({
        workspace: "Design workbook before SAP configuration",
        appOrTransaction: "No transaction - business-process design prerequisite",
        navigation: "SAP World -> Industry blueprints -> Industry value chain",
        prerequisites: ["Selected industry blueprint", "Training system scope", "Named learner workbook"],
        steps: [
          "Write the customer promise in one sentence.",
          "Map every value-chain stage to its responsible role, SAP capability, input, output, and control.",
          "Identify the first operational document and the final financial/reporting outcome.",
          "Mark five integration hand-offs where incomplete data would stop the next process.",
          "Review the map against the blueprint's dependencies and common problems.",
        ],
        expectedInput: [blueprint.customerPromise, blueprint.supplyChain, `Modules: ${industry.modules.join(", ")}`],
        expectedResult: ["Approved value-chain map", "Module/process boundary map", "Named evidence and control points"],
        evidence: ["Value-chain workbook", "RACI", "Integration hand-off list", "Learning questions"],
      }),
    }),
    task(industryId, {
      id: "define-learning-system",
      phaseId: "orientation",
      year: 1,
      level: "Foundation",
      title: "Prepare the external SAP training workspace",
      objective: "Confirm the system edition, client, roles, naming standards, and evidence method before changing configuration or data.",
      target: "industries",
      externalSap: instruction({
        workspace: "SAP Fiori launchpad, SAP GUI, CBC/IMG, and learner evidence workbook",
        appOrTransaction: "System/About, SU53, Fiori App Finder, CBC or SPRO display",
        navigation: "User menu -> About / App Finder / authorised configuration workspace",
        prerequisites: ["Authorised non-production SAP access", "Learner user ID", "Assigned roles", "Evidence storage location"],
        steps: [
          "Record the SAP S/4HANA edition, release, client, system ID, language, and currency settings.",
          "Confirm which Fiori apps and classic transactions are available to your learner role.",
          "Test display access first and record missing authorisations without requesting excessive privileges.",
          "Agree naming prefixes for learner configuration and master data.",
          "Create an evidence index for screenshots, document numbers, reports, errors, and reflections.",
        ],
        expectedInput: ["Training-system details", "Role catalogue", "Naming convention", "Evidence template"],
        expectedResult: ["Safe learner workspace", "Confirmed access matrix", "Traceable evidence method"],
        evidence: ["System details", "Role/app checklist", "Naming standard", "Blank evidence register"],
      }),
    }),
    task(industryId, {
      id: "design-organisation",
      phaseId: "enterprise-design",
      year: 1,
      level: "Foundation",
      title: "Design the enterprise organisation",
      objective: `Translate the ${industry.industry} operating model into legal, logistics, sales, purchasing, and controlling units.`,
      target: "structure",
      externalSap: instruction({
        workspace: "SAP Central Business Configuration or Implementation Guide",
        appOrTransaction: "CBC/Manage Your Solution or SPRO (display before change)",
        navigation: "Enterprise Structure -> Definition and Assignment",
        prerequisites: ["Approved value-chain map", "Organisation naming standard", "Training-client change authority"],
        steps: [
          "Draft the enterprise hierarchy before entering SAP.",
          `Define the legal and accounting boundary represented by ${companyCode}.`,
          "Define operating locations, purchasing, sales, warehouse, maintenance, quality, HR, and controlling responsibility.",
          "Document every assignment and the process that depends on it.",
          "Review the design for unnecessary duplication and cross-company requirements.",
        ],
        expectedInput: blueprint.organizationalTemplate,
        expectedResult: ["Approved organisation design", "Assignment matrix", "Configuration sequence"],
        evidence: ["Organisation diagram", "Enterprise-structure workbook", "Design decisions and assumptions"],
      }),
    }),
    task(industryId, {
      id: "configure-company-code",
      phaseId: "enterprise-design",
      year: 1,
      level: "Foundation",
      title: "Configure company code and finance foundation",
      objective: "Create the legal accounting unit with chart, currency, fiscal year, posting periods, and field controls.",
      target: "structure",
      externalSap: instruction({
        workspace: "CBC/IMG Finance configuration",
        appOrTransaction: "CBC/Manage Your Solution; classic examples OX02, OB13, OB29, OB52",
        navigation: "Enterprise Structure and Financial Accounting -> Global Settings",
        prerequisites: ["Approved organisation design", "Chart-of-accounts design", "Fiscal calendar", "Local currency and tax scope"],
        steps: [
          `Create or verify company code ${companyCode} in the authorised training configuration workspace.`,
          "Assign chart of accounts, fiscal-year variant, posting-period variant, field-status variant, and local currency.",
          "Define retained earnings and document/number-range controls using the course design.",
          "Open only the required training periods and document who may post.",
          "Post a controlled test journal and verify ledger, currency, period, and document number.",
        ],
        expectedInput: [companyCode, "Chart of accounts", "Fiscal year and periods", "Currency", "Document and field controls"],
        expectedResult: ["Usable company code", "Controlled posting period", "Successful balanced test journal"],
        evidence: ["Configuration values", "Assignment screenshots", "Test accounting document", "Trial-balance line"],
      }),
    }),
    task(industryId, {
      id: "configure-locations",
      phaseId: "enterprise-design",
      year: 1,
      level: "Foundation",
      title: "Configure plants, storage, and operational locations",
      objective: "Create the physical and logical locations used by planning, procurement, inventory, production/service, quality, and maintenance.",
      target: "plants",
      externalSap: instruction({
        workspace: "CBC/IMG Logistics configuration",
        appOrTransaction: "CBC/Manage Your Solution; classic examples OX10, OX18, OX09",
        navigation: "Enterprise Structure -> Logistics General -> Define and assign locations",
        prerequisites: ["Company code", "Location design", "Valuation and inventory ownership decisions"],
        steps: [
          `Create or verify ${primaryLocation} and assign it to ${companyCode}.`,
          "Define storage locations and, where in scope, warehouse numbers and shipping/receiving points.",
          "Assign valuation, factory calendar, address, and country-relevant settings.",
          "Connect quality, maintenance, planning, and production/service responsibility.",
          "Validate the structure with a display test in the relevant master-data app.",
        ],
        expectedInput: [primaryLocation, "Storage/warehouse structure", "Factory calendar", "Valuation design"],
        expectedResult: ["Assigned operational locations", "Valid inventory ownership", "Available locations for master data"],
        evidence: ["Plant/company assignment", "Storage-location list", "Warehouse/shipping assignment", "Validation record"],
      }),
    }),
    task(industryId, {
      id: "configure-commercial-structures",
      phaseId: "enterprise-design",
      year: 1,
      level: "Foundation",
      title: "Configure purchasing and sales structures",
      objective: "Create responsibility for sourcing, buying, selling, pricing, fulfilment, and customer reporting.",
      target: "partners",
      externalSap: instruction({
        workspace: "CBC/IMG Procurement and Sales configuration",
        appOrTransaction: "CBC/Manage Your Solution; classic examples OX08 and OVX5",
        navigation: "Enterprise Structure -> Purchasing and Sales and Distribution",
        prerequisites: ["Company code and plants", "Procurement model", "Markets/channels/divisions", "Approval design"],
        steps: [
          "Define purchasing organisation/group responsibility and assign it to the correct company code and plants.",
          "Define sales organisation, distribution channel, and division; build valid sales areas.",
          "Assign plants, shipping points, and finance integration to sales areas.",
          "Document approval, pricing, credit, output, and tax responsibilities.",
          "Validate the design by creating display-only supplier/customer role proposals.",
        ],
        expectedInput: ["Purchasing model", "Sales-area model", "Plant assignments", "Approval and credit responsibilities"],
        expectedResult: ["Valid purchasing organisation", "Valid sales area", "Operational and finance assignments"],
        evidence: ["Assignment workbook", "Sales-area list", "Purchasing assignments", "Control ownership"],
      }),
    }),
    task(industryId, {
      id: "configure-controlling",
      phaseId: "enterprise-design",
      year: 1,
      level: "Foundation",
      title: "Configure controlling and responsibility reporting",
      objective: "Make every operational cost traceable to responsibility, product/service, activity, and profit.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Finance and Controlling configuration",
        appOrTransaction: "CBC/IMG; Manage Cost Centers, Manage Profit Centers, KS01/KE51 where available",
        navigation: "Finance -> Controlling -> Organisation and master data",
        prerequisites: ["Company code", "Chart of accounts", "Management reporting design", "Organisation owners"],
        steps: [
          "Define controlling-area scope and confirm fiscal-year and chart compatibility.",
          "Create standard hierarchies for cost centres and profit centres.",
          "Define activity types, statistical key figures, internal-order usage, and settlement concepts.",
          "Assign plants, materials/services, work centres, assets, and responsible managers.",
          "Validate responsibility reporting with a small planned-cost example.",
        ],
        expectedInput: ["Controlling area", "Cost/profit-centre hierarchy", "Activity types", "Settlement and profitability design"],
        expectedResult: ["Complete responsibility structure", "Valid operational assignments", "Traceable planned cost"],
        evidence: ["Hierarchy reports", "Master-data assignments", "Planned-cost result", "Responsibility matrix"],
      }),
    }),
    task(industryId, {
      id: "create-business-partners",
      phaseId: "master-data",
      year: 1,
      level: "Foundation",
      title: "Create supplier and customer business partners",
      objective: "Build controlled commercial master data for procurement, sales, credit, payment, tax, and reporting.",
      target: "partners",
      externalSap: instruction({
        workspace: "SAP Fiori Master Data Governance / Business Partner",
        appOrTransaction: "Manage Business Partner Master Data / BP",
        navigation: "Master Data -> Business Partner -> Create or change",
        prerequisites: ["Purchasing and sales structures", "Reconciliation accounts", "Payment/tax policy", "Approval workflow"],
        steps: [
          "Create general business-partner identity and address using training data.",
          "Add supplier roles with company-code and purchasing-organisation data.",
          "Add customer roles with company-code, sales-area, credit, delivery, and billing data.",
          "Validate duplicate, bank, tax, sanctions/compliance, and mandatory-field controls.",
          "Approve the change and test display in one procurement and one sales document.",
        ],
        expectedInput: ["Training supplier/customer identity", "Roles and organisations", "Reconciliation account", "Payment, tax, credit, and delivery terms"],
        expectedResult: ["Approved supplier", "Approved customer", "Valid finance and commercial extensions"],
        evidence: ["Business-partner numbers", "Role assignments", "Workflow approval", "Document eligibility check"],
      }),
    }),
    task(industryId, {
      id: "create-material-service",
      phaseId: "master-data",
      year: 1,
      level: "Foundation",
      title: "Create material and service masters",
      objective: "Provide planning, purchasing, inventory, sales, accounting, costing, quality, and warehouse views.",
      target: "masterdata",
      externalSap: instruction({
        workspace: "SAP Fiori Product Master Data",
        appOrTransaction: "Manage Product Master Data / MM01",
        navigation: "Master Data -> Product -> Create",
        prerequisites: ["Plants/storage", "Material types and numbering", "Valuation/account determination", "Units and classification"],
        steps: [
          "Select the correct material/service type and industry sector for the training design.",
          "Maintain basic, purchasing, MRP/planning, plant/storage, accounting, costing, sales, quality, and warehouse views as applicable.",
          "Set units, material group, valuation class, price control, lot size, lead time, availability, batch/shelf-life, and inspection settings.",
          "Assign profit centre and relevant product hierarchy/classification.",
          "Validate the record through planning, purchasing, stock, costing, and sales display apps.",
        ],
        expectedInput: masterDataExamples.length ? masterDataExamples : ["Industry product/service definitions", "Plant and valuation data", "Planning and control parameters"],
        expectedResult: ["Complete cross-functional product/service master", "Valid valuation and planning", "Usable transaction views"],
        evidence: ["Material/service number", "View checklist", "Valuation/planning fields", "Validation results"],
      }),
    }),
    task(industryId, {
      id: "create-operations-master-data",
      phaseId: "master-data",
      year: 1,
      level: "Foundation",
      title: "Create operations, quality, and maintenance master data",
      objective: "Build the objects that define how work is planned, executed, inspected, maintained, and costed.",
      target: "masterdata",
      externalSap: instruction({
        workspace: "SAP Fiori Manufacturing, Quality, and Asset Management",
        appOrTransaction: "CS01, CA01, CR01, C223, QS21, IE01 and equivalent Fiori apps",
        navigation: "Master Data -> Manufacturing / Quality / Asset Management",
        prerequisites: ["Products/services", "Plants", "Cost centres/activity types", "Engineering and quality design"],
        steps: [
          "Create work centres/resources with capacity, scheduling, costing, and responsibility data.",
          "Create BOM/recipe and routing/master recipe with quantities, operations, control keys, and standard values.",
          "Create production version or service execution selection where applicable.",
          "Create inspection characteristics/plans and equipment/functional locations for the operating model.",
          "Run consistency checks and a cost/planning test before releasing the master data.",
        ],
        expectedInput: ["Work/resource design", "Component/operation structure", "Quality specification", "Equipment/location hierarchy"],
        expectedResult: ["Usable operations master data", "Valid planning selection", "Cost and quality integration"],
        evidence: ["Work centre/resource", "BOM/recipe", "Routing/plan", "Quality and equipment records", "Consistency check"],
      }),
    }),
    task(industryId, {
      id: "create-finance-master-data",
      phaseId: "master-data",
      year: 1,
      level: "Foundation",
      title: "Create finance, cost, and reporting master data",
      objective: "Prepare ledgers, accounts, cost objects, assets, banks, tax, and reporting structures.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Finance and Controlling",
        appOrTransaction: "Manage G/L Account Master Data, cost/profit centre and asset apps",
        navigation: "Finance -> Master Data",
        prerequisites: ["Company code", "Chart and controlling design", "Accounting policies", "Reporting hierarchy"],
        steps: [
          "Create or verify operational, reconciliation, inventory, revenue, expense, variance, tax, and clearing accounts.",
          "Create cost centres, profit centres, activity types, internal orders, and settlement rules.",
          "Create asset classes/assets and bank/house-bank master data used in the training scope.",
          "Assign financial-statement and management-reporting hierarchies.",
          "Post and reverse controlled tests to verify account determination and reporting placement.",
        ],
        expectedInput: ["Account list and policies", "Cost/profit objects", "Asset and bank design", "Reporting hierarchy"],
        expectedResult: ["Complete finance master data", "Valid automatic account determination", "Correct report hierarchy"],
        evidence: ["Master-data lists", "Test postings", "Account-determination result", "Report extracts"],
      }),
    }),
    task(industryId, {
      id: "approve-master-data",
      phaseId: "master-data",
      year: 1,
      level: "Foundation",
      title: "Govern and approve the master-data baseline",
      objective: "Prove that data is owned, validated, approved, versioned, and safe for transaction execution.",
      target: "governance",
      externalSap: instruction({
        workspace: "SAP Master Data Governance or training approval workflow",
        appOrTransaction: "Manage Change Requests / MDG work centre",
        navigation: "Master Data Governance -> Change Requests -> Review and approve",
        prerequisites: ["Completed master records", "Named owners/stewards", "Validation rules", "Transport/change process"],
        steps: [
          "Submit each critical record or configuration set through the training approval route.",
          "Run completeness, duplicate, dependency, financial, and compliance validations.",
          "Resolve errors without bypassing controls or editing approved history.",
          "Record steward and business-owner approval with effective dates.",
          "Freeze the Year 1 baseline and document the controlled change method.",
        ],
        expectedInput: ["Change request", "Validation evidence", "Dependency impact", "Owner and steward decisions"],
        expectedResult: ["Approved baseline", "Version/audit trail", "Controlled change route"],
        evidence: ["Change-request IDs", "Validation results", "Approval history", "Baseline version"],
      }),
    }),
  ];

  for (const process of processTasks) {
    tasks.push(
      task(industryId, {
        id: `execute-${process.scenarioId}`,
        phaseId: "transactions",
        year: 1,
        level: "Practitioner",
        title: process.title,
        objective: process.objective,
        target: "tutor",
        scenarioId: process.scenarioId,
        externalSap: instruction({
          workspace: process.workspace,
          appOrTransaction: process.transaction,
          navigation: process.navigation,
          prerequisites: ["Approved organisation and master data", "Authorised learner role", "Current task playbook", "Evidence register"],
          steps: process.steps,
          expectedInput: process.inputs,
          expectedResult: process.results,
          evidence: process.evidence,
        }),
      }),
    );
  }

  tasks.push(
    task(industryId, {
      id: "calculate-standard-cost",
      phaseId: "costing",
      year: 2,
      level: "Practitioner",
      title: "Calculate and release planned product or service cost",
      objective: "Explain the cost build-up from material/service inputs, activities, overhead, and valuation assumptions.",
      target: "advanced",
      externalSap: instruction({
        workspace: "SAP Fiori Product Cost Planning / Service Costing",
        appOrTransaction: "CK11N -> CK13N -> CK24 or edition-equivalent apps",
        navigation: "Controlling -> Product Cost Planning -> Cost Estimate",
        prerequisites: ["Valuated inputs", "BOM/recipe or service structure", "Routing/activity prices", "Costing variant and overhead rules"],
        steps: [
          "Create the cost estimate for the Year 2 costing date and approved quantity structure.",
          "Review material, external, activity, overhead, and additive cost components.",
          "Resolve missing prices, invalid quantities, lot-size distortions, and costing errors.",
          "Compare current, planned, and prior cost; explain every material movement.",
          "Mark and release only the approved estimate in the training period.",
        ],
        expectedInput: ["Costing date/variant", "Quantity structure", "Input prices", "Activity prices", "Overhead rules"],
        expectedResult: ["Error-free cost estimate", "Approved cost component split", "Released standard/planned cost"],
        evidence: ["Cost estimate number/date", "Cost component split", "Error log", "Mark/release result"],
      }),
    }),
    task(industryId, {
      id: "analyse-actual-cost",
      phaseId: "costing",
      year: 2,
      level: "Practitioner",
      title: "Analyse actual cost and operational variance",
      objective: "Connect quantities, prices, yield, efficiency, downtime, and overhead to actual business performance.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Cost Analysis",
        appOrTransaction: "Order Cost Analysis, KOB1/COOIS and variance apps",
        navigation: "Controlling -> Cost Object Controlling -> Actual cost and variance",
        prerequisites: ["Completed operational orders", "Actual issues/receipts", "Confirmations", "Period activity prices"],
        steps: [
          "Reconcile actual material/service quantities to operational documents.",
          "Compare actual labour/machine activity with standards and capacity evidence.",
          "Identify price, usage, yield, scrap, mix, volume, efficiency, and overhead drivers.",
          "Separate data/configuration defects from genuine operational performance.",
          "Write a management explanation with corrective actions and accountable owners.",
        ],
        expectedInput: ["Actual order cost", "Standard cost", "Quantities/yield", "Activity and overhead postings"],
        expectedResult: ["Reconciled actual cost", "Explained variance", "Actionable operational response"],
        evidence: ["Plan/actual report", "Document drill-down", "Variance bridge", "Management commentary"],
      }),
    }),
    task(industryId, {
      id: "settle-cost-objects",
      phaseId: "costing",
      year: 2,
      level: "Practitioner",
      title: "Calculate variance and settle cost objects",
      objective: "Move completed-period balances to their authorised receivers and reconcile the resulting journal entries.",
      target: "advanced",
      externalSap: instruction({
        workspace: "SAP Fiori Period-End Closing for Controlling",
        appOrTransaction: "KKS2/KKS1 -> KO88/CO88 and settlement apps",
        navigation: "Controlling -> Period-End Closing -> Variance and Settlement",
        prerequisites: ["Complete operational postings", "Overhead/WIP rules", "Settlement profile/rule", "Open FI/CO period"],
        steps: [
          "Check order status, balance, missing confirmations, goods movements, and settlement rule.",
          "Calculate overhead and work in process where applicable.",
          "Calculate and classify variance against target/standard cost.",
          "Run settlement in test mode, review senders, receivers, accounts, and errors, then execute.",
          "Reconcile order balance, FI document, inventory/COGS, variance accounts, and profitability effect.",
        ],
        expectedInput: ["Period/year", "Eligible cost objects", "Settlement rules", "WIP/variance configuration"],
        expectedResult: ["Calculated WIP/variance", "Settled cost objects", "Reconciled FI/CO impact"],
        evidence: ["Close logs", "Settlement document", "Zero/expected order balance", "Variance account reconciliation"],
      }),
    }),
    task(industryId, {
      id: "explain-profitability",
      phaseId: "costing",
      year: 2,
      level: "Practitioner",
      title: "Explain customer, product, channel, and location profitability",
      objective: "Connect revenue, discounts, returns, service, logistics, cost, and working capital to contribution.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Margin Analysis and Management Accounting",
        appOrTransaction: "Market Segment Actuals / KE30-equivalent reporting",
        navigation: "Finance -> Management Accounting -> Margin Analysis",
        prerequisites: ["Reconciled revenue and COGS", "Profitability characteristics", "Settled variances", "Reporting hierarchy"],
        steps: [
          "Reconcile profitability revenue and cost to the general ledger.",
          "Analyse contribution by product/service, customer, channel, location, and period.",
          "Separate price, volume, mix, cost, return, freight, and service drivers.",
          "Identify profitable growth and loss-making combinations without hiding allocation assumptions.",
          "Prepare an executive recommendation linked to source SAP documents.",
        ],
        expectedInput: ["Profitability characteristics", "Revenue and deductions", "COGS and variances", "Logistics/service cost"],
        expectedResult: ["Reconciled contribution report", "Driver bridge", "Management recommendation"],
        evidence: ["Margin report", "GL reconciliation", "Document drill-down", "Recommendation and assumptions"],
      }),
    }),
    task(industryId, {
      id: "prepare-opening-balance",
      phaseId: "finance-close",
      year: 2,
      level: "Practitioner",
      title: "Prepare the controlled opening position",
      objective: "Confirm that operational subledgers and the general ledger start from a complete, reconciled baseline.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Finance data migration and reconciliation",
        appOrTransaction: "Migration Cockpit / balance carryforward and reconciliation apps",
        navigation: "Finance -> Data Migration / Closing Operations",
        prerequisites: ["Approved migration scope", "Opening trial balance", "Subledger detail", "Reconciliation owners"],
        steps: [
          "Validate mapping, currency, period, account, partner, asset, inventory, and controlling dimensions.",
          "Load or verify opening balances using the authorised training migration method.",
          "Reconcile AP, AR, assets, inventory, bank, tax, cost, and retained-earnings positions.",
          "Resolve differences with traceable correction documents rather than unexplained plugs.",
          "Obtain sign-off and lock the opening baseline for the three-year exercise.",
        ],
        expectedInput: ["Opening trial balance", "Subledger/open-item detail", "Inventory/assets", "Mapping and reconciliation rules"],
        expectedResult: ["Balanced opening ledger", "Reconciled subledgers", "Signed baseline"],
        evidence: ["Load logs", "Trial balance", "Subledger reconciliations", "Sign-off record"],
      }),
    }),
    task(industryId, {
      id: "perform-monthly-close",
      phaseId: "finance-close",
      year: 2,
      level: "Practitioner",
      title: "Perform a complete monthly close",
      objective: "Close operations and finance in dependency order and produce a reliable monthly result.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Advanced Financial Closing or closing worklist",
        appOrTransaction: "Closing tasks, reconciliation apps, depreciation, valuation, allocation and settlement apps",
        navigation: "Finance -> Closing Operations -> Monthly close",
        prerequisites: ["Close calendar", "Task owners", "Complete interfaces", "Open/close period authority"],
        steps: [
          "Confirm transaction cut-off and interface completeness for all eight processes.",
          "Reconcile bank, AP, AR, inventory, GR/IR, assets, tax, payroll, and intercompany.",
          "Post accruals, deferrals, provisions, depreciation, valuation, allocations, overhead, WIP, variance, and settlements.",
          "Review unusual journals, balances, margins, quantities, and late adjustments.",
          "Close the period after controller sign-off and publish the monthly reporting pack.",
        ],
        expectedInput: ["Close calendar", "Reconciliation evidence", "Approved journals", "Costing/settlement logs"],
        expectedResult: ["Closed period", "Reconciled trial balance", "Monthly financial and management pack"],
        evidence: ["Close checklist", "Reconciliations", "Journal list", "Trial balance", "Management pack"],
      }),
    }),
    task(industryId, {
      id: "perform-yearly-close",
      phaseId: "finance-close",
      year: 2,
      level: "Practitioner",
      title: "Perform yearly close and carry forward",
      objective: "Complete statutory and management year-end procedures and open the next year with reconciled balances.",
      target: "advanced",
      externalSap: instruction({
        workspace: "SAP Fiori Year-End Closing",
        appOrTransaction: "Year-end close, asset fiscal year change, balance carryforward, reporting apps",
        navigation: "Finance -> Closing Operations -> Year-end close",
        prerequisites: ["All monthly periods closed", "Audit adjustments", "Inventory count", "Tax and reporting decisions"],
        steps: [
          "Complete physical inventory, asset, tax, intercompany, foreign-currency, provisions, and audit adjustments.",
          "Re-run allocations, overhead, WIP, variance, settlements, depreciation, and subledger reconciliations.",
          "Review retained earnings, balance-sheet substantiation, profit, cash-flow support, and disclosures.",
          "Execute authorised fiscal-year changes and balance carryforward in dependency order.",
          "Reconcile opening balances in the next year and archive the signed evidence pack.",
        ],
        expectedInput: ["Final period balances", "Physical inventory/assets", "Audit/tax adjustments", "Carryforward controls"],
        expectedResult: ["Closed fiscal year", "Signed financial statements", "Reconciled next-year opening"],
        evidence: ["Year-end checklist", "Final trial balance", "Financial statements", "Carryforward logs", "Opening reconciliation"],
      }),
    }),
    task(industryId, {
      id: "publish-reporting-pack",
      phaseId: "finance-close",
      year: 2,
      level: "Practitioner",
      title: "Publish financial and operational reporting",
      objective: "Explain three years of business performance from source documents to statements and KPIs.",
      target: "analytics",
      externalSap: instruction({
        workspace: "SAP Fiori Financial and Management Reporting",
        appOrTransaction: "Balance Sheet/Income Statement, trial balance, cash-flow support, cost and margin apps",
        navigation: "Finance and Analytics -> Reporting",
        prerequisites: ["Closed/reconciled periods", "Reporting hierarchy", "KPI definitions", "Authorised audience"],
        steps: [
          "Run trial balance, income statement, balance sheet, and cash-flow support for the selected year and comparative periods.",
          "Run cost-centre, profit-centre, product/service cost, working-capital, inventory, service, quality, and margin reports.",
          "Reconcile every management total to an authoritative financial or operational source.",
          "Explain KPI changes using document, volume, price, mix, cost, event, and control evidence.",
          "Publish a concise board pack with decisions, risks, actions, owners, and assumptions.",
        ],
        expectedInput: ["Reporting period/version", "Financial hierarchy", "Management dimensions", ...blueprint.reporting.slice(0, 3)],
        expectedResult: ["Reconciled statements", "Industry KPI pack", "Three-year performance narrative"],
        evidence: ["Report parameters", "Financial statements", "KPI/margin reports", "Reconciliations", "Board commentary"],
      }),
    }),
  );

  ([1, 2, 3] as CurriculumYear[]).forEach((year) => {
    const yearIntent = year === 1
      ? "stabilise the configured enterprise and prove clean end-to-end execution"
      : year === 2
        ? "grow volume, manage constraints, and protect margin and working capital"
        : "optimise the operating model, controls, cost, service, and strategic reporting";
    tasks.push(
      task(industryId, {
        id: `operate-year-${year}`,
        phaseId: "three-year-operation",
        year,
        level: "Expert",
        title: `Operate and close Year ${year}`,
        objective: `Use SAP World and the external training system to ${yearIntent}.`,
        target: "studio",
        externalSap: instruction({
          workspace: "SAP World Simulation Studio plus the external SAP training system",
          appOrTransaction: "Industry process apps, close worklist, analytics and document-flow tools",
          navigation: `SAP World -> Simulation Studio -> ${industry.industry} -> Year ${year}`,
          prerequisites: ["Completed preceding mandatory curriculum tasks", year > 1 ? `Reconciled Year ${year - 1} carryforward` : "Approved Year 1 baseline", "Year plan and event scenario"],
          steps: [
            `Generate the Year ${year} industry scenario and record its stable signature.`,
            "Plan annual demand, workforce, capacity, sourcing, inventory, cost, cash, and compliance targets.",
            "Execute representative monthly transactions across all eight process chains in the external training system.",
            "Use the close calendar to complete twelve monthly closes, four quarterly reviews, and the yearly close.",
            "Compare SAP World ledger/analytics with external SAP evidence and explain differences.",
          ],
          expectedInput: [`Year ${year} plan`, "Industry event and volume profile", "Opening balances", "Process and close calendar"],
          expectedResult: [`Complete Year ${year} ledger`, "Twelve closed months", "Reconciled annual reports", "Management improvement actions"],
          evidence: ["Simulation ID/signature", "External SAP document register", "Monthly close pack", "Annual statements", "Year review"],
        }),
      }),
    );
  });

  tasks.push(
    task(industryId, {
      id: "recover-integrated-failures",
      phaseId: "controls-recovery",
      year: 3,
      level: "Expert",
      title: "Diagnose and recover integrated failures",
      objective: "Resolve failures using evidence and safe dependency order rather than trial-and-error posting.",
      target: "tutor",
      externalSap: instruction({
        workspace: "SAP application logs, document flow, process monitors, and controlled correction apps",
        appOrTransaction: "SLG1/application logs, process monitors, document display and reversal/correction apps",
        navigation: "Relevant process -> Monitor -> Error detail -> Controlled correction",
        prerequisites: ["Completed core processes", "Document-flow knowledge", "Authorised correction/reversal role", "Incident evidence template"],
        steps: [
          "State the symptom and affected business outcome without changing data.",
          "Trace upstream master/configuration and document dependencies to the first incorrect or missing evidence.",
          "Classify root cause as access, master data, configuration, transaction, integration, timing, or control failure.",
          "Design the lowest-risk correction, approval, reversal/repost, or reprocessing sequence.",
          "Verify downstream recovery, reconcile finance/inventory, and create a preventive-control action.",
        ],
        expectedInput: blueprint.commonProblems.slice(0, 3).map((problem) => `${problem.issue}: ${problem.signal}`),
        expectedResult: ["Evidence-based root cause", "Controlled recovery", "Reconciled downstream state", "Preventive action"],
        evidence: ["Incident timeline", "Application/document logs", "Correction documents", "Reconciliation", "Control improvement"],
      }),
    }),
    task(industryId, {
      id: "operate-approval-controls",
      phaseId: "controls-recovery",
      year: 3,
      level: "Expert",
      title: "Operate approvals, segregation, and audit evidence",
      objective: "Demonstrate that high-risk changes and transactions are authorised, traceable, and reviewable.",
      target: "workflows",
      externalSap: instruction({
        workspace: "SAP Fiori My Inbox, flexible workflow, access and audit reporting",
        appOrTransaction: "My Inbox / workflow logs / role and change-document reports",
        navigation: "My Inbox -> Task -> Evidence -> Decision history",
        prerequisites: ["Approval matrix", "Thresholds and substitutions", "Segregation design", "Audit evidence standard"],
        steps: [
          "Select representative master-data, purchasing, sales, journal, payment, and close approvals.",
          "Verify requester, approver, authority, amount/risk, evidence, and segregation before decision.",
          "Approve, reject, or request information with a decision-specific reason.",
          "Trace workflow and change-document history through the resulting business document.",
          "Test one negative scenario and document the detective/preventive control response.",
        ],
        expectedInput: ["Approval item", "Authority matrix", "Supporting evidence", "Risk/threshold and segregation result"],
        expectedResult: ["Valid controlled decisions", "Complete audit history", "Demonstrated negative control test"],
        evidence: ["Inbox task IDs", "Decision notes", "Workflow log", "Change documents", "Control-test result"],
      }),
    }),
    task(industryId, {
      id: "expert-capstone",
      phaseId: "expert-capstone",
      year: 3,
      level: "Expert",
      title: `Defend the ${industry.industry} expert capstone`,
      objective: "Prove independent end-to-end judgement without relying on prior real-world business experience.",
      target: "tutor",
      externalSap: instruction({
        workspace: "SAP World portfolio, external SAP evidence, and assessor review",
        appOrTransaction: "Transaction Tutor Capstone / evidence export / external SAP display apps",
        navigation: "SAP World -> Transaction Tutor -> Capstone and Learning centre -> Portfolio",
        prerequisites: ["All mandatory phases complete", "Three years closed", "Evidence register complete", "No unresolved reconciliation gaps"],
        steps: [
          "Present the enterprise design and explain why each organisational and master-data decision supports the industry value chain.",
          "Walk one document chain across all relevant operational and financial modules.",
          "Explain planned/actual cost, variance, settlement, margin, working capital, and financial statements.",
          "Diagnose an unseen exception, propose a safe recovery, and design a preventive control.",
          "Defend three years of management decisions using SAP documents, reconciliations, reports, and limitations.",
        ],
        expectedInput: ["Configuration/design workbook", "Three-year transaction evidence", "Close and reporting packs", "Exception/control case"],
        expectedResult: ["Expert-level end-to-end explanation", "Traceable evidence", "Defensible decisions", "Assessor-ready portfolio"],
        evidence: ["Capstone response", "Evidence export", "Assessor decision", "Revision history", "Personal development plan"],
      }),
    }),
  );

  return tasks;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function industryClosingCalendar(
  industryId: IndustryId,
  year: CurriculumYear,
): ClosingCalendarPeriod[] {
  const industry = industryById(industryId);
  return monthNames.map((label, index) => {
    const month = index + 1;
    const quarterly = month % 3 === 0;
    const yearly = month === 12;
    const closeType: ClosingCalendarPeriod["closeType"] = yearly
      ? "Yearly"
      : quarterly
        ? "Quarterly"
        : "Monthly";
    const focus = yearly
      ? "Complete statutory, management, inventory, asset, tax, audit, and carryforward work."
      : quarterly
        ? "Complete monthly close plus quarter review, forecast, controls, and management actions."
        : "Reconcile operational subledgers, cost, cash, tax, and the general ledger.";
    const requiredActions = [
      "Confirm cut-off and completeness across all eight process chains.",
      "Reconcile bank, AP, AR, inventory, GR/IR, assets, tax, payroll, cost objects, and intercompany.",
      "Post authorised adjustments, depreciation, allocations, overhead, WIP, variance, and settlement.",
      "Review trial balance, margin, working capital, industry KPIs, exceptions, and unusual journals.",
      yearly
        ? "Complete physical inventory, final statements, audit evidence, fiscal-year change, and next-year carryforward."
        : quarterly
          ? "Refresh the forecast and document quarter performance, risks, decisions, and control tests."
          : "Obtain controller sign-off, close the period, and publish the monthly performance pack.",
    ];
    return {
      id: `${industryId}-y${year}-m${String(month).padStart(2, "0")}`,
      year,
      month,
      label,
      focus,
      closeType,
      requiredActions,
      expectedResult: `${industry.enterprise} Year ${year} ${label} is reconciled, signed, and supported by a retained close pack.`,
    };
  });
}

export function taskYearSummary(
  tasks: IndustryCurriculumTask[],
  year: CurriculumYear,
) {
  return tasks.filter((taskItem) => taskItem.year === year);
}
