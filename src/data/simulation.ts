export type ProcessStep = {
  id: string;
  label: string;
  document: string;
  module: string;
  status: "complete" | "active" | "waiting";
};

export type TutorStep = {
  number: number;
  title: string;
  instruction: string;
  why: string;
  result: string;
  fields?: { label: string; value: string }[];
};

export type LearningPath = {
  id: string;
  title: string;
  process: string;
  module: string;
  role: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  progress: number;
  status: "available" | "coming-soon";
  description: string;
};

export type KnowledgeCheck = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ProcessScenario = {
  id: "p2p" | "o2c" | "ptp" | "r2r" | "qm";
  code: string;
  title: string;
  scenario: string;
  partyLabel: string;
  party: string;
  value: string;
  module: string;
  tutorTitle: string;
  tutorDescription: string;
  appName: string;
  transactionCode: string;
  steps: ProcessStep[];
  tutorSteps: TutorStep[];
  knowledgeCheck: KnowledgeCheck;
  impacts: {
    label: string;
    title: string;
    description: string;
  }[];
};

export const kpis = [
  { label: "Revenue YTD", value: "£18.42M", change: "+8.4%", tone: "good" },
  { label: "Open purchase orders", value: "47", change: "£1.26M", tone: "neutral" },
  { label: "Inventory value", value: "£4.81M", change: "32 days", tone: "neutral" },
  { label: "Production attainment", value: "94.2%", change: "-1.8%", tone: "warn" },
];

export const processSteps: ProcessStep[] = [
  { id: "PR", label: "Purchase Requisition", document: "10002871", module: "MM", status: "complete" },
  { id: "PO", label: "Purchase Order", document: "4500011842", module: "MM", status: "complete" },
  { id: "GR", label: "Goods Receipt", document: "5000042917", module: "MM / FI", status: "active" },
  { id: "QI", label: "Quality Inspection", document: "0400001844", module: "QM", status: "waiting" },
  { id: "IV", label: "Invoice Verification", document: "Pending", module: "MM / FI", status: "waiting" },
  { id: "PAY", label: "Vendor Payment", document: "Pending", module: "FI", status: "waiting" },
];

export const tutorSteps: TutorStep[] = [
  {
    number: 1,
    title: "Open Post Goods Receipt for Purchasing Document",
    instruction:
      "In SAP Fiori, search for and open the app “Post Goods Receipt for Purchasing Document.” In SAP GUI, use transaction MIGO.",
    why:
      "This is where SAP records that the physical malt has arrived against the approved purchase order.",
    result:
      "The goods receipt screen opens with the correct movement type for a supplier delivery.",
  },
  {
    number: 2,
    title: "Reference the purchase order",
    instruction:
      "Select Goods Receipt and Purchase Order, then enter purchase order 4500011842. Choose Enter to load the order items.",
    why:
      "Referencing the PO links the receipt to the agreed supplier, material, price, quantity, plant, and account assignment.",
    result:
      "SAP proposes the expected delivery of 20,000 KG of Pale Ale Malt.",
    fields: [
      { label: "Purchase order", value: "4500011842" },
      { label: "Movement type", value: "101" },
    ],
  },
  {
    number: 3,
    title: "Confirm quantity and location",
    instruction:
      "Select item 10. Enter 20,000 KG, plant BR01, storage location RM01, and supplier batch MALT-260611-A.",
    why:
      "The quantity updates stock and the location tells warehouse teams where it is held. The supplier batch preserves traceability.",
    result:
      "The material is ready to enter quality inspection stock at the Burton brewery.",
    fields: [
      { label: "Material", value: "RM-MALT-PALE-01" },
      { label: "Plant / SLoc", value: "BR01 / RM01" },
      { label: "Quantity", value: "20,000 KG" },
    ],
  },
  {
    number: 4,
    title: "Check and post",
    instruction:
      "Tick Item OK, choose Check, resolve any red messages, then choose Post.",
    why:
      "The check validates mandatory data before SAP creates inventory and financial documents.",
    result:
      "Material document 5000042917 is created. Stock increases in quality inspection and an accounting document credits GR/IR.",
  },
];

export const orderToCashSteps: ProcessStep[] = [
  { id: "SO", label: "Sales Order", document: "182934", module: "SD", status: "complete" },
  { id: "ATP", label: "Availability Check", document: "Confirmed", module: "SD / PP", status: "complete" },
  { id: "DLV", label: "Outbound Delivery", document: "800018447", module: "SD / EWM", status: "active" },
  { id: "PGI", label: "Post Goods Issue", document: "Pending", module: "SD / FI", status: "waiting" },
  { id: "BIL", label: "Billing", document: "Pending", module: "SD / FI", status: "waiting" },
  { id: "PAY", label: "Customer Payment", document: "Pending", module: "FI", status: "waiting" },
];

export const orderToCashTutorSteps: TutorStep[] = [
  {
    number: 1,
    title: "Open Create Sales Orders",
    instruction:
      "In SAP Fiori, open Create Sales Orders. In SAP GUI, use transaction VA01 and choose order type OR.",
    why:
      "The sales order captures the customer commitment and becomes the controlling document for availability, delivery, billing, and revenue.",
    result:
      "SAP opens a standard sales-order document for the UK domestic sales area.",
    fields: [
      { label: "Order type", value: "OR" },
      { label: "Sales area", value: "S100 / 10 / 00" },
    ],
  },
  {
    number: 2,
    title: "Enter customer and reference data",
    instruction:
      "Enter sold-to party 2000017, customer reference NT-PO-8841, and requested delivery date 18 June 2026.",
    why:
      "The customer master supplies pricing, shipping, payment, tax, partner, and credit-control data. The reference supports customer-service traceability.",
    result:
      "SAP determines Northern Taverns Ltd, its ship-to location, payment terms, and applicable sales conditions.",
    fields: [
      { label: "Sold-to party", value: "2000017" },
      { label: "Customer reference", value: "NT-PO-8841" },
      { label: "Requested date", value: "18.06.2026" },
    ],
  },
  {
    number: 3,
    title: "Enter products and check availability",
    instruction:
      "Add 240 kegs of FG-AMBER-KEG-50 and 160 kegs of FG-IPA-KEG-50. Review the confirmed quantities and delivery proposal.",
    why:
      "The availability check protects existing commitments and confirms whether inventory and planned receipts can satisfy the requested date.",
    result:
      "All 400 kegs are confirmed from DC01 for delivery on 18 June 2026.",
    fields: [
      { label: "Amber Ale", value: "240 EA" },
      { label: "Session IPA", value: "160 EA" },
      { label: "Delivering plant", value: "DC01" },
    ],
  },
  {
    number: 4,
    title: "Review pricing, credit, and save",
    instruction:
      "Open the item conditions, verify the contract discount and UK VAT, review the credit status, then save the order.",
    why:
      "Pricing determines expected revenue while the credit check controls financial exposure before warehouse fulfilment begins.",
    result:
      "Sales order 182934 is created for £46,720 net value and becomes due for outbound-delivery creation.",
  },
];

export const planToProduceSteps: ProcessStep[] = [
  { id: "DEM", label: "Planned Demand", document: "VSF-260624", module: "PP / IBP", status: "complete" },
  { id: "MRP", label: "MRP Run", document: "MRP-BR01-0612", module: "PP / MM", status: "complete" },
  { id: "PLN", label: "Planned Order", document: "3000048217", module: "PP", status: "complete" },
  { id: "PRD", label: "Production Order", document: "1000051842", module: "PP / CO", status: "active" },
  { id: "STG", label: "Component Staging", document: "Pending", module: "MM / EWM", status: "waiting" },
  { id: "CNF", label: "Confirmation & Receipt", document: "Pending", module: "PP / MM", status: "waiting" },
  { id: "SET", label: "Order Settlement", document: "Pending", module: "CO / FI", status: "waiting" },
];

export const planToProduceTutorSteps: TutorStep[] = [
  {
    number: 1,
    title: "Open Schedule MRP Runs",
    instruction:
      "In SAP Fiori, open Schedule MRP Runs. Create a planning run for plant BR01 using scope MRP Live. In SAP GUI, use MD01N.",
    why:
      "MRP compares independent demand, customer requirements, current stock, receipts, lead times, and lot sizes to calculate what must be produced or purchased.",
    result:
      "A plant-level planning job is prepared for the Burton Brewery without changing master data.",
    fields: [
      { label: "Plant", value: "BR01" },
      { label: "Planning scope", value: "MRP Live" },
      { label: "Planning mode", value: "Adapt planning data" },
    ],
  },
  {
    number: 2,
    title: "Execute and review MRP results",
    instruction:
      "Start the run and open its material results. Review FG-AMBER-KEG-50 and the shortage date caused by planned demand for 1,000 kegs.",
    why:
      "The planner must validate the system proposal before committing capacity and materials. Exception messages identify timing or quantity risks.",
    result:
      "SAP creates planned order 3000048217 for 500 HL of Amber Ale and dependent requirements for malt, hops, yeast, kegs, and labels.",
    fields: [
      { label: "Finished product", value: "FG-AMBER-KEG-50" },
      { label: "Planned quantity", value: "500 HL" },
      { label: "Finish date", value: "24.06.2026" },
    ],
  },
  {
    number: 3,
    title: "Check capacity and component availability",
    instruction:
      "Open the planned order, review Brew House 2 capacity, then run the component availability check for the BOM requirements.",
    why:
      "A feasible order needs both work-centre capacity and available components. Releasing an infeasible order would create shop-floor disruption.",
    result:
      "Capacity is available for the selected dates and all components are confirmed except CO2, which has a rescheduling proposal.",
    fields: [
      { label: "Work centre", value: "BR01-BREW-02" },
      { label: "Recipe / BOM", value: "AMBER-ALE-01" },
      { label: "Exception", value: "Reschedule CO2 receipt" },
    ],
  },
  {
    number: 4,
    title: "Convert to a production order",
    instruction:
      "Choose Convert, use production-order type PP01, verify the scheduling dates and batch requirement, then save.",
    why:
      "Conversion changes a planning proposal into an executable and cost-controlled manufacturing order with reservations and operations.",
    result:
      "Production order 1000051842 is created with component reservations, operation dates, and a preliminary cost estimate.",
    fields: [
      { label: "Order type", value: "PP01" },
      { label: "Production order", value: "1000051842" },
      { label: "Planned cost", value: "£31,480" },
    ],
  },
  {
    number: 5,
    title: "Release the production order",
    instruction:
      "Open Manage Production Orders, select order 1000051842, run the final availability check, and choose Release.",
    why:
      "Release authorizes component issue, shop-floor confirmation, activity posting, goods receipt, and quality processing.",
    result:
      "The order status becomes REL and warehouse staging requirements are generated for the brewing components.",
  },
];

export const recordToReportSteps: ProcessStep[] = [
  { id: "SUB", label: "Subledger Reconciliation", document: "REC-P03-0626", module: "FI-AP / FI-AR", status: "complete" },
  { id: "ACC", label: "Accruals & Deferrals", document: "1900005184", module: "FI-GL", status: "complete" },
  { id: "ALL", label: "Cost Allocations", document: "CO-CYC-P03", module: "CO", status: "complete" },
  { id: "VAR", label: "Variance Calculation", document: "VAR-BR01-P03", module: "CO / PP", status: "active" },
  { id: "SET", label: "Order Settlement", document: "Pending", module: "CO / FI", status: "waiting" },
  { id: "CLS", label: "Period Close", document: "Pending", module: "FI / CO", status: "waiting" },
  { id: "RPT", label: "Financial Reporting", document: "Pending", module: "FI / BW", status: "waiting" },
];

export const recordToReportTutorSteps: TutorStep[] = [
  {
    number: 1,
    title: "Review the closing task list",
    instruction:
      "Open Schedule General Ledger Jobs and review closing task list BCB1-P03-2026. Confirm that AP, AR, inventory, and asset subledger tasks are ready.",
    why:
      "The general ledger can only be trusted when the operational subledgers are complete and reconciled. The task list controls ownership, dependencies, and evidence.",
    result:
      "SAP shows AP, AR, inventory, and bank reconciliations complete, with production variance and settlement still outstanding.",
    fields: [
      { label: "Company code", value: "BCB1" },
      { label: "Fiscal period", value: "03 / 2026" },
      { label: "Closing task list", value: "BCB1-P03-2026" },
    ],
  },
  {
    number: 2,
    title: "Post the utilities accrual",
    instruction:
      "Open Post General Journal Entries, use document type SA, and accrue £84,600 of unbilled electricity and gas to cost centre BR01-UTIL.",
    why:
      "The expense belongs to the current period even though the supplier invoice has not arrived. Accrual accounting matches cost to the period that consumed the service.",
    result:
      "Journal entry 1900005184 debits utilities expense and credits accrued liabilities, with automatic reversal on 1 July 2026.",
    fields: [
      { label: "Debit", value: "610410 Utilities £84,600" },
      { label: "Credit", value: "219100 Accrued liabilities £84,600" },
      { label: "Reversal date", value: "01.07.2026" },
    ],
  },
  {
    number: 3,
    title: "Execute cost-centre allocations",
    instruction:
      "Run allocation cycle CO-CYC-P03 for canteen, utilities, maintenance support, and shared warehouse costs. Review sender credits and receiver debits.",
    why:
      "Shared service costs must move to the production and commercial areas that consumed them so product and departmental profitability are complete.",
    result:
      "£312,400 is allocated across brewing, packaging, warehousing, sales, and administration cost centres.",
    fields: [
      { label: "Controlling area", value: "BCB1" },
      { label: "Allocation cycle", value: "CO-CYC-P03" },
      { label: "Allocated value", value: "£312,400" },
    ],
  },
  {
    number: 4,
    title: "Calculate production variances",
    instruction:
      "Open Schedule Product Costing Jobs and run variance calculation for plant BR01, period 03, order group BREW-CLOSED.",
    why:
      "Variance calculation explains the difference between the standard cost credited at goods receipt and the actual material, labour, machine, and overhead debits on each order.",
    result:
      "SAP identifies £42,780 total variance, including £18,600 adverse material usage and £9,400 favourable efficiency variance.",
    fields: [
      { label: "Plant", value: "BR01" },
      { label: "Order group", value: "BREW-CLOSED" },
      { label: "Net variance", value: "£42,780 adverse" },
    ],
  },
  {
    number: 5,
    title: "Settle production orders",
    instruction:
      "Run settlement for the technically completed production orders and review the FI and CO documents before releasing the job.",
    why:
      "Settlement clears remaining production-order balances to price-difference, inventory, or profitability objects according to the settlement rule.",
    result:
      "Production variances are posted to the appropriate accounts and all 38 eligible orders have zero residual balance.",
  },
  {
    number: 6,
    title: "Close the period and validate reports",
    instruction:
      "Confirm all close checks, restrict postings for period 03, then review the trial balance, profit and loss statement, balance sheet, and profit-centre report.",
    why:
      "Period control prevents late operational postings from changing approved results. Financial statements confirm that the enterprise is balanced and performance is explainable.",
    result:
      "Period 03 closes with £5.14M revenue, 31.6% gross margin, £0.61M operating profit, and balanced debit/credit totals.",
    fields: [
      { label: "Revenue", value: "£5.14M" },
      { label: "Gross margin", value: "31.6%" },
      { label: "Operating profit", value: "£0.61M" },
    ],
  },
];

export const qualityManagementSteps: ProcessStep[] = [
  { id: "LOT", label: "Inspection Lot", document: "0400001844", module: "QM / MM", status: "complete" },
  { id: "SMP", label: "Sample Calculation", document: "Sample 0001", module: "QM", status: "complete" },
  { id: "RES", label: "Results Recording", document: "In progress", module: "QM", status: "active" },
  { id: "DEF", label: "Defect Recording", document: "Conditional", module: "QM", status: "waiting" },
  { id: "UD", label: "Usage Decision", document: "Pending", module: "QM / MM", status: "waiting" },
  { id: "STK", label: "Stock Posting", document: "Pending", module: "MM / FI", status: "waiting" },
  { id: "VEN", label: "Supplier Evaluation", document: "Pending", module: "QM / MM", status: "waiting" },
];

export const qualityManagementTutorSteps: TutorStep[] = [
  {
    number: 1,
    title: "Open Manage Inspection Lots",
    instruction:
      "In SAP Fiori, open Manage Inspection Lots and search for inspection lot 0400001844. In SAP GUI, use QA32.",
    why:
      "The inspection lot is the controlled quality record linking the supplier delivery, material, batch, inspection plan, sample, results, and stock decision.",
    result:
      "SAP displays the 20,000 KG Pale Ale Malt receipt from Highland Maltings in quality inspection stock.",
    fields: [
      { label: "Inspection lot", value: "0400001844" },
      { label: "Material", value: "RM-MALT-PALE-01" },
      { label: "Batch", value: "MALT-260611-A" },
    ],
  },
  {
    number: 2,
    title: "Review the inspection plan and sample",
    instruction:
      "Open the inspection specifications. Confirm plan MALT-IN-01, sample size 2 KG, and characteristics for moisture, protein, extract, colour, and contamination.",
    why:
      "The inspection plan ensures each delivery is tested consistently against approved technical specifications and sampling rules.",
    result:
      "The laboratory receives a controlled sample with five required characteristics and defined acceptance limits.",
    fields: [
      { label: "Inspection plan", value: "MALT-IN-01" },
      { label: "Sample size", value: "2 KG" },
      { label: "Inspection type", value: "01 Goods receipt" },
    ],
  },
  {
    number: 3,
    title: "Record laboratory results",
    instruction:
      "Choose Record Results. Enter moisture 4.3%, protein 10.8%, extract 81.2%, colour 5.2 EBC, and contamination result Not Detected.",
    why:
      "Result recording creates objective evidence that the received batch meets recipe, yield, food-safety, and process-performance requirements.",
    result:
      "All quantitative values fall within specification and the qualitative contamination check is accepted.",
    fields: [
      { label: "Moisture", value: "4.3% · Limit ≤ 4.5%" },
      { label: "Protein", value: "10.8% · 9.5–11.5%" },
      { label: "Extract", value: "81.2% · Limit ≥ 80.5%" },
    ],
  },
  {
    number: 4,
    title: "Evaluate defects and complete results",
    instruction:
      "Review characteristic valuations and choose Complete. If a result is rejected, record a defect and create a quality notification before continuing.",
    why:
      "Completing results prevents silent changes and ensures rejected characteristics trigger traceable corrective action rather than an unsupported stock release.",
    result:
      "The lot receives accepted characteristic valuations with no defect notification required for this batch.",
  },
  {
    number: 5,
    title: "Make the usage decision",
    instruction:
      "Open Make Usage Decision, select code A1 Accept, enter the decision note, and post all 20,000 KG to unrestricted-use stock.",
    why:
      "The usage decision is the formal quality authorization that determines whether stock can be used, blocked, returned, reworked, or scrapped.",
    result:
      "The inspection lot closes and material document 5000042988 transfers the batch from quality inspection to unrestricted stock.",
    fields: [
      { label: "Decision code", value: "A1 Accept" },
      { label: "Stock posting", value: "20,000 KG unrestricted" },
      { label: "Material document", value: "5000042988" },
    ],
  },
  {
    number: 6,
    title: "Review supplier quality impact",
    instruction:
      "Open the supplier evaluation for Highland Maltings and confirm the accepted inspection updates the quality score and delivery history.",
    why:
      "Supplier evaluation converts individual inspection outcomes into sourcing evidence for future awards, development actions, and risk decisions.",
    result:
      "Highland Maltings retains a quality score of 94/100 and the batch becomes available to production planning.",
  },
];

export const activity = [
  { time: "09:42", title: "Goods receipt posted", detail: "20,000 KG Pale Ale Malt · PO 4500011842", module: "MM" },
  { time: "09:18", title: "Inspection lot created", detail: "Incoming raw material · Lot 0400001844", module: "QM" },
  { time: "08:55", title: "Production order released", detail: "Brew House 2 · Amber Ale 50,000 L", module: "PP" },
  { time: "08:31", title: "Customer credit block cleared", detail: "Northern Taverns Ltd · Order 182934", module: "SD" },
];

export const mentorAnswers: Record<string, string> = {
  "Why is the stock in quality inspection?":
    "Pale Ale Malt is inspection-controlled in its material master. The 101 goods receipt therefore creates inspection lot 0400001844 and places the 20,000 KG in quality inspection stock. It cannot be consumed by production until QM records an accepted usage decision.",
  "What accounting entry was created?":
    "At goods receipt, SAP debits Raw Material Inventory and credits the GR/IR clearing account using the purchase order value. The supplier liability is not posted until invoice verification.",
  "What happens next?":
    "A quality technician records moisture, protein, and contamination results. If accepted, a usage decision moves the batch to unrestricted stock. Invoice verification can then match the PO, receipt, and supplier invoice.",
  "Why did MRP create this planned order?":
    "Demand for Amber Ale exceeded available stock and already scheduled receipts by the shortage date. MRP used the material master lot size, in-house production time, BOM, and routing to create planned order 3000048217 for 500 HL.",
  "When are production costs posted?":
    "The preliminary cost estimate is calculated when the production order is created. Actual material costs post at goods issue, activity costs post during confirmation, and the remaining balance is analyzed and settled through CO.",
  "When does finished-goods inventory increase?":
    "Finished-goods inventory increases when a goods receipt is posted against the production order. SAP debits finished-goods inventory and credits the production order, normally at the material's standard price.",
  "Why do we post an accrual?":
    "An accrual recognizes an expense and liability in the period that consumed the service even when the supplier invoice has not arrived. This prevents profit from being overstated and supports a reliable period close.",
  "Why are production orders settled?":
    "Goods issues, confirmations, overhead, and goods receipts leave costs and credits on production orders. Variance calculation explains the difference, and settlement transfers the remaining balance to the correct inventory, price-difference, or profitability object.",
  "Why lock the accounting period?":
    "After close checks and reporting are approved, posting-period control prevents late transactions from changing published results. Authorized finance roles can open controlled adjustment periods when necessary.",
  "Why is a usage decision required?":
    "Results prove what was measured, but the usage decision is the formal business authorization for stock disposition. It closes the inspection lot and posts the quantity to unrestricted, blocked, return, rework, or scrap stock.",
  "What happens when a result fails?":
    "SAP values the characteristic as rejected. The inspector can record a defect and create a quality notification, while the stock remains unavailable until an authorized usage decision determines its disposition.",
  "Does the quality stock transfer create value?":
    "A transfer from quality inspection to unrestricted stock usually changes stock type, not total quantity or inventory value. Accounting postings occur only when the chosen disposition changes valuation, such as scrapping or returning stock.",
};

export const learningPaths: LearningPath[] = [
  {
    id: "mm-goods-receipt",
    title: "Receive materials with quality inspection",
    process: "Procure to Pay",
    module: "MM + QM + FI",
    role: "Warehouse Operative",
    level: "Foundation",
    duration: "35 min",
    lessons: 4,
    progress: 50,
    status: "available",
    description:
      "Post a purchase-order receipt, create the inspection lot, and understand the stock and accounting impact.",
  },
  {
    id: "sd-order-to-cash",
    title: "Fulfil a customer sales order",
    process: "Order to Cash",
    module: "SD + EWM + FI",
    role: "Sales Coordinator",
    level: "Foundation",
    duration: "45 min",
    lessons: 4,
    progress: 0,
    status: "available",
    description:
      "Move from customer demand through availability, delivery, goods issue, billing, and receivables.",
  },
  {
    id: "pp-brew-plan",
    title: "Plan and execute a brewing run",
    process: "Plan to Produce",
    module: "PP + MM + CO",
    role: "Production Planner",
    level: "Intermediate",
    duration: "60 min",
    lessons: 5,
    progress: 0,
    status: "available",
    description:
      "Run MRP, convert planned supply, stage components, confirm production, and settle the order.",
  },
  {
    id: "fi-month-close",
    title: "Complete month-end financial close",
    process: "Record to Report",
    module: "FI + CO",
    role: "Financial Accountant",
    level: "Advanced",
    duration: "90 min",
    lessons: 6,
    progress: 0,
    status: "available",
    description:
      "Reconcile subledgers, post accruals, allocate costs, review variances, and close the period.",
  },
  {
    id: "qm-inspection",
    title: "Inspect and release incoming materials",
    process: "Quality Management",
    module: "QM + MM + FI",
    role: "Quality Technician",
    level: "Intermediate",
    duration: "50 min",
    lessons: 6,
    progress: 0,
    status: "available",
    description:
      "Record laboratory results, manage defects, make a usage decision, and update supplier quality performance.",
  },
];

export const processCatalog = [
  { name: "Procure to Pay", code: "P2P", modules: "MM · QM · FI", scenarios: 8, readiness: 72 },
  { name: "Order to Cash", code: "O2C", modules: "SD · EWM · FI", scenarios: 6, readiness: 68 },
  { name: "Plan to Produce", code: "PTP", modules: "PP · MM · CO", scenarios: 7, readiness: 64 },
  { name: "Record to Report", code: "R2R", modules: "FI · CO", scenarios: 5, readiness: 61 },
  { name: "Quality Management", code: "QM", modules: "QM · MM · FI", scenarios: 6, readiness: 66 },
];

export const knowledgeCheck: KnowledgeCheck = {
  question:
    "After posting this goods receipt, why is the supplier account not credited?",
  options: [
    "The material has not passed quality inspection",
    "The supplier liability is created during invoice verification",
    "The purchase order has already paid the supplier",
  ],
  correctIndex: 1,
  explanation:
    "Goods receipt recognizes inventory and credits GR/IR. The supplier payable is created only when the invoice is posted and matched.",
};

export const orderToCashKnowledgeCheck: KnowledgeCheck = {
  question:
    "When does SAP normally recognize the cost of goods sold for this order?",
  options: [
    "When the sales order is saved",
    "When the outbound delivery is created",
    "When post goods issue reduces finished-goods inventory",
  ],
  correctIndex: 2,
  explanation:
    "Post goods issue credits finished-goods inventory and debits cost of goods sold. Billing later records customer receivables and revenue.",
};

export const planToProduceKnowledgeCheck: KnowledgeCheck = {
  question:
    "Why does MRP create dependent requirements for malt and packaging when it proposes the finished-product planned order?",
  options: [
    "The BOM explodes the finished-product quantity into required components",
    "The sales order directly creates purchase orders for every component",
    "The work centre automatically owns all raw-material stock",
  ],
  correctIndex: 0,
  explanation:
    "MRP uses the bill of material to calculate component quantities and dates from the planned finished-product supply. Procurement proposals then cover any component shortages.",
};

export const recordToReportKnowledgeCheck: KnowledgeCheck = {
  question:
    "Why is the unbilled utilities cost accrued before closing the period?",
  options: [
    "To recognize the expense in the period that consumed the utilities",
    "To create a purchase order automatically for the energy supplier",
    "To increase finished-goods inventory by the same amount",
  ],
  correctIndex: 0,
  explanation:
    "The accrual follows the matching principle: current-period operations consumed the utilities, so the expense and liability are recognized now and reversed when the supplier invoice is expected.",
};

export const qualityManagementKnowledgeCheck: KnowledgeCheck = {
  question:
    "Why can production not consume the malt immediately after all inspection results are accepted?",
  options: [
    "The supplier invoice must be paid first",
    "An authorized usage decision must release the stock from quality inspection",
    "MRP must recreate the purchase order",
  ],
  correctIndex: 1,
  explanation:
    "Accepted results are evidence, but the usage decision is the formal stock-disposition authorization. Posting the decision moves the batch from quality inspection to unrestricted-use stock.",
};

export const processScenarios: ProcessScenario[] = [
  {
    id: "p2p",
    code: "P2P-2026-0148",
    title: "Procure to Pay",
    scenario: "Raw material replenishment",
    partyLabel: "Supplier",
    party: "Highland Maltings PLC",
    value: "£14,800.00",
    module: "SAP MM",
    tutorTitle: "Post a goods receipt",
    tutorDescription: "Learn with real values from the Burton Brewery simulation.",
    appName: "Post Goods Receipt for Purchasing Document",
    transactionCode: "MIGO",
    steps: processSteps,
    tutorSteps,
    knowledgeCheck,
    impacts: [
      { label: "Inventory impact", title: "20,000 KG received", description: "Pale Ale Malt is held in quality inspection stock at BR01 / RM01 until a usage decision is recorded." },
      { label: "Accounting impact", title: "Dr Inventory / Cr GR-IR", description: "The receipt recognizes the asset before the supplier invoice creates a payable." },
      { label: "Operational impact", title: "Production supply protected", description: "The batch covers seven days of planned brewing demand, subject to quality release." },
    ],
  },
  {
    id: "o2c",
    code: "O2C-2026-0094",
    title: "Order to Cash",
    scenario: "On-trade customer replenishment",
    partyLabel: "Customer",
    party: "Northern Taverns Ltd",
    value: "£46,720.00",
    module: "SAP SD",
    tutorTitle: "Create a customer sales order",
    tutorDescription: "Capture demand, confirm supply, apply pricing, and control customer credit.",
    appName: "Create Sales Orders",
    transactionCode: "VA01",
    steps: orderToCashSteps,
    tutorSteps: orderToCashTutorSteps,
    knowledgeCheck: orderToCashKnowledgeCheck,
    impacts: [
      { label: "Inventory impact", title: "400 kegs allocated", description: "Available-to-promise confirms finished goods at DC01; stock is reduced only when goods issue is posted." },
      { label: "Accounting impact", title: "No posting at order entry", description: "Sales-order creation records a commercial commitment without posting to the general ledger." },
      { label: "Operational impact", title: "Warehouse demand created", description: "The confirmed schedule lines become due for outbound delivery, picking, loading, and transport planning." },
    ],
  },
  {
    id: "ptp",
    code: "PTP-2026-0068",
    title: "Plan to Produce",
    scenario: "Amber Ale replenishment",
    partyLabel: "Finished product",
    party: "FG-AMBER-KEG-50",
    value: "500 HL / £31,480 planned cost",
    module: "SAP PP",
    tutorTitle: "Run MRP and release production",
    tutorDescription: "Turn demand into a feasible, cost-controlled brewery production order.",
    appName: "Schedule MRP Runs",
    transactionCode: "MD01N",
    steps: planToProduceSteps,
    tutorSteps: planToProduceTutorSteps,
    knowledgeCheck: planToProduceKnowledgeCheck,
    impacts: [
      { label: "Inventory impact", title: "Requirements and reservations created", description: "BOM explosion creates dated component demand; production-order conversion reserves materials for execution." },
      { label: "Accounting impact", title: "Planned cost baseline £31,480", description: "The production order carries planned material, labour, machine, and overhead costs; actual postings begin during execution." },
      { label: "Operational impact", title: "Brew House 2 scheduled", description: "Capacity, component availability, operation dates, and warehouse staging are coordinated before release." },
    ],
  },
  {
    id: "r2r",
    code: "R2R-2026-P03",
    title: "Record to Report",
    scenario: "June month-end close",
    partyLabel: "Company code / period",
    party: "BCB1 / 03-2026",
    value: "£5.14M revenue / £0.61M operating profit",
    module: "SAP FI / CO",
    tutorTitle: "Complete the month-end close",
    tutorDescription: "Reconcile operations, recognize period costs, settle production, and publish trusted financial results.",
    appName: "Schedule General Ledger Jobs",
    transactionCode: "FAGL_FCV / F.01",
    steps: recordToReportSteps,
    tutorSteps: recordToReportTutorSteps,
    knowledgeCheck: recordToReportKnowledgeCheck,
    impacts: [
      { label: "Inventory impact", title: "Valuation and variances finalized", description: "Inventory balances reconcile to the material ledger while production variances are calculated and settled." },
      { label: "Accounting impact", title: "Period 03 results completed", description: "Accruals, allocations, settlements, and subledger balances produce a balanced and period-complete general ledger." },
      { label: "Operational impact", title: "Performance becomes explainable", description: "Profit-centre, product, customer, and cost-centre reporting show how operations created the period result." },
    ],
  },
  {
    id: "qm",
    code: "QM-2026-0184",
    title: "Quality Management",
    scenario: "Incoming malt inspection",
    partyLabel: "Inspection lot / supplier",
    party: "0400001844 / Highland Maltings PLC",
    value: "20,000 KG / £14,800 inventory",
    module: "SAP QM",
    tutorTitle: "Inspect and release incoming malt",
    tutorDescription: "Record controlled results, evaluate defects, authorize stock, and update supplier quality.",
    appName: "Manage Inspection Lots",
    transactionCode: "QA32 / QE51N",
    steps: qualityManagementSteps,
    tutorSteps: qualityManagementTutorSteps,
    knowledgeCheck: qualityManagementKnowledgeCheck,
    impacts: [
      { label: "Inventory impact", title: "20,000 KG quality stock controlled", description: "The batch remains unavailable until usage decision A1 posts it from quality inspection to unrestricted-use stock." },
      { label: "Accounting impact", title: "No value change on acceptance", description: "The stock-type transfer preserves inventory quantity and value; reject dispositions can create return, scrap, or claim postings." },
      { label: "Operational impact", title: "Recipe compliance protected", description: "Moisture, protein, extract, colour, and contamination results protect yield, product consistency, and food safety." },
    ],
  },
];
