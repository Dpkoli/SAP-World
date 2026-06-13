import type { FiscalYear } from "@/data/history";

export type AnalyticsMetric =
  | "Revenue"
  | "Operating margin"
  | "Service level"
  | "Inventory days"
  | "Downtime";

export type AnalyticsPeriod = {
  id: string;
  fiscalYear: FiscalYear;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  revenueM: number;
  volumeKhl: number;
  operatingMargin: number;
  serviceLevel: number;
  inventoryDays: number;
  downtimeHours: number;
  wastePercent: number;
  workingCapitalM: number;
};

export type PerformanceDriver = {
  id: string;
  fiscalYear: FiscalYear;
  title: string;
  category: "Growth" | "Cost" | "Service" | "Inventory" | "Risk";
  direction: "Positive" | "Negative" | "Mixed";
  financialImpact: string;
  metricImpact: string;
  explanation: string;
  sapEvidence: string;
  modules: string[];
  eventIds: string[];
  managementAction: string;
};

export type ProfitabilitySegment = {
  id: string;
  fiscalYear: FiscalYear;
  name: string;
  dimension: "Product" | "Customer" | "Channel";
  revenueM: number;
  contributionM: number;
  marginPercent: number;
  volumeShare: number;
  primaryDriver: string;
};

export const analyticsPeriods: AnalyticsPeriod[] = [
  { id: "FY24-Q1", fiscalYear: "2023–2024", quarter: "Q1", revenueM: 9.7, volumeKhl: 258, operatingMargin: 7.9, serviceLevel: 92.8, inventoryDays: 43, downtimeHours: 186, wastePercent: 3.2, workingCapitalM: 7.6 },
  { id: "FY24-Q2", fiscalYear: "2023–2024", quarter: "Q2", revenueM: 10.4, volumeKhl: 272, operatingMargin: 7.1, serviceLevel: 89.6, inventoryDays: 47, downtimeHours: 224, wastePercent: 3.8, workingCapitalM: 8.2 },
  { id: "FY24-Q3", fiscalYear: "2023–2024", quarter: "Q3", revenueM: 10.8, volumeKhl: 281, operatingMargin: 8.7, serviceLevel: 93.4, inventoryDays: 41, downtimeHours: 178, wastePercent: 2.9, workingCapitalM: 7.8 },
  { id: "FY24-Q4", fiscalYear: "2023–2024", quarter: "Q4", revenueM: 11.9, volumeKhl: 309, operatingMargin: 10.5, serviceLevel: 95.1, inventoryDays: 39, downtimeHours: 141, wastePercent: 2.5, workingCapitalM: 7.4 },
  { id: "FY25-Q1", fiscalYear: "2024–2025", quarter: "Q1", revenueM: 12.4, volumeKhl: 322, operatingMargin: 10.8, serviceLevel: 95.7, inventoryDays: 40, downtimeHours: 136, wastePercent: 2.4, workingCapitalM: 7.8 },
  { id: "FY25-Q2", fiscalYear: "2024–2025", quarter: "Q2", revenueM: 13.8, volumeKhl: 357, operatingMargin: 11.6, serviceLevel: 96.2, inventoryDays: 42, downtimeHours: 129, wastePercent: 2.3, workingCapitalM: 8.5 },
  { id: "FY25-Q3", fiscalYear: "2024–2025", quarter: "Q3", revenueM: 12.1, volumeKhl: 309, operatingMargin: 8.9, serviceLevel: 91.3, inventoryDays: 46, downtimeHours: 168, wastePercent: 3.1, workingCapitalM: 9.3 },
  { id: "FY25-Q4", fiscalYear: "2024–2025", quarter: "Q4", revenueM: 13.0, volumeKhl: 352, operatingMargin: 9.1, serviceLevel: 94.8, inventoryDays: 49, downtimeHours: 151, wastePercent: 2.8, workingCapitalM: 9.7 },
  { id: "FY26-Q1", fiscalYear: "2025–2026", quarter: "Q1", revenueM: 14.2, volumeKhl: 361, operatingMargin: 11.8, serviceLevel: 96.1, inventoryDays: 42, downtimeHours: 122, wastePercent: 2.2, workingCapitalM: 8.9 },
  { id: "FY26-Q2", fiscalYear: "2025–2026", quarter: "Q2", revenueM: 15.6, volumeKhl: 391, operatingMargin: 12.7, serviceLevel: 95.4, inventoryDays: 38, downtimeHours: 118, wastePercent: 2.1, workingCapitalM: 8.4 },
  { id: "FY26-Q3", fiscalYear: "2025–2026", quarter: "Q3", revenueM: 14.1, volumeKhl: 349, operatingMargin: 10.2, serviceLevel: 92.7, inventoryDays: 41, downtimeHours: 164, wastePercent: 2.9, workingCapitalM: 8.8 },
  { id: "FY26-Q4", fiscalYear: "2025–2026", quarter: "Q4", revenueM: 15.0, volumeKhl: 389, operatingMargin: 10.9, serviceLevel: 96.8, inventoryDays: 36, downtimeHours: 96, wastePercent: 1.9, workingCapitalM: 8.0 },
];

export const performanceDrivers: PerformanceDriver[] = [
  {
    id: "DRV-FY24-QUALITY",
    fiscalYear: "2023–2024",
    title: "Bottle quality failure reduced Q2 margin",
    category: "Cost",
    direction: "Negative",
    financialImpact: "GBP 26,500 direct claim and production variance",
    metricImpact: "Q2 operating margin fell 0.8 points and service level fell 3.2 points",
    explanation: "Blocked packaging stock stopped line 1 for 11 hours and forced alternate-stock consumption at a higher conversion cost.",
    sapEvidence: "Inspection lot 0400000618, quality notification 200000194, and material document 5000017842",
    modules: ["QM", "MM", "PP", "FI"],
    eventIds: ["EVT-2310-004"],
    managementAction: "Tighten incoming inspection and require supplier change notification before mould changes.",
  },
  {
    id: "DRV-FY24-MAINT",
    fiscalYear: "2023–2024",
    title: "Preventive-maintenance correction restored output",
    category: "Service",
    direction: "Mixed",
    financialImpact: "GBP 12,450 repair cost; avoided repeat utility interruption",
    metricImpact: "Downtime reduced from 224 hours in Q2 to 141 hours in Q4",
    explanation: "The boiler feed-pump breakdown disrupted brewing, but the revised eight-week maintenance cycle improved subsequent availability.",
    sapEvidence: "Maintenance notification 100000428 and maintenance order 400001038",
    modules: ["PM", "PP", "MM", "CO"],
    eventIds: ["EVT-2402-007"],
    managementAction: "Monitor vibration trends and compliance with the revised preventive-maintenance plan.",
  },
  {
    id: "DRV-FY25-RETAIL",
    fiscalYear: "2024–2025",
    title: "BritMart contract accelerated profitable growth",
    category: "Growth",
    direction: "Positive",
    financialImpact: "GBP 6.2M expected annual revenue at 31% planned gross margin",
    metricImpact: "Quarterly revenue increased from GBP 12.4M to GBP 13.8M",
    explanation: "The national listing raised demand by 18%, supported by approved capacity, pricing, and safety-stock changes.",
    sapEvidence: "Customer contract 4600000182 and pricing condition PR00-BM24",
    modules: ["SD", "PP", "MM", "CO", "EWM"],
    eventIds: ["EVT-2406-011"],
    managementAction: "Protect retail service while tracking promotional deductions and packaging capacity.",
  },
  {
    id: "DRV-FY25-SUPPLY",
    fiscalYear: "2024–2025",
    title: "Emergency malt sourcing compressed Q3 margin",
    category: "Risk",
    direction: "Negative",
    financialImpact: "GBP 42,700 material-price variance; GBP 1.1M sales protected",
    metricImpact: "Q3 margin fell 2.7 points and service level fell 4.9 points",
    explanation: "Supplier concentration left only five days of malt coverage, requiring spot buying and production prioritization.",
    sapEvidence: "Emergency RFQ 600000082 and purchase order 4500008011",
    modules: ["MM", "PP", "QM", "FI", "Ariba"],
    eventIds: ["EVT-2411-014"],
    managementAction: "Increase contracted alternate capacity and track source concentration in category reviews.",
  },
  {
    id: "DRV-FY25-AGING",
    fiscalYear: "2024–2025",
    title: "Slow-moving stock weakened Q4 profitability",
    category: "Inventory",
    direction: "Negative",
    financialImpact: "GBP 92,000 provision and GBP 38,000 approved scrap",
    metricImpact: "Inventory days rose to 49 and operating margin remained at 9.1%",
    explanation: "Discontinued promotional packaging and weaker export demand left stock beyond its consumption horizon.",
    sapEvidence: "Inventory ageing report INV-AGING-0325 and journal entry 1900004472",
    modules: ["FI", "CO", "MM", "BW"],
    eventIds: ["EVT-2503-019"],
    managementAction: "Use monthly ageing reviews, lifecycle status controls, and disposal ownership.",
  },
  {
    id: "DRV-FY26-DEMAND",
    fiscalYear: "2025–2026",
    title: "Warm-weather demand lifted Q2 contribution",
    category: "Growth",
    direction: "Positive",
    financialImpact: "GBP 286,000 incremental gross profit less GBP 21,300 premium freight",
    metricImpact: "Q2 revenue reached GBP 15.6M and operating margin reached 12.7%",
    explanation: "A 27% demand spike was monetized through allocation, expedited production, and protected strategic customers.",
    sapEvidence: "Allocation object PAL-IPA-0725 and sales orders 182410 and 182421",
    modules: ["SD", "aATP", "PP", "EWM", "TM"],
    eventIds: ["EVT-2507-023"],
    managementAction: "Improve weather sensing and pre-build constrained products before overlapping promotions.",
  },
  {
    id: "DRV-FY26-RETURN",
    fiscalYear: "2025–2026",
    title: "Keg return and line stoppage reduced Q3 margin",
    category: "Cost",
    direction: "Negative",
    financialImpact: "GBP 31,600 credit and logistics cost plus GBP 12,000 warranty provision",
    metricImpact: "Q3 margin fell 2.5 points and downtime increased by 46 hours",
    explanation: "Filling-valve calibration drift caused underfilled kegs, blocked stock, a controlled withdrawal, and maintenance intervention.",
    sapEvidence: "Return 600000341, quality notification 300000129, and maintenance order 400002917",
    modules: ["SD", "QM", "PP", "PM", "FI"],
    eventIds: ["EVT-2510-027"],
    managementAction: "Maintain the doubled calibration frequency and monitor fill-volume capability by production batch.",
  },
  {
    id: "DRV-FY26-OPTIMIZE",
    fiscalYear: "2025–2026",
    title: "Planning and maintenance controls improved Q4",
    category: "Service",
    direction: "Positive",
    financialImpact: "Lower waste, downtime, and working capital supported margin recovery",
    metricImpact: "Service reached 96.8%, inventory fell to 36 days, and downtime fell to 96 hours",
    explanation: "Better allocation, preventive maintenance, quality controls, and inventory ownership converted operational stability into cash and service improvement.",
    sapEvidence: "Connected PP, EWM, QM, PM, FI, and CO operational records",
    modules: ["PP", "EWM", "QM", "PM", "FI", "CO", "BW"],
    eventIds: ["EVT-2601-031", "EVT-2604-035"],
    managementAction: "Sustain control adherence and close the remaining invoice and environmental monitoring actions.",
  },
];

export const profitabilitySegments: ProfitabilitySegment[] = [
  { id: "PROD-AMBER-FY24", fiscalYear: "2023–2024", name: "Amber Ale", dimension: "Product", revenueM: 16.1, contributionM: 4.5, marginPercent: 28.0, volumeShare: 40, primaryDriver: "Core portfolio scale offset by packaging-quality disruption" },
  { id: "PROD-IPA-FY24", fiscalYear: "2023–2024", name: "Session IPA", dimension: "Product", revenueM: 12.4, contributionM: 3.1, marginPercent: 25.0, volumeShare: 26, primaryDriver: "Premium realization with higher hop and short-run conversion costs" },
  { id: "PROD-LAGER-FY24", fiscalYear: "2023–2024", name: "Burton Lager", dimension: "Product", revenueM: 9.2, contributionM: 1.8, marginPercent: 19.6, volumeShare: 23, primaryDriver: "Competitive pricing during the process-stabilization year" },
  { id: "PROD-SEASONAL-FY24", fiscalYear: "2023–2024", name: "Seasonal portfolio", dimension: "Product", revenueM: 5.1, contributionM: 0.7, marginPercent: 13.7, volumeShare: 11, primaryDriver: "Small campaign sizes and changeover intensity" },
  { id: "PROD-AMBER-FY25", fiscalYear: "2024–2025", name: "Amber Ale", dimension: "Product", revenueM: 18.9, contributionM: 5.6, marginPercent: 29.6, volumeShare: 39, primaryDriver: "BritMart scale improved utilization and absorption" },
  { id: "PROD-IPA-FY25", fiscalYear: "2024–2025", name: "Session IPA", dimension: "Product", revenueM: 15.3, contributionM: 4.2, marginPercent: 27.5, volumeShare: 27, primaryDriver: "Growth offset by emergency malt and logistics exposure" },
  { id: "PROD-LAGER-FY25", fiscalYear: "2024–2025", name: "Burton Lager", dimension: "Product", revenueM: 11.0, contributionM: 2.3, marginPercent: 20.9, volumeShare: 23, primaryDriver: "Stable volume with limited pricing power" },
  { id: "PROD-SEASONAL-FY25", fiscalYear: "2024–2025", name: "Seasonal portfolio", dimension: "Product", revenueM: 6.1, contributionM: 0.8, marginPercent: 13.1, volumeShare: 11, primaryDriver: "Promotional obsolescence and inventory provision" },
  { id: "PROD-AMBER", fiscalYear: "2025–2026", name: "Amber Ale", dimension: "Product", revenueM: 21.4, contributionM: 6.8, marginPercent: 31.8, volumeShare: 38, primaryDriver: "Stable malt recipe, high line utilization, and national retail scale" },
  { id: "PROD-IPA", fiscalYear: "2025–2026", name: "Session IPA", dimension: "Product", revenueM: 17.8, contributionM: 5.1, marginPercent: 28.7, volumeShare: 27, primaryDriver: "Premium pricing offset by hop exposure and expedited summer freight" },
  { id: "PROD-LAGER", fiscalYear: "2025–2026", name: "Burton Lager", dimension: "Product", revenueM: 12.2, contributionM: 2.8, marginPercent: 23.0, volumeShare: 24, primaryDriver: "Competitive pricing and higher packaging conversion cost" },
  { id: "PROD-SEASONAL", fiscalYear: "2025–2026", name: "Seasonal portfolio", dimension: "Product", revenueM: 7.5, contributionM: 1.2, marginPercent: 16.0, volumeShare: 11, primaryDriver: "Short campaigns, promotional packaging, and residual ageing risk" },
  { id: "CUST-BRITMART", fiscalYear: "2025–2026", name: "BritMart Retail Group", dimension: "Customer", revenueM: 16.8, contributionM: 4.4, marginPercent: 26.2, volumeShare: 29, primaryDriver: "National scale with promotional and distribution deductions" },
  { id: "CUST-TAVERNS", fiscalYear: "2025–2026", name: "Northern Taverns", dimension: "Customer", revenueM: 11.9, contributionM: 3.7, marginPercent: 31.1, volumeShare: 18, primaryDriver: "Strong on-trade mix, partly offset by the keg quality return" },
  { id: "CHAN-EXPORT", fiscalYear: "2025–2026", name: "Export distribution", dimension: "Channel", revenueM: 8.6, contributionM: 1.5, marginPercent: 17.4, volumeShare: 13, primaryDriver: "Freight, credit exposure, and lower demand predictability" },
];

export const analyticsMetrics: AnalyticsMetric[] = [
  "Revenue",
  "Operating margin",
  "Service level",
  "Inventory days",
  "Downtime",
];

export function periodsForYear(fiscalYear: FiscalYear) {
  return analyticsPeriods.filter((period) => period.fiscalYear === fiscalYear);
}

export function driversForYear(fiscalYear: FiscalYear) {
  return performanceDrivers.filter((driver) => driver.fiscalYear === fiscalYear);
}

export function metricValue(period: AnalyticsPeriod, metric: AnalyticsMetric) {
  if (metric === "Revenue") return period.revenueM;
  if (metric === "Operating margin") return period.operatingMargin;
  if (metric === "Service level") return period.serviceLevel;
  if (metric === "Inventory days") return period.inventoryDays;
  return period.downtimeHours;
}

export function metricLabel(value: number, metric: AnalyticsMetric) {
  if (metric === "Revenue") return `GBP ${value.toFixed(1)}M`;
  if (metric === "Operating margin" || metric === "Service level") return `${value.toFixed(1)}%`;
  if (metric === "Inventory days") return `${value} days`;
  return `${value} hrs`;
}
