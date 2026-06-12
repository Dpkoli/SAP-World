export type FiscalYear = "2023–2024" | "2024–2025" | "2025–2026";

export type EnterpriseEvent = {
  id: string;
  fiscalYear: FiscalYear;
  date: string;
  title: string;
  category:
    | "Growth"
    | "Procurement"
    | "Production"
    | "Quality"
    | "Sales"
    | "Maintenance"
    | "Finance"
    | "Compliance";
  severity: "Information" | "Warning" | "Critical";
  summary: string;
  businessCause: string;
  modules: string[];
  documents: { type: string; number: string }[];
  operationalImpact: string;
  inventoryImpact: string;
  financialImpact: string;
  resolution: string;
  status: "Resolved" | "Monitoring" | "Open";
};

export const fiscalYearSummaries = [
  {
    year: "2023–2024" as FiscalYear,
    phase: "Foundation",
    revenue: "£42.8M",
    operatingMargin: "8.6%",
    production: "1.12M HL",
    employees: 326,
    narrative:
      "The company stabilized core processes, introduced batch traceability, and established its first integrated planning cycle.",
  },
  {
    year: "2024–2025" as FiscalYear,
    phase: "Expansion",
    revenue: "£51.3M",
    operatingMargin: "10.1%",
    production: "1.34M HL",
    employees: 352,
    narrative:
      "Retail growth increased volume and complexity while supplier disruption exposed weaknesses in safety-stock policy.",
  },
  {
    year: "2025–2026" as FiscalYear,
    phase: "Optimization",
    revenue: "£58.9M",
    operatingMargin: "11.4%",
    production: "1.49M HL",
    employees: 380,
    narrative:
      "The enterprise improved profitability through better planning, quality controls, and preventative maintenance.",
  },
];

export const enterpriseEvents: EnterpriseEvent[] = [
  {
    id: "EVT-2307-001",
    fiscalYear: "2023–2024",
    date: "2023-07-03",
    title: "Integrated planning baseline established",
    category: "Growth",
    severity: "Information",
    summary:
      "The first annual sales and production plan connected forecast demand to brewery capacity and raw-material purchasing.",
    businessCause:
      "Rapid growth had been managed through spreadsheets, causing inconsistent demand and purchasing assumptions.",
    modules: ["IBP", "PP", "MM", "CO"],
    documents: [
      { type: "Planning version", number: "A00-FY24" },
      { type: "Demand plan", number: "DP-2024-01" },
    ],
    operationalImpact:
      "A single 12-month demand signal became the basis for production and procurement planning.",
    inventoryImpact:
      "Target stock parameters were established for malt, hops, packaging, and finished goods.",
    financialImpact:
      "The approved plan created the FY24 volume, revenue, and conversion-cost baseline.",
    resolution:
      "Monthly sales-and-operations planning reviews were introduced with controlled planning versions.",
    status: "Resolved",
  },
  {
    id: "EVT-2310-004",
    fiscalYear: "2023–2024",
    date: "2023-10-18",
    title: "Packaging quality failure blocked production supply",
    category: "Quality",
    severity: "Critical",
    summary:
      "A delivery of 330 ml amber bottles failed dimensional inspection and was moved to blocked stock.",
    businessCause:
      "The supplier changed a mould without notifying Burton Craft Beverages, creating neck-finish variation.",
    modules: ["MM", "QM", "PP", "FI"],
    documents: [
      { type: "Purchase order", number: "4500004281" },
      { type: "Material document", number: "5000017842" },
      { type: "Inspection lot", number: "0400000618" },
      { type: "Quality notification", number: "200000194" },
    ],
    operationalImpact:
      "Packaging line 1 lost 11 production hours while an approved alternate bottle was staged.",
    inventoryImpact:
      "240,000 bottles moved from quality inspection to blocked stock; alternate stock fell below safety level.",
    financialImpact:
      "£18,600 supplier claim raised and £7,900 production variance recorded.",
    resolution:
      "The batch was returned, a debit memo was issued, and incoming inspection was tightened for three deliveries.",
    status: "Resolved",
  },
  {
    id: "EVT-2402-007",
    fiscalYear: "2023–2024",
    date: "2024-02-12",
    title: "Boiler feed-pump breakdown",
    category: "Maintenance",
    severity: "Warning",
    summary:
      "A condition-monitoring alert became an emergency maintenance order after vibration exceeded its limit.",
    businessCause:
      "The pump bearing reached end of life earlier than planned because lubrication intervals were too long.",
    modules: ["PM", "PP", "MM", "CO"],
    documents: [
      { type: "Maintenance notification", number: "100000428" },
      { type: "Maintenance order", number: "400001038" },
      { type: "Reservation", number: "700000221" },
    ],
    operationalImpact:
      "Brewing was rescheduled for 14 hours and two production orders were sequence-adjusted.",
    inventoryImpact:
      "One bearing and seal kit were issued from maintenance spares.",
    financialImpact:
      "£12,450 maintenance cost settled to utility cost centre BR01-UTIL.",
    resolution:
      "The pump was repaired and the preventive-maintenance cycle reduced from 12 to 8 weeks.",
    status: "Resolved",
  },
  {
    id: "EVT-2406-011",
    fiscalYear: "2024–2025",
    date: "2024-06-21",
    title: "National retail contract won",
    category: "Sales",
    severity: "Information",
    summary:
      "BritMart awarded a national listing for Amber Ale and Session IPA across 420 stores.",
    businessCause:
      "A successful regional trial demonstrated strong rate of sale and reliable service levels.",
    modules: ["SD", "PP", "MM", "CO", "EWM"],
    documents: [
      { type: "Customer contract", number: "4600000182" },
      { type: "Condition record", number: "PR00-BM24" },
      { type: "Demand plan", number: "DP-BM-2025" },
    ],
    operationalImpact:
      "Monthly demand increased by 18%, requiring a third packaging shift and revised distribution allocation.",
    inventoryImpact:
      "Finished-goods safety stock increased from 7 to 10 days for the listed products.",
    financialImpact:
      "Expected annual revenue increased by £6.2M with a planned gross margin of 31%.",
    resolution:
      "Capacity, procurement contracts, and customer-specific pricing were approved before launch.",
    status: "Resolved",
  },
  {
    id: "EVT-2411-014",
    fiscalYear: "2024–2025",
    date: "2024-11-07",
    title: "Malt supplier shortage triggered urgent sourcing",
    category: "Procurement",
    severity: "Critical",
    summary:
      "Flooding interrupted Highland Maltings production and reduced confirmed supply for three weeks.",
    businessCause:
      "The main supplier represented 68% of pale-malt volume and the alternate source had insufficient contracted capacity.",
    modules: ["MM", "PP", "QM", "FI", "Ariba"],
    documents: [
      { type: "Purchase order", number: "4500007964" },
      { type: "Supplier confirmation", number: "AB-11984" },
      { type: "Emergency RFQ", number: "600000082" },
      { type: "Purchase order", number: "4500008011" },
    ],
    operationalImpact:
      "MRP exception messages identified five production orders at risk; lower-priority export production was deferred.",
    inventoryImpact:
      "Projected malt coverage fell from 16 to 5 days before emergency supply arrived.",
    financialImpact:
      "Spot purchasing added £42,700 material-price variance but protected £1.1M of domestic sales.",
    resolution:
      "Emergency supply was quality-released, allocation rules were applied, and dual-sourcing targets were approved.",
    status: "Resolved",
  },
  {
    id: "EVT-2503-019",
    fiscalYear: "2024–2025",
    date: "2025-03-28",
    title: "Year-end slow-moving inventory provision",
    category: "Finance",
    severity: "Warning",
    summary:
      "Finance identified obsolete seasonal packaging and slow-moving export finished goods during year-end close.",
    businessCause:
      "A discontinued promotion and weaker export demand left stock beyond its expected consumption horizon.",
    modules: ["FI", "CO", "MM", "BW"],
    documents: [
      { type: "Inventory report", number: "INV-AGING-0325" },
      { type: "Journal entry", number: "1900004472" },
      { type: "Material document", number: "4900001921" },
    ],
    operationalImpact:
      "Sales and supply-chain teams created disposal, rework, and promotional-clearance actions.",
    inventoryImpact:
      "£164,000 of inventory was classified as slow moving; £38,000 was scrapped after approval.",
    financialImpact:
      "A £92,000 inventory provision reduced FY25 operating profit.",
    resolution:
      "Lifecycle controls and monthly ageing reviews were introduced for promotional materials.",
    status: "Monitoring",
  },
  {
    id: "EVT-2507-023",
    fiscalYear: "2025–2026",
    date: "2025-07-14",
    title: "Demand spike created allocation controls",
    category: "Sales",
    severity: "Warning",
    summary:
      "Unusually warm weather increased packaged-beer orders by 27% above the approved demand plan.",
    businessCause:
      "Retail promotions overlapped with weather-driven demand and customers advanced planned orders.",
    modules: ["SD", "aATP", "PP", "EWM", "TM"],
    documents: [
      { type: "Sales order", number: "182410" },
      { type: "Sales order", number: "182421" },
      { type: "Allocation object", number: "PAL-IPA-0725" },
    ],
    operationalImpact:
      "Available-to-promise rules prioritized contracted customers and shifted two export deliveries by four days.",
    inventoryImpact:
      "Session IPA stock fell to 1.8 days before expedited production replenished the distribution centre.",
    financialImpact:
      "Premium freight cost £21,300; additional volume contributed £286,000 gross profit.",
    resolution:
      "Product allocation, revised deployment, and expedited transport protected strategic accounts.",
    status: "Resolved",
  },
  {
    id: "EVT-2510-027",
    fiscalYear: "2025–2026",
    date: "2025-10-09",
    title: "Customer return traced to filling valve",
    category: "Quality",
    severity: "Critical",
    summary:
      "Northern Taverns reported underfilled kegs from two batches, triggering a customer complaint and recall assessment.",
    businessCause:
      "A filling-valve calibration drifted between planned checks and affected a defined production window.",
    modules: ["SD", "QM", "PP", "PM", "FI"],
    documents: [
      { type: "Customer return", number: "600000341" },
      { type: "Quality notification", number: "300000129" },
      { type: "Production order", number: "100004821" },
      { type: "Maintenance order", number: "400002917" },
      { type: "Credit memo", number: "910000184" },
    ],
    operationalImpact:
      "A controlled market withdrawal covered 186 kegs; the filling line stopped for calibration and verification.",
    inventoryImpact:
      "Returned and on-hand affected batches moved to blocked stock pending disposition.",
    financialImpact:
      "£31,600 credit and logistics cost posted; warranty provision increased by £12,000.",
    resolution:
      "The valve was recalibrated, affected stock reworked, and calibration frequency doubled.",
    status: "Resolved",
  },
  {
    id: "EVT-2601-031",
    fiscalYear: "2025–2026",
    date: "2026-01-16",
    title: "Environmental audit identified wastewater variance",
    category: "Compliance",
    severity: "Warning",
    summary:
      "An internal audit found three wastewater readings outside the internal operating target but within legal limits.",
    businessCause:
      "Cleaning schedules and high-strength discharge coincided without load-leveling controls.",
    modules: ["EHS", "PM", "CO", "BW"],
    documents: [
      { type: "Audit finding", number: "AUD-EHS-2601-03" },
      { type: "Corrective action", number: "CAPA-2601-14" },
      { type: "Maintenance order", number: "400003194" },
    ],
    operationalImpact:
      "Cleaning schedules were separated and online monitoring was added to the treatment process.",
    inventoryImpact:
      "No material inventory impact; treatment chemicals were rebalanced against revised usage.",
    financialImpact:
      "£46,000 improvement project approved with expected annual water-treatment saving of £18,000.",
    resolution:
      "Corrective actions are implemented; effectiveness remains under monthly monitoring.",
    status: "Monitoring",
  },
  {
    id: "EVT-2604-035",
    fiscalYear: "2025–2026",
    date: "2026-04-04",
    title: "Automated invoice blocked by three-way-match variance",
    category: "Finance",
    severity: "Warning",
    summary:
      "A Highland Maltings invoice exceeded the purchase-order price tolerance after an unapproved fuel surcharge.",
    businessCause:
      "The supplier applied a temporary surcharge that was not reflected in the purchasing condition record.",
    modules: ["MM", "FI", "Ariba"],
    documents: [
      { type: "Purchase order", number: "4500010934" },
      { type: "Material document", number: "5000040112" },
      { type: "Supplier invoice", number: "5100008741" },
      { type: "Workflow", number: "WF-INV-88421" },
    ],
    operationalImpact:
      "No supply interruption occurred, but buyer and accounts-payable approval was required.",
    inventoryImpact:
      "No quantity impact; material valuation remained based on the purchase-order receipt.",
    financialImpact:
      "The £6,240 variance remained blocked and was not included in the payment proposal.",
    resolution:
      "The surcharge was rejected, a corrected invoice requested, and the blocked invoice reversed.",
    status: "Open",
  },
];

export function getEventsForYear(year?: string) {
  if (!year) return enterpriseEvents;
  return enterpriseEvents.filter((event) => event.fiscalYear === year);
}
