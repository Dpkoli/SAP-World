import type { ProcessScenario } from "@/data/simulation";

export type TroubleshootingCase = {
  id: string;
  scenarioId: ProcessScenario["id"];
  severity: "Warning" | "Critical";
  title: string;
  symptom: string;
  businessContext: string;
  evidence: { source: string; finding: string }[];
  diagnoses: string[];
  correctDiagnosis: number;
  explanation: string;
  recoverySteps: {
    action: string;
    sap: string;
    why: string;
  }[];
  impact: {
    operational: string;
    inventory: string;
    financial: string;
  };
  prevention: string;
};

export const troubleshootingCases: TroubleshootingCase[] = [
  {
    id: "P2P-EX-001",
    scenarioId: "p2p",
    severity: "Warning",
    title: "Invoice blocked by three-way match",
    symptom: "Supplier invoice 5105601188 is blocked for payment with quantity variance.",
    businessContext:
      "Highland Maltings invoiced 20,000 KG, but only 18,500 KG has been accepted against purchase order 4500011842.",
    evidence: [
      { source: "PO history", finding: "GR 5000042917: 18,500 KG posted; 1,500 KG remains open." },
      { source: "Invoice item", finding: "Invoice quantity: 20,000 KG; tolerance message M8 082." },
      { source: "Quality lot", finding: "Inspection lot covers only the received 18,500 KG." },
    ],
    diagnoses: [
      "The supplier master is missing a bank account",
      "The invoice exceeds the quantity supported by the goods receipt",
      "The material valuation class is incorrect",
    ],
    correctDiagnosis: 1,
    explanation:
      "SAP blocks the invoice because the invoiced quantity exceeds the received quantity beyond configured tolerance. Payment should not be released until the physical or commercial discrepancy is resolved.",
    recoverySteps: [
      { action: "Confirm the physical short delivery", sap: "Review PO history in Manage Purchase Orders or ME23N", why: "Determine whether stock is genuinely missing or the receipt was posted incorrectly." },
      { action: "Agree the commercial resolution", sap: "Contact supplier and record the variance in supplier collaboration", why: "The supplier must deliver the balance or issue a credit note." },
      { action: "Correct the supporting document", sap: "Post the remaining GR only if goods arrived; otherwise post or request a credit memo", why: "SAP evidence must match the real-world outcome." },
      { action: "Release after recheck", sap: "Use Release Blocked Invoices or MRBR", why: "Release is appropriate only after the variance falls within tolerance." },
    ],
    impact: {
      operational: "Production has 1,500 KG less malt than planned and must protect the next brew schedule.",
      inventory: "Inventory remains at the physically received 18,500 KG; no false receipt should be posted.",
      financial: "The payable remains blocked, preventing an overpayment of approximately £1,110.",
    },
    prevention: "Use advance shipping notices, receipt quantity checks, and supplier variance monitoring.",
  },
  {
    id: "O2C-EX-001",
    scenarioId: "o2c",
    severity: "Critical",
    title: "Sales order blocked by credit control",
    symptom: "Sales order 182934 cannot proceed to delivery because the customer failed the dynamic credit check.",
    businessContext:
      "Northern Taverns has £184,000 exposure against a £175,000 credit limit, including £31,000 overdue.",
    evidence: [
      { source: "Credit account", finding: "Current exposure exceeds limit by £9,000." },
      { source: "A/R aging", finding: "Invoice 900771 is 22 days overdue." },
      { source: "Sales order", finding: "Credit status B: document blocked." },
    ],
    diagnoses: [
      "Finished-goods stock is unavailable",
      "The route determination failed",
      "Customer exposure and overdue debt triggered the credit block",
    ],
    correctDiagnosis: 2,
    explanation:
      "Availability is confirmed, but SAP FSCM Credit Management blocks fulfilment because exposure and overdue receivables breach policy.",
    recoverySteps: [
      { action: "Review total exposure", sap: "Open Manage Credit Accounts or UKM_BP", why: "Separate open orders, deliveries, billing, and receivables before deciding." },
      { action: "Validate overdue items", sap: "Review customer line items in FBL5N or Display Line Items", why: "Confirm whether cash is unapplied, disputed, or genuinely overdue." },
      { action: "Choose an authorized response", sap: "Record payment, reduce order, obtain security, or request credit-manager approval", why: "Commercial urgency does not override delegated credit authority." },
      { action: "Release and document", sap: "Use credit-case processing to release the order", why: "The audit trail must show who accepted the risk and why." },
    ],
    impact: {
      operational: "Warehouse picking and transport planning remain on hold.",
      inventory: "The 400 kegs stay available but remain commercially allocated to the order.",
      financial: "The block prevents another £46,720 of unsecured exposure.",
    },
    prevention: "Monitor aging, automate dunning, and review credit limits as customer demand changes.",
  },
  {
    id: "PTP-EX-001",
    scenarioId: "ptp",
    severity: "Critical",
    title: "Production order cannot be released",
    symptom: "Order 10008417 receives a missing-parts status during release.",
    businessContext:
      "MRP created the order for 500 HL, but imported aroma hops will arrive two days after the scheduled component requirement.",
    evidence: [
      { source: "Material availability", finding: "RM-HOPS-AROMA-04 shortage: 86 KG on 15 June." },
      { source: "Purchase order", finding: "Confirmed delivery date: 17 June." },
      { source: "Capacity plan", finding: "Brew House 2 is reserved on 15 June." },
    ],
    diagnoses: [
      "A component shortage makes the planned start infeasible",
      "The production version has no costing lot size",
      "The finished product is blocked for sales",
    ],
    correctDiagnosis: 0,
    explanation:
      "The order structure is valid, but the ATP/material-availability check proves the required hops are not available on the scheduled issue date.",
    recoverySteps: [
      { action: "Confirm the shortage date and quantity", sap: "Run material availability check or review MD04", why: "Avoid expediting the wrong quantity or date." },
      { action: "Evaluate feasible alternatives", sap: "Reschedule the order, expedite the PO, or use an approved substitute BOM", why: "Quality, capacity, and procurement effects must be considered together." },
      { action: "Replan dependent operations", sap: "Update basic dates and run capacity leveling", why: "Moving brewing affects fermentation, packaging, labour, and downstream orders." },
      { action: "Recheck and release", sap: "Run availability check and release only when exceptions are accepted", why: "Release authorizes warehouse and shop-floor execution." },
    ],
    impact: {
      operational: "The Amber Ale run risks a two-day delay and capacity conflict.",
      inventory: "Other components remain reserved but should not be staged prematurely.",
      financial: "Expediting may add freight cost; an avoidable partial start would create WIP and inefficiency.",
    },
    prevention: "Use supplier confirmations, safety time for constrained imports, and exception-message ownership.",
  },
  {
    id: "R2R-EX-001",
    scenarioId: "r2r",
    severity: "Critical",
    title: "GR/IR reconciliation does not clear",
    symptom: "Month-end review shows a £42,600 aged credit balance on GR/IR.",
    businessContext:
      "Services and materials were received, but several supplier invoices reference incorrect PO items or have not arrived.",
    evidence: [
      { source: "GR/IR aging", finding: "Nine items are older than 60 days." },
      { source: "PO history", finding: "Three final-delivery flags are set with open invoice quantities." },
      { source: "Invoice workflow", finding: "Two invoices are parked against incorrect PO lines." },
    ],
    diagnoses: [
      "The company code currency is wrong",
      "Receipts and invoices are unmatched or incomplete",
      "Customer billing has not been released to accounting",
    ],
    correctDiagnosis: 1,
    explanation:
      "GR/IR holds timing differences between receipts and invoices. Aged balances indicate missing, incorrect, or unmatched logistics documents that need item-level resolution.",
    recoverySteps: [
      { action: "Age and classify open items", sap: "Run GR/IR reconciliation apps or MB5S", why: "Separate valid timing items from errors and stale balances." },
      { action: "Trace each document chain", sap: "Review PO history, material documents, and invoice documents", why: "The correction depends on which business event is wrong or missing." },
      { action: "Correct operational documents", sap: "Post missing invoices, reverse incorrect receipts, or adjust final-delivery indicators", why: "The subledger should reflect the actual receipt and obligation." },
      { action: "Clear only authorized residuals", sap: "Use GR/IR maintenance with finance approval", why: "Manual write-offs require evidence and account ownership." },
    ],
    impact: {
      operational: "Procurement must resolve stale supplier and receipt records before close.",
      inventory: "Incorrect receipt reversals may alter stock or consumption quantities.",
      financial: "Liabilities and expenses may be misstated until the £42,600 balance is resolved.",
    },
    prevention: "Assign GR/IR ownership, monitor aging weekly, and enforce PO-based invoicing discipline.",
  },
  {
    id: "QM-EX-001",
    scenarioId: "qm",
    severity: "Critical",
    title: "Malt batch fails moisture specification",
    symptom: "Inspection characteristic moisture records 6.4% against a maximum of 5.5%.",
    businessContext:
      "The 20,000 KG batch is required for next week’s brewing plan, but excess moisture threatens extract yield and storage stability.",
    evidence: [
      { source: "Inspection result", finding: "Moisture: 6.4%; valuation: rejected." },
      { source: "Material specification", finding: "Upper limit: 5.5%." },
      { source: "Stock overview", finding: "Entire batch remains in quality inspection stock." },
    ],
    diagnoses: [
      "The batch violates an active quality specification",
      "The purchase order price is above tolerance",
      "The storage location is not warehouse-managed",
    ],
    correctDiagnosis: 0,
    explanation:
      "The measured result is outside the approved specification. SAP correctly rejects the characteristic and keeps the batch unavailable pending an authorized disposition.",
    recoverySteps: [
      { action: "Validate the test result", sap: "Review sample, method, calibration, and result recording in QE51N", why: "A disposition should rely on trustworthy evidence." },
      { action: "Record the defect", sap: "Create a quality notification from the inspection lot", why: "The defect links supplier, material, batch, evidence, and corrective action." },
      { action: "Assess disposition", sap: "Choose return, concession, rework, or scrap through the usage decision", why: "Food safety and recipe quality require authorized risk acceptance." },
      { action: "Update procurement and planning", sap: "Create return delivery or replacement demand and notify MRP", why: "Blocked supply may create an immediate production shortage." },
    ],
    impact: {
      operational: "The next brew run may require replacement malt or rescheduling.",
      inventory: "20,000 KG remains blocked; return or scrap will reduce on-hand stock.",
      financial: "A return reverses inventory and GR/IR; scrap or concession can create loss or claim postings.",
    },
    prevention: "Track supplier quality scores, certificates of analysis, and recurring moisture defects.",
  },
  {
    id: "PM-EX-001",
    scenarioId: "pm",
    severity: "Critical",
    title: "Repair delayed by unavailable critical spare",
    symptom: "Maintenance order 40001038 cannot issue bearing BRG-6312 because unrestricted stock is zero.",
    businessContext:
      "The boiler feed pump is down and brewing cannot restart safely without the approved bearing.",
    evidence: [
      { source: "Reservation", finding: "Required: 1 EA; confirmed: 0 EA." },
      { source: "Stock overview", finding: "One bearing exists but is quality-blocked after shelf-life inspection." },
      { source: "Equipment BOM", finding: "No alternate bearing is technically approved." },
    ],
    diagnoses: [
      "The maintenance order has the wrong settlement rule",
      "The only spare is unavailable and no approved substitute exists",
      "The notification priority is too high",
    ],
    correctDiagnosis: 1,
    explanation:
      "The order is technically valid, but execution cannot continue because the reserved component is unavailable for issue and substitution requires engineering approval.",
    recoverySteps: [
      { action: "Verify all stock categories and locations", sap: "Review MMBE and EWM stock", why: "A usable part may exist in another plant or stock type." },
      { action: "Assess the blocked spare", sap: "Coordinate an expedited quality inspection", why: "Quality may release the existing part if evidence supports safe use." },
      { action: "Trigger emergency procurement or transfer", sap: "Create an urgent PR/STO linked to the order", why: "The document chain preserves priority, cost, and traceability." },
      { action: "Reschedule and communicate", sap: "Update order dates, capacity, and production impact", why: "Operations need a realistic restoration time and contingency plan." },
    ],
    impact: {
      operational: "Each additional hour extends utility downtime and production disruption.",
      inventory: "No part should be issued from blocked stock without a quality release.",
      financial: "Emergency freight and lost production increase the breakdown’s total cost.",
    },
    prevention: "Classify critical spares, set reorder points, and monitor shelf-life inspection dates.",
  },
  {
    id: "H2R-EX-001",
    scenarioId: "h2r",
    severity: "Warning",
    title: "Payroll posting rejected by cost centre validity",
    symptom: "Payroll posting simulation rejects employee 700184 with an invalid CO account assignment.",
    businessContext:
      "The employee transfer is effective 1 June, but the old cost centre was closed on 31 May and the new assignment was not replicated.",
    evidence: [
      { source: "Organizational assignment", finding: "Cost centre BR01-QA-OLD remains on the payroll-effective record." },
      { source: "CO master data", finding: "BR01-QA-OLD validity ended 31 May 2026." },
      { source: "Payroll log", finding: "Posting error: cost centre not valid on posting date." },
    ],
    diagnoses: [
      "The employee’s bank account failed validation",
      "The payroll period is already paid",
      "An effective-dated organizational assignment references a closed cost centre",
    ],
    correctDiagnosis: 2,
    explanation:
      "Gross-to-net calculation can complete while FI/CO posting fails. The posting date requires a valid cost object, but the replicated organizational assignment is stale.",
    recoverySteps: [
      { action: "Confirm the effective-dated assignment", sap: "Review employee organizational data in PA20 or SuccessFactors", why: "Identify the correct cost centre and effective date." },
      { action: "Correct the source record", sap: "Update the organizational assignment and replicate it", why: "The source system should own the employment change." },
      { action: "Revalidate payroll posting", sap: "Run posting simulation and inspect the posting log", why: "Ensure all wage types derive valid FI and CO accounts." },
      { action: "Post and reconcile", sap: "Create the payroll posting document and reconcile totals", why: "Payroll, FI, and CO must agree before payment and close." },
    ],
    impact: {
      operational: "Payroll close is delayed until HR and controlling correct the assignment.",
      inventory: "No inventory impact.",
      financial: "Salary expense cannot post to the correct department, risking misstated cost-centre reporting.",
    },
    prevention: "Validate effective-dated cost objects during transfers and monitor replication errors before payroll.",
  },
];

export function troubleshootingCaseFor(
  scenarioId: ProcessScenario["id"],
) {
  return troubleshootingCases.find((item) => item.scenarioId === scenarioId)!;
}
