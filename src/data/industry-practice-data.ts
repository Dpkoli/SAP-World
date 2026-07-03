import { industryBlueprintById } from "@/data/industry-blueprints";
import { industryById, type IndustryId } from "@/data/industries";

export type PracticeYear = 1 | 2 | 3;

export type IndustryConfigurationWorkstream = {
  sequence: number;
  area: string;
  workspace: string;
  transactions: string;
  keyDecisions: string[];
  validation: string;
};

export type IndustrySpecialistTransaction = {
  id: string;
  title: string;
  module: string;
  role: string;
  appOrTransaction: string;
  businessTrigger: string;
  prerequisites: string[];
  expectedInput: string[];
  steps: string[];
  expectedResult: string[];
  accountingImpact: string;
  controls: string[];
};

export type IndustryCostComponent = {
  name: string;
  share: number;
  driver: string;
};

export type IndustryMonthlyPracticeRecord = {
  id: string;
  year: PracticeYear;
  month: number;
  period: string;
  operatingVolume: number;
  volumeUnit: string;
  plannedRevenue: number;
  revenue: number;
  directCost: number;
  labourCost: number;
  overheadCost: number;
  logisticsCost: number;
  operatingExpense: number;
  depreciation: number;
  ebitda: number;
  operatingProfit: number;
  inventory: number;
  receivables: number;
  payables: number;
  cash: number;
  transactionDocuments: number;
  exception: string;
};

export type IndustryAnnualPracticeSummary = {
  year: PracticeYear;
  revenue: number;
  directCost: number;
  labourCost: number;
  overheadCost: number;
  logisticsCost: number;
  operatingExpense: number;
  depreciation: number;
  ebitda: number;
  operatingProfit: number;
  closingInventory: number;
  closingReceivables: number;
  closingPayables: number;
  closingCash: number;
  transactionDocuments: number;
};

export type IndustryPracticePack = {
  industryId: IndustryId;
  enterprise: string;
  datasetVersion: string;
  currency: "GBP";
  fiscalYears: ["2023-2024", "2024-2025", "2025-2026"];
  scope: string;
  configuration: IndustryConfigurationWorkstream[];
  specialistTransactions: IndustrySpecialistTransaction[];
  costing: {
    costObject: string;
    method: string;
    settlementReceiver: string;
    profitabilityDimensions: string[];
    components: IndustryCostComponent[];
  };
  monthlyRecords: IndustryMonthlyPracticeRecord[];
  annualSummaries: IndustryAnnualPracticeSummary[];
};

type SpecialistInput = Omit<IndustrySpecialistTransaction, "id">;

type PracticeProfile = {
  code: string;
  baseMonthlyRevenue: number;
  baseMonthlyVolume: number;
  volumeUnit: string;
  growth: [number, number, number];
  seasonality: number[];
  ratios: {
    direct: number;
    labour: number;
    overhead: number;
    logistics: number;
    opex: number;
    depreciation: number;
    inventory: number;
    receivables: number;
    payables: number;
  };
  costObject: string;
  costingMethod: string;
  settlementReceiver: string;
  profitabilityDimensions: string[];
  costComponents: IndustryCostComponent[];
  specialistConfiguration: Array<{
    area: string;
    workspace: string;
    transactions: string;
    decisions: string[];
    validation: string;
  }>;
  specialistTransactions: SpecialistInput[];
};

function specialist(
  title: string,
  module: string,
  role: string,
  appOrTransaction: string,
  businessTrigger: string,
  expectedInput: string[],
  steps: string[],
  expectedResult: string[],
  accountingImpact: string,
  controls: string[],
): SpecialistInput {
  return {
    title,
    module,
    role,
    appOrTransaction,
    businessTrigger,
    prerequisites: [
      "Approved organisational structure and master data",
      "Authorised non-production learner role",
      "Open posting period and evidence register",
    ],
    expectedInput,
    steps,
    expectedResult,
    accountingImpact,
    controls,
  };
}

const profiles: Record<IndustryId, PracticeProfile> = {
  brewery: {
    code: "BRW",
    baseMonthlyRevenue: 1_520_000,
    baseMonthlyVolume: 42_000,
    volumeUnit: "HL",
    growth: [1, 1.11, 1.24],
    seasonality: [0.82, 0.86, 0.94, 1.02, 1.12, 1.22, 1.28, 1.21, 1.04, 0.96, 1.05, 1.18],
    ratios: { direct: 0.31, labour: 0.12, overhead: 0.11, logistics: 0.08, opex: 0.16, depreciation: 0.04, inventory: 0.23, receivables: 0.16, payables: 0.12 },
    costObject: "Process order and packaged beverage material",
    costingMethod: "Standard cost with material ledger actual costing",
    settlementReceiver: "Finished goods, variance accounts, and margin analysis",
    profitabilityDimensions: ["Brand", "Pack format", "Customer", "Channel", "Plant"],
    costComponents: [
      { name: "Ingredients", share: 26, driver: "Recipe quantity and purchase price" },
      { name: "Packaging", share: 29, driver: "Bottle, can, keg, carton, and loss" },
      { name: "Brewing activities", share: 18, driver: "Machine and labour activity" },
      { name: "Utilities and overhead", share: 15, driver: "Energy, water, and overhead rate" },
      { name: "Quality and logistics", share: 12, driver: "Inspection, warehousing, and freight" },
    ],
    specialistConfiguration: [
      { area: "Process manufacturing", workspace: "CBC/IMG Production Planning for Process Industries", transactions: "COR1/COR2, C201, C223", decisions: ["Master recipe", "Production version", "Process order type"], validation: "Create and cost a test process order without master-data errors." },
      { area: "Batch and shelf life", workspace: "CBC/IMG Batch Management", transactions: "MSC1N, BMBC, SLED settings", decisions: ["Batch level", "Classification", "Shelf-life rules"], validation: "Trace ingredient and finished-product batches end to end." },
    ],
    specialistTransactions: [
      specialist("Brew and release a packaged batch", "PP-PI / QM", "Production controller", "COR1 -> MIGO -> COR6N -> QA32/QA11", "A released seasonal production plan requires a traceable finished batch.", ["Master recipe", "Ingredient batches", "Production version", "Inspection plan"], ["Create and release the process order.", "Stage and issue batch-managed ingredients.", "Confirm phases, yield, loss, and activities.", "Receive the packaged batch into quality inspection.", "Record results and make the usage decision."], ["Completed process order", "Released finished batch", "Genealogy and actual cost"], "Credits component inventory and activity centres; debits the process order, then receives finished inventory.", ["Recipe and production version are approved.", "Only an accepted usage decision releases stock."]),
      specialist("Reconcile returnable keg assets", "SD / MM / FI", "Packaging accountant", "VA01/VL01N -> MMBE -> reconciliation apps", "Customer keg balances differ from physical returnable packaging.", ["Customer consignment balance", "Keg material", "Delivery and return documents"], ["Review customer special stock.", "Trace issues and returns by customer.", "Post authorised quantity corrections.", "Value losses and recoverable deposits.", "Reconcile the packaging control account."], ["Reconciled keg quantity", "Approved loss posting", "Customer balance evidence"], "Records packaging loss or deposit liability adjustments where evidence supports them.", ["No unexplained inventory plug.", "Customer and physical balances agree."]),
      specialist("Calculate alcohol duty and margin", "FI / CO / SD", "Financial controller", "Excise report -> journal entry -> Margin Analysis", "The monthly close requires duty by product strength and released volume.", ["Released volume", "Alcohol strength", "Duty rate", "Sales deductions"], ["Extract released and dispatched volume.", "Calculate duty using the approved rate.", "Reconcile to sales and inventory movements.", "Post the duty accrual.", "Review product and customer contribution."], ["Duty reconciliation", "Posted accrual", "Reconciled contribution margin"], "Debits duty expense or sales deduction and credits the excise liability.", ["Rate and effective date are approved.", "Duty volume reconciles to material documents."]),
    ],
  },
  pharmaceutical: {
    code: "PHA",
    baseMonthlyRevenue: 4_850_000,
    baseMonthlyVolume: 185_000,
    volumeUnit: "packs",
    growth: [1, 1.14, 1.31],
    seasonality: [1.08, 1.06, 1.02, 0.98, 0.94, 0.92, 0.91, 0.94, 1.01, 1.08, 1.12, 1.16],
    ratios: { direct: 0.24, labour: 0.13, overhead: 0.13, logistics: 0.05, opex: 0.22, depreciation: 0.05, inventory: 0.31, receivables: 0.19, payables: 0.11 },
    costObject: "Regulated process order, batch, and market pack",
    costingMethod: "Standard cost plus batch, quality, and compliance variance",
    settlementReceiver: "Released product inventory, variance accounts, and market segment",
    profitabilityDimensions: ["Molecule", "Strength", "Pack", "Market", "Batch"],
    costComponents: [
      { name: "Active ingredient", share: 34, driver: "Potency-adjusted batch quantity" },
      { name: "Excipients and packaging", share: 18, driver: "Recipe and serialization pack" },
      { name: "Manufacturing", share: 19, driver: "Validated resource activity" },
      { name: "Quality and validation", share: 18, driver: "Sampling, testing, and release effort" },
      { name: "Cold chain and compliance", share: 11, driver: "Lane, temperature, and market rules" },
    ],
    specialistConfiguration: [
      { area: "GxP batch release", workspace: "CBC/IMG Quality Management", transactions: "QCC0, QA32, QA11", decisions: ["Inspection types", "Digital signatures", "Usage-decision controls"], validation: "A test batch cannot move to unrestricted stock before authorised release." },
      { area: "Serialization", workspace: "SAP ATTP / Advanced Track and Trace", transactions: "ATTP repository and packaging apps", decisions: ["Identifier ranges", "Aggregation", "Market reporting"], validation: "Serialized packs aggregate and report without duplicate identifiers." },
      { area: "Cold chain", workspace: "Batch, EWM, and TM configuration", transactions: "MSC1N, /SCWM/MON, freight apps", decisions: ["Temperature profile", "Lane qualification", "Excursion status"], validation: "An excursion blocks delivery and opens a quality case." },
    ],
    specialistTransactions: [
      specialist("Manufacture and release a regulated batch", "PP-PI / QM", "Qualified production lead", "COR1 -> COR6N -> QA32 -> QA11", "A validated campaign requires manufacture, inspection, review, and release.", ["Approved recipe", "Qualified equipment", "Released raw batches", "Specification"], ["Create and release the process order.", "Verify status and electronic-signature requirements.", "Issue components and confirm phases with yield.", "Record inspection results and deviations.", "Complete authorised batch usage decision."], ["Complete batch record", "Released or rejected batch", "Traceable quality decision"], "Collects actual manufacturing and quality cost on the batch order before settlement.", ["Segregation of production and release roles.", "No shipment before quality release."]),
      specialist("Serialize and commission market packs", "ATTP / EWM", "Serialization specialist", "ATTP packaging and repository apps", "Released product must be serialized for a regulated market.", ["Market order", "GTIN", "Serial-number range", "Packaging hierarchy"], ["Request and receive serial numbers.", "Commission unit packs.", "Aggregate packs to cases and pallets.", "Reconcile commissioned, rejected, and unused numbers.", "Report the event to the target market."], ["Commissioned serials", "Valid aggregation", "Accepted market report"], "No direct FI entry; rejected packaging and rework feed manufacturing variance.", ["Every serial is unique.", "Repository and physical hierarchy agree."]),
      specialist("Investigate a temperature excursion", "TM / QM / EWM", "Quality supply lead", "Freight monitoring -> quality notification -> batch status", "A cold-chain sensor reports temperature outside the approved range.", ["Sensor event", "Shipment", "Batch list", "Stability rule"], ["Stop delivery and identify affected handling units.", "Create the quality notification.", "Move batches to blocked status.", "Assess duration and stability evidence.", "Release, rework, return, or destroy with approval."], ["Contained stock", "Documented assessment", "Approved disposition"], "Creates provision, destruction, or carrier-claim postings when disposition is approved.", ["Patient safety overrides service priority.", "Disposition requires qualified approval."]),
    ],
  },
  paint: {
    code: "PNT",
    baseMonthlyRevenue: 2_260_000,
    baseMonthlyVolume: 1_420_000,
    volumeUnit: "litres",
    growth: [1, 1.09, 1.2],
    seasonality: [0.78, 0.83, 0.96, 1.13, 1.22, 1.27, 1.25, 1.16, 1.04, 0.94, 0.82, 0.76],
    ratios: { direct: 0.39, labour: 0.09, overhead: 0.1, logistics: 0.08, opex: 0.15, depreciation: 0.04, inventory: 0.27, receivables: 0.18, payables: 0.15 },
    costObject: "Formula batch, shade variant, and packaged material",
    costingMethod: "Formula standard cost with pigment, solvent, yield, and rework variance",
    settlementReceiver: "Finished coatings, variance accounts, and dealer/channel margin",
    profitabilityDimensions: ["Product family", "Shade", "Pack size", "Dealer", "Region"],
    costComponents: [
      { name: "Resins and solvents", share: 33, driver: "Formula quantity and commodity price" },
      { name: "Pigments", share: 24, driver: "Shade formula and colour strength" },
      { name: "Packaging", share: 13, driver: "Pack size and line loss" },
      { name: "Conversion", share: 18, driver: "Mixing, milling, tinting, and filling activity" },
      { name: "EHS, quality, and freight", share: 12, driver: "Hazard class, test plan, and lane" },
    ],
    specialistConfiguration: [
      { area: "Formula and shade control", workspace: "PP-PI recipes and classification", transactions: "C201/C202, CL20N, CU50 where used", decisions: ["Formula version", "Shade class", "Substitution rules"], validation: "A test shade selects the approved formula and cost components." },
      { area: "Dangerous goods", workspace: "SAP EHS Product Safety", transactions: "EHS specification and dangerous-goods checks", decisions: ["Hazard classification", "SDS", "Packaging and route restrictions"], validation: "A restricted delivery is blocked until compliant data is complete." },
    ],
    specialistTransactions: [
      specialist("Produce and adjust a formula batch", "PP-PI / QM", "Batch technologist", "COR1 -> COR6N -> QE51N -> QA11", "A production batch requires controlled shade adjustment before filling.", ["Master recipe", "Target shade", "Raw-material batches", "Quality specification"], ["Create the process order from the approved formula.", "Issue batch-managed ingredients.", "Confirm mixing and record the initial sample.", "Post an approved pigment adjustment.", "Re-test, accept, fill, and receive output."], ["Adjusted formula batch", "Accepted shade result", "Actual material/yield variance"], "Additional pigment and activity debit the order and create usage variance before settlement.", ["Adjustment requires laboratory approval.", "Full batch genealogy is retained."]),
      specialist("Release a dangerous-goods delivery", "EHS / SD / TM", "Dangerous-goods specialist", "VA01 -> dangerous-goods check -> VL01N/TM", "A dealer order contains solvent-based coatings on a restricted route.", ["Customer order", "EHS specification", "Packaging instruction", "Carrier qualification"], ["Run the order dangerous-goods check.", "Correct missing classification or SDS data.", "Select compliant package and transport mode.", "Generate required transport documents.", "Release and monitor the delivery."], ["Compliant delivery", "Dangerous-goods documents", "Qualified carrier assignment"], "Recognizes freight and compliance service cost; normal goods issue and billing follow delivery.", ["Never override a legal block without authorised correction.", "Document version matches the shipped product."]),
      specialist("Settle rework and scrap variance", "CO / PP-PI", "Plant controller", "KKS2 -> KO88/CO88", "Month-end requires separation of recovered rework and unrecoverable scrap.", ["Batch order balances", "Rework order", "Scrap quantity", "Settlement rule"], ["Reconcile actual quantities and confirmations.", "Calculate WIP and variance.", "Classify pigment, yield, rework, and scrap causes.", "Execute test settlement and resolve errors.", "Post settlement and explain margin impact."], ["Zero/expected order balance", "Classified variance", "Reconciled FI/CO posting"], "Settles inventory-relevant variance and period loss to the approved receivers.", ["Scrap quantity agrees with material documents.", "Rework is not hidden in normal yield."]),
    ],
  },
  fmcg: {
    code: "FMC",
    baseMonthlyRevenue: 3_180_000,
    baseMonthlyVolume: 2_850_000,
    volumeUnit: "cases",
    growth: [1, 1.12, 1.27],
    seasonality: [0.9, 0.93, 1, 1.04, 1.08, 1.12, 1.1, 1.03, 1.02, 1.08, 1.2, 1.28],
    ratios: { direct: 0.36, labour: 0.1, overhead: 0.09, logistics: 0.09, opex: 0.16, depreciation: 0.035, inventory: 0.2, receivables: 0.15, payables: 0.14 },
    costObject: "Production campaign, SKU, promotion, and customer/channel",
    costingMethod: "Standard SKU cost plus campaign, waste, promotion, and trade-spend variance",
    settlementReceiver: "Finished goods, variance accounts, and account/channel profitability",
    profitabilityDimensions: ["SKU", "Brand", "Promotion", "Retailer", "Channel"],
    costComponents: [
      { name: "Ingredients", share: 25, driver: "BOM, commodity price, and yield" },
      { name: "Packaging", share: 24, driver: "Pack format and line loss" },
      { name: "Conversion", share: 18, driver: "Campaign hours and line efficiency" },
      { name: "Trade and promotion", share: 19, driver: "Condition contract and claims" },
      { name: "Warehousing and freight", share: 14, driver: "Case, pallet, route, and service" },
    ],
    specialistConfiguration: [
      { area: "Shelf-life and FEFO", workspace: "Batch management and EWM", transactions: "MSC1N, /SCWM/MON, shelf-life settings", decisions: ["Minimum remaining life", "FEFO", "Batch determination"], validation: "Allocation selects only eligible shelf-life batches." },
      { area: "Trade promotion", workspace: "Settlement Management / condition contracts", transactions: "WCOCO, WB2R_SC", decisions: ["Accrual condition", "Eligible sales", "Claim settlement"], validation: "A test promotion accrues and settles to the correct customer and SKU." },
    ],
    specialistTransactions: [
      specialist("Plan and execute a promotion campaign", "IBP / PP / SD", "Demand and supply planner", "IBP planning -> MD01N -> CO01 -> VA01", "A national retailer promotion creates a temporary demand uplift.", ["Promotion forecast", "SKU/location split", "Capacity", "Material availability"], ["Load the promotion uplift by week and customer.", "Run constrained supply planning.", "Convert feasible supply to production orders.", "Allocate stock to priority customer orders.", "Monitor service, waste, and residual stock."], ["Feasible campaign plan", "Linked supply orders", "Controlled allocation"], "Production and logistics cost collect on orders; promotional deductions accrue against eligible revenue.", ["Baseline and uplift remain separately visible.", "Allocation follows approved customer priority."]),
      specialist("Run FEFO warehouse allocation", "EWM / SD", "Warehouse planner", "/SCWM/MON -> wave -> warehouse tasks", "Retail orders require stock with sufficient remaining shelf life.", ["Outbound deliveries", "Batch shelf life", "Customer minimum life", "Warehouse stock"], ["Create the outbound wave.", "Execute batch determination using FEFO.", "Review shelf-life exceptions.", "Confirm picking and packing.", "Post goods issue and retain batch traceability."], ["Compliant batch allocation", "Completed warehouse tasks", "Traceable dispatch"], "Goods issue credits inventory and debits COGS for the selected batches.", ["Expired or short-life stock is blocked.", "Override requires approved disposition."]),
      specialist("Accrue and settle trade promotion", "Settlement Management / FI", "Trade investment accountant", "WCOCO -> WB2R_SC -> FI reconciliation", "The promotion period closes with retailer claims and earned discounts.", ["Condition contract", "Eligible billing", "Claim", "Accrual balance"], ["Validate contract validity and eligible business volume.", "Calculate the earned rebate.", "Reconcile automatic accruals.", "Settle the approved amount.", "Analyse net revenue and promotion ROI."], ["Settled claim", "Cleared accrual", "Net-revenue and ROI report"], "Debits sales deductions and clears the promotion accrual or customer payable.", ["No settlement outside contract dates.", "Claim quantity agrees with billing data."]),
    ],
  },
  automotive: {
    code: "AUT",
    baseMonthlyRevenue: 5_600_000,
    baseMonthlyVolume: 265,
    volumeUnit: "vehicles",
    growth: [1, 1.08, 1.17],
    seasonality: [0.84, 0.9, 1.04, 1.14, 1.08, 1, 0.92, 0.88, 1.12, 1.18, 1.04, 0.86],
    ratios: { direct: 0.69, labour: 0.07, overhead: 0.05, logistics: 0.025, opex: 0.11, depreciation: 0.018, inventory: 0.38, receivables: 0.11, payables: 0.3 },
    costObject: "VIN, workshop order, warranty case, and dealership profit centre",
    costingMethod: "VIN actual acquisition cost plus workshop and warranty order costing",
    settlementReceiver: "Vehicle inventory/COGS, warranty recovery, and dealership margin",
    profitabilityDimensions: ["VIN/model", "New/used", "Dealership", "Salesperson", "Customer"],
    costComponents: [
      { name: "Vehicle acquisition", share: 72, driver: "VIN purchase and landed cost" },
      { name: "Preparation and accessories", share: 8, driver: "Workshop operation and parts" },
      { name: "Sales and finance support", share: 7, driver: "Deal and commission" },
      { name: "Warranty and service", share: 7, driver: "Labour, part, and recovery rate" },
      { name: "Inventory holding", share: 6, driver: "VIN age and financing days" },
    ],
    specialistConfiguration: [
      { area: "Vehicle and VIN", workspace: "Vehicle Management / material serialisation", transactions: "Vehicle master, IQ01/IQ02, MM/SD settings", decisions: ["VIN uniqueness", "Model hierarchy", "Stock status"], validation: "A VIN is procured, located, sold, and reported without duplication." },
      { area: "Workshop service", workspace: "Service and Plant Maintenance", transactions: "IW31/IW32 or service-order apps", decisions: ["Order type", "Labour rate", "Parts issue", "Billing profile"], validation: "A workshop order captures labour, parts, warranty, and billing." },
    ],
    specialistTransactions: [
      specialist("Procure and receive a VIN-controlled vehicle", "MM / Vehicle Management", "Vehicle inventory controller", "ME21N -> MIGO -> vehicle master", "An approved model allocation is due from the manufacturer.", ["Manufacturer allocation", "VIN", "Model/colour", "Landed cost"], ["Create the purchase order with vehicle attributes.", "Receive the unique VIN into dealership stock.", "Post freight and preparation landed cost.", "Complete vehicle status and location.", "Reconcile VIN inventory to the GR/IR account."], ["Unique VIN stock", "Complete landed cost", "Reconciled supplier receipt"], "Debits VIN inventory and input tax; credits GR/IR and landed-cost liabilities.", ["A VIN cannot be received twice.", "Status and physical location agree."]),
      specialist("Sell and deliver a vehicle", "SD / FI", "Vehicle sales administrator", "VA01 -> delivery -> VF01 -> F-28", "A credit-approved customer accepts a specific VIN offer.", ["Customer", "VIN", "Price", "Finance/trade-in terms"], ["Create the order and assign the VIN.", "Validate price, tax, credit, and ownership documents.", "Complete preparation and delivery checklist.", "Post goods issue and invoice.", "Clear receipt and calculate deal margin."], ["Delivered VIN", "Customer invoice", "Cleared receipt", "Deal margin"], "Goods issue moves VIN cost to COGS; billing posts receivable, revenue, and tax.", ["VIN on invoice equals delivered VIN.", "Discount approval is retained."]),
      specialist("Complete a warranty workshop order", "Service / PM / CO", "Workshop controller", "Service order/IW31 -> parts issue -> confirmation -> settlement", "A customer reports an eligible defect during the warranty period.", ["VIN history", "Warranty entitlement", "Fault code", "Labour and parts plan"], ["Create the workshop order and verify warranty.", "Reserve and issue approved parts.", "Confirm labour and technical findings.", "Submit the manufacturer warranty claim.", "Settle cost and reconcile recovery."], ["Technically complete repair", "Warranty claim", "Settled order and recovery"], "Collects parts and labour on the order, then settles to warranty expense or manufacturer receivable.", ["Entitlement is verified before work.", "Claim matches confirmed labour and issued parts."]),
    ],
  },
  retail: {
    code: "RTL",
    baseMonthlyRevenue: 7_250_000,
    baseMonthlyVolume: 485_000,
    volumeUnit: "baskets",
    growth: [1, 1.1, 1.23],
    seasonality: [0.88, 0.9, 0.96, 0.98, 1.01, 1.03, 1.04, 1.02, 1, 1.06, 1.18, 1.42],
    ratios: { direct: 0.58, labour: 0.09, overhead: 0.06, logistics: 0.045, opex: 0.14, depreciation: 0.025, inventory: 0.16, receivables: 0.035, payables: 0.19 },
    costObject: "Article/site, merchandise category, promotion, and channel",
    costingMethod: "Moving/standard merchandise cost with retail valuation and markdown",
    settlementReceiver: "Merchandise inventory/COGS and store/channel profitability",
    profitabilityDimensions: ["Article", "Category", "Store", "Channel", "Promotion"],
    costComponents: [
      { name: "Merchandise", share: 65, driver: "Purchase price, landed cost, and shrink" },
      { name: "Store labour", share: 11, driver: "Opening hours and basket volume" },
      { name: "Distribution", share: 9, driver: "Case, route, and store delivery" },
      { name: "Occupancy", share: 8, driver: "Store area and lease" },
      { name: "Markdown and promotion", share: 7, driver: "Article age and campaign" },
    ],
    specialistConfiguration: [
      { area: "Article and site", workspace: "SAP Retail merchandising", transactions: "MM41/MM42, WB01, listing", decisions: ["Article hierarchy", "Site assortment", "Listing and valuation"], validation: "A listed article can replenish, sell, return, and report by site." },
      { area: "POS integration", workspace: "SAP Customer Activity Repository / POS inbound", transactions: "POS workbench and inbound monitoring", decisions: ["Transaction mapping", "Tender", "Tax", "Error handling"], validation: "A test till file posts sales, tender, tax, and inventory exactly once." },
    ],
    specialistTransactions: [
      specialist("List and replenish an article across stores", "Retail / MM", "Merchandise planner", "MM41/MM42 -> listing -> replenishment", "A new seasonal article must be ranged to selected stores.", ["Article hierarchy", "Vendor source", "Store assortment", "Replenishment parameters"], ["Create or extend the generic/article master.", "List the article to eligible sites.", "Maintain source, price, and replenishment data.", "Run replenishment and review exceptions.", "Create and monitor distribution-centre/store supply."], ["Listed article", "Store supply proposals", "Valid purchase/transfer documents"], "Receipts debit merchandise inventory; store transfers preserve company value unless valuation areas differ.", ["No supply to an unlisted site.", "Pack size and ordering unit are consistent."]),
      specialist("Post and reconcile POS sales", "CAR / SD / FI", "Retail finance analyst", "POS inbound -> sales audit -> FI posting", "Daily store and online transactions are ready for sales audit.", ["POS transaction file", "Tender totals", "Tax codes", "Article/site data"], ["Receive and validate POS transactions.", "Resolve duplicate, article, tender, and tax errors.", "Aggregate and post sales and inventory movement.", "Reconcile cash/card tender to acquirer and bank.", "Publish store and channel margin."], ["Complete sales audit", "Inventory decrement", "Reconciled tender and revenue"], "Credits sales and output tax, debits tender receivables/cash; credits inventory and debits COGS.", ["Every transaction posts once.", "Tender, revenue, tax, and inventory reconcile."]),
      specialist("Execute markdown and stock reallocation", "Retail / Analytics", "Category manager", "Markdown planning -> stock transfer -> price activation", "Slow-moving seasonal stock requires controlled clearance.", ["Article/site age", "Sell-through", "Margin floor", "Demand by location"], ["Identify excess and shortage by site.", "Approve transfer versus markdown strategy.", "Create stock transfers for recoverable demand.", "Activate dated markdown prices.", "Measure sell-through, margin, and residual provision."], ["Rebalanced stock", "Approved markdown", "Measured margin recovery"], "Markdown reduces revenue per unit; residual obsolete stock may require an inventory provision.", ["Price changes are effective-dated and approved.", "Provision is not duplicated with markdown loss."]),
    ],
  },
  logistics: {
    code: "LOG",
    baseMonthlyRevenue: 2_940_000,
    baseMonthlyVolume: 38_500,
    volumeUnit: "shipments",
    growth: [1, 1.13, 1.29],
    seasonality: [0.92, 0.94, 0.98, 1, 1.03, 1.05, 1.02, 0.99, 1.04, 1.08, 1.15, 1.24],
    ratios: { direct: 0.28, labour: 0.19, overhead: 0.1, logistics: 0.2, opex: 0.11, depreciation: 0.045, inventory: 0.04, receivables: 0.22, payables: 0.16 },
    costObject: "Freight order, route, warehouse contract, and customer shipment",
    costingMethod: "Shipment and route actual cost with carrier settlement and activity allocation",
    settlementReceiver: "Customer shipment, service order, claims, and route profitability",
    profitabilityDimensions: ["Customer", "Lane", "Service level", "Warehouse", "Carrier"],
    costComponents: [
      { name: "Carrier and fuel", share: 38, driver: "Distance, weight, mode, and fuel index" },
      { name: "Warehouse labour", share: 23, driver: "Handling unit and activity" },
      { name: "Fleet and equipment", share: 16, driver: "Vehicle hour and utilization" },
      { name: "Facilities and systems", share: 13, driver: "Space, contract, and transaction" },
      { name: "Claims and compliance", share: 10, driver: "Service failure and risk class" },
    ],
    specialistConfiguration: [
      { area: "Transportation planning", workspace: "SAP TM configuration", transactions: "Freight unit/order and planning profile apps", decisions: ["Planning profile", "Lane", "Carrier", "Charge calculation"], validation: "A sales/warehouse demand creates, plans, tenders, and settles a freight order." },
      { area: "Warehouse billing", workspace: "EWM and service billing", transactions: "/SCWM/MON, condition contract/billing apps", decisions: ["Billable activity", "Rate card", "Customer contract"], validation: "Warehouse activities produce accurate customer billing quantities." },
    ],
    specialistTransactions: [
      specialist("Plan, tender, and execute a freight order", "TM", "Transport planner", "Freight unit -> planning cockpit -> tender -> execution", "Confirmed demand requires a capacity-feasible carrier movement.", ["Freight units", "Lane", "Capacity", "Carrier rates"], ["Build freight units from delivery demand.", "Plan route, mode, vehicle, and schedule.", "Tender to an eligible carrier.", "Record pickup, milestones, and proof of delivery.", "Calculate charges and close execution."], ["Executed freight order", "Proof of delivery", "Calculated carrier charge"], "Accrues carrier cost to the shipment/lane and supports customer freight revenue.", ["Carrier is qualified for the load.", "Milestones and charge basis are evidenced."]),
      specialist("Settle carrier freight cost", "TM / FI", "Freight settlement accountant", "Freight settlement document -> supplier invoice", "Completed freight orders are ready for carrier settlement.", ["Freight order", "Charge calculation", "Proof of delivery", "Carrier agreement"], ["Validate execution completion.", "Calculate planned versus actual charges.", "Create the freight settlement document.", "Post and match the supplier invoice.", "Analyse lane and carrier variance."], ["Settled carrier liability", "Cleared freight accrual", "Lane variance report"], "Debits freight/service cost and clears the carrier accrual against the supplier payable.", ["No settlement before proof of delivery.", "Duplicate carrier invoice check passes."]),
      specialist("Process a customer logistics claim", "TM / Claims / FI", "Claims manager", "Quality/claim case -> credit memo -> carrier recovery", "A shipment is late or damaged and the customer submits a claim.", ["Shipment evidence", "Proof of condition", "Customer contract", "Carrier liability"], ["Open and classify the claim.", "Link freight, warehouse, delivery, and sensor evidence.", "Approve customer remedy within authority.", "Create credit or compensation document.", "Record and pursue carrier recovery."], ["Resolved customer claim", "Financial remedy", "Carrier recovery receivable"], "Posts claim expense or sales credit and any evidenced recovery receivable.", ["Customer remedy and carrier recovery remain separately traceable.", "Approval limit is enforced."]),
    ],
  },
  services: {
    code: "SRV",
    baseMonthlyRevenue: 1_980_000,
    baseMonthlyVolume: 12_400,
    volumeUnit: "billable hours",
    growth: [1, 1.16, 1.35],
    seasonality: [0.94, 1, 1.06, 1.03, 1.02, 1, 0.9, 0.86, 1.04, 1.1, 1.08, 0.97],
    ratios: { direct: 0.08, labour: 0.39, overhead: 0.09, logistics: 0.015, opex: 0.19, depreciation: 0.02, inventory: 0.01, receivables: 0.27, payables: 0.08 },
    costObject: "Project/WBS, engagement, consultant, and billing milestone",
    costingMethod: "Project actual cost and revenue recognition by time, expense, and milestone",
    settlementReceiver: "WIP, contract asset/liability, revenue, and engagement margin",
    profitabilityDimensions: ["Client", "Engagement", "Service line", "Consultant grade", "Region"],
    costComponents: [
      { name: "Consultant labour", share: 58, driver: "Grade, productive hour, and cost rate" },
      { name: "Subcontractors", share: 14, driver: "Statement of work and accepted output" },
      { name: "Travel and expense", share: 7, driver: "Policy-approved engagement expense" },
      { name: "Delivery overhead", share: 13, driver: "Project allocation and utilization" },
      { name: "Sales and bench", share: 8, driver: "Unbilled capacity and pursuit effort" },
    ],
    specialistConfiguration: [
      { area: "Project and WBS", workspace: "SAP Project System / Professional Services", transactions: "CJ20N or Manage Customer Projects", decisions: ["Project profile", "WBS", "Billing", "Settlement"], validation: "A test project accepts staffing, time, expense, cost, and billing." },
      { area: "Revenue recognition", workspace: "Event-Based Revenue Recognition", transactions: "Manage Revenue Recognition", decisions: ["Method", "POC source", "Contract asset/liability"], validation: "Recognized revenue reconciles to delivery progress and the GL." },
    ],
    specialistTransactions: [
      specialist("Create and baseline a client project", "PS / SD / CO", "Engagement manager", "Manage Customer Projects / CJ20N", "A signed statement of work authorises a new engagement.", ["Contract", "Deliverables", "Rate card", "Resource and cost plan"], ["Create project and WBS structure.", "Assign company, profit centre, and responsible manager.", "Plan resources, cost, revenue, and milestones.", "Create billing and settlement rules.", "Release the approved baseline."], ["Released project", "Approved plan", "Valid billing and settlement rules"], "No initial posting; the baseline controls later WIP, revenue, billing, and margin.", ["Contract value equals approved project value.", "Plan changes are versioned."]),
      specialist("Record time, expense, and delivery", "CATS / Concur / PS", "Consultant", "Manage My Timesheet / CATS -> expense -> project confirmation", "The team completed approved work during the period.", ["Project assignment", "Approved hours", "Expense receipts", "Deliverable status"], ["Enter time by project/WBS and activity.", "Submit expenses with policy evidence.", "Approve time and expense.", "Post labour and expense to the project.", "Update milestone and estimate to complete."], ["Posted actual hours/cost", "Approved expenses", "Updated delivery forecast"], "Debits project cost/WIP and credits labour activity allocation, employee/vendor liabilities, or clearing.", ["No time outside assignment dates.", "Approval precedes billing and recognition."]),
      specialist("Recognize revenue and bill a milestone", "SD / FI / CO", "Project accountant", "Revenue Recognition -> billing due list -> VF01", "An accepted milestone and period progress support revenue and billing.", ["Accepted milestone", "Actual cost/time", "Contract terms", "Prior recognition"], ["Run revenue-recognition calculation.", "Review progress, forecast, and loss provision.", "Post contract asset/liability and revenue.", "Create the milestone invoice.", "Reconcile billing, recognition, WIP, and margin."], ["Recognized revenue", "Customer invoice", "Reconciled project margin"], "Posts revenue against contract asset/liability and creates customer receivable on billing.", ["Recognition follows the approved method.", "Billing and revenue are reconciled, not assumed equal."]),
    ],
  },
  hospital: {
    code: "HSP",
    baseMonthlyRevenue: 8_400_000,
    baseMonthlyVolume: 7_800,
    volumeUnit: "patient episodes",
    growth: [1, 1.07, 1.15],
    seasonality: [1.18, 1.16, 1.1, 1.02, 0.96, 0.92, 0.88, 0.9, 0.98, 1.04, 1.1, 1.15],
    ratios: { direct: 0.17, labour: 0.41, overhead: 0.11, logistics: 0.025, opex: 0.16, depreciation: 0.055, inventory: 0.06, receivables: 0.2, payables: 0.09 },
    costObject: "Patient episode, clinical department, procedure, and funded service",
    costingMethod: "Patient/service-line actual cost with activity and consumed-material allocation",
    settlementReceiver: "Patient episode, payer contract, clinical service line, and statutory reporting",
    profitabilityDimensions: ["Patient pathway", "Procedure", "Payer", "Department", "Consultant"],
    costComponents: [
      { name: "Clinical workforce", share: 48, driver: "Care time, grade, and roster" },
      { name: "Medicines and devices", share: 21, driver: "Patient-level consumption and batch" },
      { name: "Theatre and diagnostics", share: 13, driver: "Procedure and equipment time" },
      { name: "Facilities", share: 11, driver: "Bed day and occupied space" },
      { name: "Support and compliance", share: 7, driver: "Episode and regulated activity" },
    ],
    specialistConfiguration: [
      { area: "Patient episode and payer", workspace: "SAP Patient Management / service billing", transactions: "Patient/episode and billing apps", decisions: ["Episode type", "Payer contract", "Charge rule"], validation: "A test episode records treatment, consumption, cost, and payer billing." },
      { area: "Clinical inventory", workspace: "MM/EWM batch and serial management", transactions: "MIGO, MSC1N, serial/device apps", decisions: ["Ward stock", "Batch/serial trace", "Recall status"], validation: "A medicine or implant traces from receipt to patient episode." },
      { area: "Medical equipment", workspace: "Plant Maintenance / Asset Management", transactions: "IE01, IP01, IW31", decisions: ["Equipment hierarchy", "Calibration", "Maintenance strategy"], validation: "Overdue safety maintenance prevents unsafe equipment release." },
    ],
    specialistTransactions: [
      specialist("Consume a batch-managed medicine to a patient", "MM / Clinical", "Clinical materials specialist", "Reservation/ward issue -> patient consumption", "An authorised medication is administered during a patient episode.", ["Patient episode", "Medication order", "Batch", "Dose and ward stock"], ["Verify patient, medication, dose, and authorisation.", "Select an eligible batch using FEFO.", "Post issue/consumption to the episode.", "Record administration and any return/waste.", "Reconcile patient, ward, and pharmacy stock."], ["Traceable patient consumption", "Updated clinical stock", "Episode material cost"], "Credits clinical inventory and debits the patient episode or clinical cost object.", ["Five-rights clinical check is completed.", "Batch remains recall-traceable."]),
      specialist("Procure and record a patient implant", "MM / Serial / Clinical", "Theatre materials coordinator", "ME21N -> MIGO -> serial issue to episode", "A scheduled procedure requires a patient-specific implant.", ["Procedure schedule", "Approved implant", "Supplier/consignment terms", "Serial number"], ["Reserve or order the implant.", "Receive and inspect serial/batch details.", "Stage to the correct theatre and patient.", "Record implantation or return.", "Reconcile supplier liability and patient cost."], ["Implant traceability", "Accurate consumption", "Matched supplier and episode cost"], "Debits patient/episode cost and credits owned or consignment inventory/payable according to terms.", ["Serial number matches the clinical record.", "Unused implant is returned to controlled stock."]),
      specialist("Maintain and release critical equipment", "PM / EAM", "Clinical engineering lead", "IW21 -> IW31 -> calibration -> TECO", "Critical equipment reaches planned maintenance or calibration due date.", ["Equipment master", "Maintenance plan", "Safety procedure", "Test standard"], ["Create notification/order from due maintenance.", "Block equipment from clinical use.", "Issue parts and confirm engineering work.", "Record calibration and safety results.", "Release equipment and technically complete the order."], ["Safe released equipment", "Calibration certificate", "Settled maintenance order"], "Collects parts, labour, and service cost on the maintenance order before settlement.", ["Clinical use remains blocked until acceptance.", "Certificate and measurement results are retained."]),
    ],
  },
  "oil-gas": {
    code: "OAG",
    baseMonthlyRevenue: 12_600_000,
    baseMonthlyVolume: 185_000,
    volumeUnit: "BOE",
    growth: [1, 1.09, 1.19],
    seasonality: [1.04, 1.03, 1.02, 1, 0.98, 0.97, 0.96, 0.97, 0.99, 1.01, 1.03, 1.05],
    ratios: { direct: 0.13, labour: 0.09, overhead: 0.11, logistics: 0.07, opex: 0.18, depreciation: 0.22, inventory: 0.08, receivables: 0.16, payables: 0.1 },
    costObject: "Well/field, joint venture, maintenance order, project/WBS, and product",
    costingMethod: "Field and well actual cost with joint-venture allocation and depletion",
    settlementReceiver: "Asset under construction, producing asset, joint venture partners, and field margin",
    profitabilityDimensions: ["Field", "Well", "Product", "Venture", "Lifting point"],
    costComponents: [
      { name: "Production operations", share: 22, driver: "BOE, well, and facility activity" },
      { name: "Maintenance and integrity", share: 21, driver: "Equipment, work order, and risk" },
      { name: "Transport and processing", share: 18, driver: "Volume, distance, and tariff" },
      { name: "Depletion and depreciation", share: 27, driver: "Reserve and asset base" },
      { name: "HSE and joint operations", share: 12, driver: "Permit, venture, and regulated activity" },
    ],
    specialistConfiguration: [
      { area: "Technical assets and integrity", workspace: "SAP EAM / Asset Performance Management", transactions: "IL01, IE01, IP01, IW31", decisions: ["Functional location", "Equipment", "Criticality", "Maintenance strategy"], validation: "A critical asset plans, executes, costs, and closes integrity work." },
      { area: "Joint venture accounting", workspace: "SAP Joint Venture Accounting", transactions: "JVA venture/equity and cutback apps", decisions: ["Venture", "Equity group", "Recovery indicator", "Cutback"], validation: "A test cost is allocated to partners using effective equity." },
      { area: "Production allocation", workspace: "Upstream production management", transactions: "Measurement and allocation apps", decisions: ["Measurement point", "Allocation network", "Loss", "Ownership"], validation: "Metered volume allocates to wells, fields, products, and partners." },
    ],
    specialistTransactions: [
      specialist("Execute an integrity maintenance shutdown", "EAM / PS / CO", "Maintenance shutdown manager", "IW31 -> network/order execution -> TECO/settlement", "Inspection identifies work that requires a controlled facility shutdown.", ["Asset hierarchy", "Approved scope", "Permit plan", "Materials and services"], ["Create and schedule integrated work orders.", "Plan isolation, permits, labour, parts, and contractors.", "Issue materials and confirm execution.", "Record inspection results and defects.", "Return to service, TECO, and settle costs."], ["Safe returned asset", "Complete work history", "Settled shutdown cost"], "Collects labour, material, and service cost on orders/WBS and settles to expense or asset.", ["Permit and isolation precede execution.", "Safety-critical findings are formally accepted."]),
      specialist("Allocate production and ownership", "Production / JVA", "Production accountant", "Measurement -> allocation -> ownership reporting", "Monthly measured volumes require allocation across wells and partners.", ["Meter readings", "Well tests", "Loss rules", "Partner equity"], ["Validate measurement completeness.", "Run allocation from facility to well/product.", "Reconcile gain, loss, and inventory movement.", "Apply ownership and entitlement.", "Approve production and partner statements."], ["Balanced allocation", "Owned volume", "Approved production statement"], "Creates inventory, revenue entitlement, and partner accounting inputs after approval.", ["Input/output and loss balance.", "Effective-dated equity is used."]),
      specialist("Run joint-venture cutback and billing", "JVA / FI", "Joint venture accountant", "JVA cutback -> partner billing -> reconciliation", "Approved operated venture cost must be shared with partners.", ["Venture cost", "Recovery indicator", "Equity group", "Partner master"], ["Validate venture-coded postings.", "Run cutback simulation.", "Review non-operated and non-recoverable items.", "Execute partner allocation and billing.", "Reconcile operator and partner ledgers."], ["Allocated venture cost", "Partner receivable/payable", "Reconciled equity share"], "Reclassifies gross cost to operator and partner shares and creates partner receivables/payables.", ["Equity effective date is correct.", "Non-recoverable cost remains with the operator."]),
    ],
  },
};

const months = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

function round(value: number) {
  return Math.round(value);
}

function generateMonthlyRecords(
  industryId: IndustryId,
  profile: PracticeProfile,
): IndustryMonthlyPracticeRecord[] {
  const blueprint = industryBlueprintById(industryId);
  let rollingCash = profile.baseMonthlyRevenue * 0.42;
  return ([1, 2, 3] as PracticeYear[]).flatMap((year) =>
    months.map((period, monthIndex) => {
      const season = profile.seasonality[monthIndex];
      const maturity = profile.growth[year - 1];
      const variance = (((monthIndex + year * 3) % 7) - 3) / 100;
      const revenue = round(profile.baseMonthlyRevenue * maturity * season * (1 + variance));
      const plannedRevenue = round(profile.baseMonthlyRevenue * maturity * season);
      const directCost = round(revenue * profile.ratios.direct * (1 + variance / 2));
      const labourCost = round(revenue * profile.ratios.labour * (1 - year * 0.006));
      const overheadCost = round(revenue * profile.ratios.overhead);
      const logisticsCost = round(revenue * profile.ratios.logistics * (1 + (season - 1) * 0.18));
      const operatingExpense = round(revenue * profile.ratios.opex * (1 - (year - 1) * 0.01));
      const depreciation = round(revenue * profile.ratios.depreciation);
      const ebitda = revenue - directCost - labourCost - overheadCost - logisticsCost - operatingExpense;
      const operatingProfit = ebitda - depreciation;
      const inventory = round(revenue * profile.ratios.inventory * (1.05 - monthIndex * 0.004));
      const receivables = round(revenue * profile.ratios.receivables);
      const payables = round(directCost * (profile.ratios.payables / Math.max(profile.ratios.direct, 0.01)));
      rollingCash = Math.max(
        round(profile.baseMonthlyRevenue * 0.12),
        round(rollingCash + operatingProfit * 0.38 - (inventory + receivables - payables) * 0.025),
      );
      const problem = blueprint.commonProblems[(monthIndex + year - 1) % blueprint.commonProblems.length];
      return {
        id: `${industryId}-y${year}-m${String(monthIndex + 1).padStart(2, "0")}`,
        year,
        month: monthIndex + 1,
        period,
        operatingVolume: round(profile.baseMonthlyVolume * maturity * season * (1 + variance)),
        volumeUnit: profile.volumeUnit,
        plannedRevenue,
        revenue,
        directCost,
        labourCost,
        overheadCost,
        logisticsCost,
        operatingExpense,
        depreciation,
        ebitda,
        operatingProfit,
        inventory,
        receivables,
        payables,
        cash: rollingCash,
        transactionDocuments: 480 + year * 76 + monthIndex * 11 + profile.specialistTransactions.length * 18,
        exception: problem.issue,
      };
    }),
  );
}

function annualSummaries(
  records: IndustryMonthlyPracticeRecord[],
): IndustryAnnualPracticeSummary[] {
  return ([1, 2, 3] as PracticeYear[]).map((year) => {
    const monthsForYear = records.filter((record) => record.year === year);
    const closing = monthsForYear.at(-1)!;
    const sum = (field: keyof IndustryMonthlyPracticeRecord) =>
      monthsForYear.reduce((total, record) => total + Number(record[field]), 0);
    return {
      year,
      revenue: sum("revenue"),
      directCost: sum("directCost"),
      labourCost: sum("labourCost"),
      overheadCost: sum("overheadCost"),
      logisticsCost: sum("logisticsCost"),
      operatingExpense: sum("operatingExpense"),
      depreciation: sum("depreciation"),
      ebitda: sum("ebitda"),
      operatingProfit: sum("operatingProfit"),
      closingInventory: closing.inventory,
      closingReceivables: closing.receivables,
      closingPayables: closing.payables,
      closingCash: closing.cash,
      transactionDocuments: sum("transactionDocuments"),
    };
  });
}

function configurationFor(
  industryId: IndustryId,
  profile: PracticeProfile,
): IndustryConfigurationWorkstream[] {
  const blueprint = industryBlueprintById(industryId);
  const common = [
    {
      area: "Enterprise and fiscal structure",
      workspace: "CBC/IMG Enterprise Structure and Financial Accounting",
      transactions: "OX15, OX02, OB29, OBY6 or edition-equivalent configuration activities",
      keyDecisions: ["Company and company code", "Fiscal year and periods", "Currencies", "Chart of accounts"],
      validation: "Post a balanced test journal and report it in company-code and group currency.",
    },
    {
      area: "Logistics organisation",
      workspace: "CBC/IMG Logistics General",
      transactions: "OX10, OX09, OX18, OX17 and assignment activities",
      keyDecisions: ["Plants/sites", "Storage locations", "Purchasing organisation", "Sales organisation and distribution channel"],
      validation: `All organisational assignments support ${blueprint.valueChain.map((stage) => stage.stage).join(" -> ")}.`,
    },
    {
      area: "Finance and controlling integration",
      workspace: "CBC/IMG Financial and Management Accounting",
      transactions: "OKKP, KE51, KS01, KL01, OB52",
      keyDecisions: ["Controlling area", "Profit/cost centres", "Activity types", "Posting periods and document types"],
      validation: "An operational posting updates the correct G/L account, cost object, profit centre, and margin characteristic.",
    },
    {
      area: "Procurement, inventory, and valuation",
      workspace: "CBC/IMG Materials Management",
      transactions: "OMJJ, OBYC, valuation and account-determination activities",
      keyDecisions: ["Material/service types", "Valuation level", "Movement types", "Automatic account determination"],
      validation: "Purchase receipt, consumption, transfer, invoice, and payment reconcile quantity and value.",
    },
    {
      area: "Sales, billing, tax, and credit",
      workspace: "CBC/IMG Sales and Distribution",
      transactions: "VOV8, V/08, OVKK, VKOA, credit-management activities",
      keyDecisions: ["Order and delivery types", "Pricing", "Tax", "Revenue account determination and credit"],
      validation: "Order-to-cash test produces correct delivery, billing, tax, receivable, revenue, and margin.",
    },
    {
      area: "Closing and reporting",
      workspace: "SAP Fiori Finance closing configuration",
      transactions: "OB52, FAGLGVTR, F.01, allocation and settlement cycles",
      keyDecisions: ["Close sequence", "Accruals", "Allocations", "Settlement", "Financial statement version"],
      validation: "Trial balance, subledgers, cost objects, and management reports reconcile at period close.",
    },
  ];
  return [
    ...common,
    ...profile.specialistConfiguration.map((item) => ({
      area: item.area,
      workspace: item.workspace,
      transactions: item.transactions,
      keyDecisions: item.decisions,
      validation: item.validation,
    })),
  ].map((workstream, index) => ({ ...workstream, sequence: index + 1 }));
}

export function industryPracticePack(industryId: IndustryId): IndustryPracticePack {
  const profile = profiles[industryId];
  const industry = industryById(industryId);
  const monthlyRecords = generateMonthlyRecords(industryId, profile);
  return {
    industryId,
    enterprise: industry.enterprise,
    datasetVersion: "sap-world-industry-practice-v2",
    currency: "GBP",
    fiscalYears: ["2023-2024", "2024-2025", "2025-2026"],
    scope: `Complete three-year training dataset for ${industry.industry}: 36 monthly operating periods, integrated financials, ${profile.specialistTransactions.length} specialist transaction chains, and ${configurationFor(industryId, profile).length} configuration workstreams.`,
    configuration: configurationFor(industryId, profile),
    specialistTransactions: profile.specialistTransactions.map((transaction, index) => ({
      ...transaction,
      id: `${profile.code}-SP-${String(index + 1).padStart(2, "0")}`,
    })),
    costing: {
      costObject: profile.costObject,
      method: profile.costingMethod,
      settlementReceiver: profile.settlementReceiver,
      profitabilityDimensions: profile.profitabilityDimensions,
      components: profile.costComponents,
    },
    monthlyRecords,
    annualSummaries: annualSummaries(monthlyRecords),
  };
}

export const industryPracticeCoverage = (Object.keys(profiles) as IndustryId[]).map(
  (industryId) => {
    const pack = industryPracticePack(industryId);
    return {
      industryId,
      configurationWorkstreams: pack.configuration.length,
      specialistTransactions: pack.specialistTransactions.length,
      monthlyRecords: pack.monthlyRecords.length,
      fiscalYears: pack.annualSummaries.length,
      costComponents: pack.costing.components.length,
    };
  },
);
