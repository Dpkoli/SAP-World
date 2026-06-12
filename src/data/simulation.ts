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
  id: "p2p" | "o2c" | "ptp";
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
    lessons: 11,
    progress: 0,
    status: "coming-soon",
    description:
      "Reconcile subledgers, post accruals, allocate costs, review variances, and close the period.",
  },
];

export const processCatalog = [
  { name: "Procure to Pay", code: "P2P", modules: "MM · QM · FI", scenarios: 8, readiness: 72 },
  { name: "Order to Cash", code: "O2C", modules: "SD · EWM · FI", scenarios: 6, readiness: 68 },
  { name: "Plan to Produce", code: "PTP", modules: "PP · MM · CO", scenarios: 7, readiness: 64 },
  { name: "Record to Report", code: "R2R", modules: "FI · CO", scenarios: 5, readiness: 16 },
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
];
