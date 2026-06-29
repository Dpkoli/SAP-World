export type AdvancedTransactionType =
  | "Stock Transfer"
  | "Customer Return"
  | "Asset Accounting"
  | "Tax Adjustment"
  | "Year-End Close"
  | "Intercompany Sale"
  | "Product Costing"
  | "Maintenance Settlement";

export type AdvancedTransactionStatus =
  | "Not started"
  | "In progress"
  | "Completed";

export type AccountingEntry = {
  debit: string;
  credit: string;
  amount: string;
  explanation: string;
};

export type AdvancedTransactionStep = {
  sequence: number;
  title: string;
  role: string;
  app: string;
  transactionCode: string;
  instruction: string;
  why: string;
  result: string;
  documentType: string;
  documentNumber: string;
  inventoryImpact: string;
  accountingEntries: AccountingEntry[];
  controlChecks: string[];
};

export type AdvancedTransactionAuditEntry = {
  step: number;
  title: string;
  note: string;
  completedAt: string;
};

export type AdvancedTransactionCase = {
  id: string;
  type: AdvancedTransactionType;
  title: string;
  scenario: string;
  modules: string[];
  businessTrigger: string;
  value: string;
  priority: "High" | "Medium";
  status: AdvancedTransactionStatus;
  currentStep: number | null;
  completedSteps: number[];
  objectReferences: string[];
  validations: string[];
  steps: AdvancedTransactionStep[];
  auditTrail: AdvancedTransactionAuditEntry[];
  allowedActions: Array<"complete-step">;
};

export const advancedTransactionDefinitions: AdvancedTransactionCase[] = [
  {
    id: "ADV-STO-001",
    type: "Stock Transfer",
    title: "Transfer Amber Ale from BR01 to DC01",
    scenario:
      "Move finished-goods stock from the Bristol brewery to the national distribution centre using an internal stock transport order.",
    modules: ["MM", "SD", "EWM", "FI"],
    businessTrigger:
      "DC01 is below safety stock for the next customer delivery wave.",
    value: "240 KEG / £25,920 standard value",
    priority: "High",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: [
      "Material FG-AMBER-KEG-50",
      "Supplying plant BR01",
      "Receiving plant DC01",
      "Governance case MDG-MAT-260014",
    ],
    validations: [
      "Material is extended to both plants and storage locations.",
      "Stock transport order quantity matches the delivery and receipt.",
      "Stock in transit clears to zero after goods receipt.",
      "No customer revenue or external receivable is created.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Create the stock transport order",
        role: "Inventory planner",
        app: "Manage Purchase Orders",
        transactionCode: "ME21N",
        instruction:
          "Create an order using the stock transport document type, supplying plant BR01, receiving plant DC01, material FG-AMBER-KEG-50, and quantity 240 KEG.",
        why:
          "The order provides the approved demand signal and preserves traceability between planning, shipping, and receipt.",
        result:
          "Stock transport order 4500012098 is ready for delivery creation.",
        documentType: "Stock transport order",
        documentNumber: "4500012098",
        inventoryImpact: "No physical stock movement yet; 240 KEG is committed.",
        accountingEntries: [],
        controlChecks: [
          "Confirm the supplying and receiving plants are not reversed.",
          "Check the requested delivery date and available quantity.",
        ],
      },
      {
        sequence: 2,
        title: "Create the outbound delivery",
        role: "Shipping coordinator",
        app: "Create Outbound Deliveries from Stock Transport Orders",
        transactionCode: "VL10B",
        instruction:
          "Generate the outbound delivery for STO 4500012098 and verify the shipping point, route, batch determination, and 240 KEG quantity.",
        why:
          "The delivery is the warehouse execution document used for picking, packing, and goods issue.",
        result: "Outbound delivery 800012441 is released to BR01 warehouse.",
        documentType: "Outbound delivery",
        documentNumber: "800012441",
        inventoryImpact:
          "240 KEG remains unrestricted but is allocated to the delivery.",
        accountingEntries: [],
        controlChecks: [
          "Delivery quantity must equal the open STO quantity.",
          "Confirm the batch has sufficient shelf life for transfer.",
        ],
      },
      {
        sequence: 3,
        title: "Pick, pack, and stage the transfer",
        role: "Warehouse operator",
        app: "Run Outbound Process - Deliveries",
        transactionCode: "/SCWM/PRDO",
        instruction:
          "Create and confirm the warehouse tasks, pack the kegs onto handling units, and stage them at the BR01 dispatch door.",
        why:
          "Warehouse confirmation proves that the correct stock and batch were physically prepared before ownership of the movement is posted.",
        result: "Handling units are staged and delivery 800012441 is ready for issue.",
        documentType: "Warehouse task",
        documentNumber: "WT-260614-081",
        inventoryImpact:
          "240 KEG moves from available storage to the goods-issue staging area.",
        accountingEntries: [],
        controlChecks: [
          "Scan material, batch, quantity, and destination handling unit.",
          "Resolve any warehouse-task quantity difference before goods issue.",
        ],
      },
      {
        sequence: 4,
        title: "Post goods issue",
        role: "Shipping coordinator",
        app: "Change Outbound Delivery",
        transactionCode: "VL02N",
        instruction:
          "Post goods issue for outbound delivery 800012441 after checking confirmed picking and the actual departure time.",
        why:
          "Goods issue records that stock has left BR01 and is now travelling to DC01.",
        result: "Material document 4900006142 records the transfer departure.",
        documentType: "Material document",
        documentNumber: "4900006142",
        inventoryImpact:
          "BR01 unrestricted stock decreases by 240 KEG and stock in transit increases.",
        accountingEntries: [
          {
            debit: "Stock in transit",
            credit: "BR01 finished goods inventory",
            amount: "£25,920",
            explanation:
              "Illustrative plant-level valuation entry; configuration may use a non-valuated movement within the same valuation area.",
          },
        ],
        controlChecks: [
          "The delivery must be fully picked before posting.",
          "Confirm no sales revenue, customer receivable, or margin is recorded.",
        ],
      },
      {
        sequence: 5,
        title: "Receive and reconcile at DC01",
        role: "Receiving clerk",
        app: "Post Goods Movement",
        transactionCode: "MIGO",
        instruction:
          "Post goods receipt against STO 4500012098 for 240 KEG, verify the received batch and storage location, then review stock in transit.",
        why:
          "Receipt completes the physical transfer and makes the stock available at the destination.",
        result:
          "Material document 5000046221 places the stock into DC01 unrestricted use.",
        documentType: "Material document",
        documentNumber: "5000046221",
        inventoryImpact:
          "DC01 unrestricted stock increases by 240 KEG and stock in transit clears.",
        accountingEntries: [
          {
            debit: "DC01 finished goods inventory",
            credit: "Stock in transit",
            amount: "£25,920",
            explanation:
              "Clears the illustrative in-transit value into destination inventory.",
          },
        ],
        controlChecks: [
          "Receipt quantity and batch must match the shipping documents.",
          "Review MB5T or the stock-in-transit app for uncleared quantities.",
        ],
      },
    ],
  },
  {
    id: "ADV-RET-001",
    type: "Customer Return",
    title: "Process the Northern Taverns customer return",
    scenario:
      "Receive a quality-related return, inspect the stock, and issue the appropriate customer credit.",
    modules: ["SD", "EWM", "QM", "FI"],
    businessTrigger:
      "Northern Taverns returned 186 KEG from delivery 800009771 after reporting packaging damage.",
    value: "186 KEG / £31,600 gross credit",
    priority: "High",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: [
      "Customer Northern Taverns",
      "Original delivery 800009771",
      "Reference return 600000341",
      "Material FG-AMBER-KEG-50",
    ],
    validations: [
      "Return reason and original billing reference are recorded.",
      "Returned stock remains blocked until inspection disposition.",
      "Credit quantity cannot exceed the accepted return quantity.",
      "Sales returns and output VAT are posted separately.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Create the returns order",
        role: "Customer service agent",
        app: "Manage Sales Orders",
        transactionCode: "VA01",
        instruction:
          "Create returns order 600000341 with reference to the original invoice, enter 186 KEG, and select the packaging-damage return reason.",
        why:
          "Referencing the original sale controls price, tax, quantity, and customer entitlement.",
        result:
          "Returns order 600000341 is blocked for credit until goods inspection.",
        documentType: "Returns sales order",
        documentNumber: "600000341",
        inventoryImpact: "No stock movement until the returned goods arrive.",
        accountingEntries: [],
        controlChecks: [
          "Confirm the original invoice and sold-to customer.",
          "Keep the credit block active pending quality acceptance.",
        ],
      },
      {
        sequence: 2,
        title: "Receive the returned goods",
        role: "Returns warehouse clerk",
        app: "Post Goods Movement",
        transactionCode: "MIGO / 651",
        instruction:
          "Post receipt of 186 KEG into returns blocked stock against the returns delivery and record the returned batch.",
        why:
          "Blocked stock prevents damaged goods from becoming available for customer fulfilment before inspection.",
        result:
          "Material document 5000046290 records the return into blocked stock.",
        documentType: "Material document",
        documentNumber: "5000046290",
        inventoryImpact: "Returns blocked stock increases by 186 KEG.",
        accountingEntries: [
          {
            debit: "Returns inventory",
            credit: "Cost of goods sold",
            amount: "£20,088",
            explanation:
              "Illustrative reversal of the original standard-cost goods issue.",
          },
        ],
        controlChecks: [
          "Count and batch-scan every returned handling unit.",
          "Do not post directly to unrestricted stock.",
        ],
      },
      {
        sequence: 3,
        title: "Inspect and record disposition",
        role: "Quality technician",
        app: "Manage Inspection Lots",
        transactionCode: "QA32",
        instruction:
          "Inspect the packaging condition, record results, and post the usage decision: 170 KEG reworkable and 16 KEG to scrap.",
        why:
          "The usage decision separates recoverable product from stock that cannot safely re-enter circulation.",
        result:
          "Inspection lot 890001486 releases 170 KEG to rework and marks 16 KEG for scrap.",
        documentType: "Inspection lot",
        documentNumber: "890001486",
        inventoryImpact:
          "170 KEG moves to rework stock; 16 KEG is designated for scrap.",
        accountingEntries: [
          {
            debit: "Quality loss expense",
            credit: "Returns inventory",
            amount: "£1,728",
            explanation: "Writes off the 16 KEG rejected at standard cost.",
          },
        ],
        controlChecks: [
          "Inspection evidence must support the usage decision.",
          "Scrap quantity plus rework quantity must equal the received quantity.",
        ],
      },
      {
        sequence: 4,
        title: "Approve the customer credit",
        role: "Sales manager",
        app: "Manage Credit Memo Requests",
        transactionCode: "VKM3",
        instruction:
          "Review the return, inspection evidence, and agreed commercial settlement, then release the credit memo request.",
        why:
          "Approval separates physical receipt from the commercial decision and prevents unsupported credits.",
        result: "Credit memo request 700000918 is approved for £31,600.",
        documentType: "Credit memo request",
        documentNumber: "700000918",
        inventoryImpact: "No additional stock movement.",
        accountingEntries: [],
        controlChecks: [
          "Accepted quantity and settlement must match the approval.",
          "Check for duplicate credits against the original invoice.",
        ],
      },
      {
        sequence: 5,
        title: "Post the credit memo",
        role: "Billing specialist",
        app: "Create Billing Documents",
        transactionCode: "VF01",
        instruction:
          "Create the credit memo from approved request 700000918 and verify revenue, VAT, and customer postings.",
        why:
          "Billing creates the legally and financially recognised customer credit.",
        result: "Credit memo 900001466 reduces the Northern Taverns balance.",
        documentType: "Credit memo",
        documentNumber: "900001466",
        inventoryImpact: "No stock movement; the quality disposition remains separate.",
        accountingEntries: [
          {
            debit: "Sales returns",
            credit: "Customer receivable",
            amount: "£26,333",
            explanation: "Recognises the net commercial return.",
          },
          {
            debit: "Output VAT",
            credit: "Customer receivable",
            amount: "£5,267",
            explanation: "Reverses the VAT element of the original sale.",
          },
        ],
        controlChecks: [
          "The gross customer credit must equal £31,600.",
          "Reconcile the credit memo to the return and inspection lot.",
        ],
      },
    ],
  },
  {
    id: "ADV-ASSET-001",
    type: "Asset Accounting",
    title: "Capitalize wastewater monitoring equipment",
    scenario:
      "Create, acquire, capitalize, and depreciate environmental monitoring equipment installed at BR01.",
    modules: ["FI-AA", "MM", "CO"],
    businessTrigger:
      "Improvement project EVT-2601-031 delivered equipment that is ready for productive use.",
    value: "£46,000 acquisition / 5-year useful life",
    priority: "Medium",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: [
      "Improvement event EVT-2601-031",
      "Plant BR01",
      "Cost centre BR01-UTIL",
      "Asset class ENV-EQUIP",
    ],
    validations: [
      "Asset class, cost centre, and depreciation key are complete.",
      "Capitalization date matches the ready-for-use date.",
      "Acquisition value reconciles to the supplier or project settlement.",
      "Depreciation run posts once for the period.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Create the asset master",
        role: "Asset accountant",
        app: "Manage Fixed Assets",
        transactionCode: "AS01",
        instruction:
          "Create an asset in class ENV-EQUIP for BR01, assign cost centre BR01-UTIL, and enter a five-year useful life with straight-line depreciation.",
        why:
          "The master data controls account determination, ownership, reporting, and depreciation.",
        result: "Asset 400000-0 is created with depreciation key LINR.",
        documentType: "Asset master",
        documentNumber: "400000-0",
        inventoryImpact: "No inventory movement; this creates the accounting object.",
        accountingEntries: [],
        controlChecks: [
          "Confirm asset class and cost centre ownership.",
          "Check useful life and depreciation start convention.",
        ],
      },
      {
        sequence: 2,
        title: "Post the acquisition",
        role: "Accounts payable accountant",
        app: "Post Acquisition with Vendor",
        transactionCode: "F-90",
        instruction:
          "Post the £46,000 supplier acquisition to asset 400000-0 using the approved invoice and ready-for-use date.",
        why:
          "The posting establishes the capitalised acquisition cost and vendor liability.",
        result: "Accounting document 1900007842 capitalizes £46,000.",
        documentType: "Accounting document",
        documentNumber: "1900007842",
        inventoryImpact: "No inventory impact; value is recorded in fixed assets.",
        accountingEntries: [
          {
            debit: "Wastewater monitoring equipment",
            credit: "Supplier payable",
            amount: "£46,000",
            explanation: "Capitalises the equipment and recognises the liability.",
          },
        ],
        controlChecks: [
          "Invoice, purchase approval, and asset number must agree.",
          "Exclude training, maintenance, and other non-capital costs.",
        ],
      },
      {
        sequence: 3,
        title: "Review capitalization and depreciation",
        role: "Asset accountant",
        app: "Asset Values",
        transactionCode: "AW01N",
        instruction:
          "Review the acquisition value, capitalization date, depreciation areas, and planned monthly depreciation for asset 400000-0.",
        why:
          "A pre-run review catches master-data or timing errors before they affect the ledger.",
        result: "Planned depreciation is confirmed at £766.67 per full month.",
        documentType: "Asset value review",
        documentNumber: "AW01N-400000",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [],
        controlChecks: [
          "Acquisition value must be £46,000 in the leading ledger.",
          "Check the first depreciation period against the capitalization date.",
        ],
      },
      {
        sequence: 4,
        title: "Run and post depreciation",
        role: "Financial accountant",
        app: "Schedule Asset Accounting Jobs",
        transactionCode: "AFAB",
        instruction:
          "Execute the depreciation test run, resolve errors, then post the BR01 depreciation run for the current period.",
        why:
          "Periodic depreciation allocates the asset cost over the periods receiving its benefit.",
        result: "Depreciation document 1100003298 posts £766.67.",
        documentType: "Depreciation document",
        documentNumber: "1100003298",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [
          {
            debit: "Environmental equipment depreciation expense",
            credit: "Accumulated depreciation",
            amount: "£766.67",
            explanation: "Records one full month of straight-line depreciation.",
          },
        ],
        controlChecks: [
          "Review the test-run error log before posting.",
          "Confirm the period has not already been posted.",
        ],
      },
    ],
  },
  {
    id: "ADV-TAX-001",
    type: "Tax Adjustment",
    title: "Post VAT adjustment after a supplier credit",
    scenario:
      "Correct an overstated fuel surcharge and reduce both expense and recoverable input VAT.",
    modules: ["FI-AP", "FI-GL", "Tax"],
    businessTrigger:
      "A supplier issued a £6,240 gross credit for a duplicated £5,200 surcharge plus £1,040 VAT.",
    value: "£5,200 net / £1,040 VAT / £6,240 gross",
    priority: "High",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: [
      "Supplier GreenFuel Logistics",
      "Original invoice 5100018824",
      "Tax code V1 (20% input VAT)",
      "Company code BCB1",
    ],
    validations: [
      "Supplier credit references the original invoice.",
      "Net and VAT amounts use the original tax code.",
      "The adjustment appears in the correct VAT return period.",
      "The supplier open item is cleared or remains traceable.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Validate the supplier credit",
        role: "Accounts payable accountant",
        app: "Manage Supplier Invoices",
        transactionCode: "MIR4",
        instruction:
          "Compare the credit note to invoice 5100018824, confirm £5,200 net and £1,040 VAT, and document the duplicate surcharge reason.",
        why:
          "The original document and tax treatment determine whether the credit is complete and legally supportable.",
        result: "Credit note CN-88471 is approved for posting.",
        documentType: "Supplier credit note",
        documentNumber: "CN-88471",
        inventoryImpact: "No quantity impact; this corrects a logistics expense.",
        accountingEntries: [],
        controlChecks: [
          "Supplier, currency, tax code, and original invoice must match.",
          "Check that no prior credit has already corrected the surcharge.",
        ],
      },
      {
        sequence: 2,
        title: "Post the supplier credit",
        role: "Accounts payable accountant",
        app: "Create Supplier Invoice",
        transactionCode: "FB65",
        instruction:
          "Post the £6,240 gross credit with tax code V1 and reference invoice 5100018824.",
        why:
          "The credit reduces the supplier liability, expense, and recoverable input VAT using the original tax basis.",
        result: "Accounting document 1700009916 posts the correction.",
        documentType: "Accounting document",
        documentNumber: "1700009916",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [
          {
            debit: "Supplier payable",
            credit: "Fuel surcharge expense",
            amount: "£5,200",
            explanation: "Reduces the amount owed and reverses the duplicate expense.",
          },
          {
            debit: "Supplier payable",
            credit: "Recoverable input VAT",
            amount: "£1,040",
            explanation: "Reduces the VAT recoverable from the tax authority.",
          },
        ],
        controlChecks: [
          "The posting must balance to £6,240.",
          "Use the same 20% input VAT tax code as the original invoice.",
        ],
      },
      {
        sequence: 3,
        title: "Reconcile the VAT adjustment",
        role: "Tax accountant",
        app: "Display Tax Items",
        transactionCode: "FBL3N / VAT return",
        instruction:
          "Verify that the £1,040 credit appears in the input VAT account and the correct VAT reporting period, then attach the supporting credit note.",
        why:
          "Tax-account reconciliation ensures the ledger, source evidence, and statutory return agree.",
        result: "VAT evidence pack VAT-2026-06-ADJ-04 is complete.",
        documentType: "VAT reconciliation evidence",
        documentNumber: "VAT-2026-06-ADJ-04",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [],
        controlChecks: [
          "Ledger VAT movement must equal the tax-document value.",
          "Confirm the credit is not reported in two VAT periods.",
        ],
      },
    ],
  },
  {
    id: "ADV-YEC-001",
    type: "Year-End Close",
    title: "Execute the FY2025-2026 year-end close",
    scenario:
      "Run a controlled financial close across inventory, assets, tax, valuation, and general ledger reporting.",
    modules: ["FI", "CO", "MM", "FI-AA", "Tax"],
    businessTrigger:
      "The March 2026 accounting period is complete and BCB1 must issue its annual financial statements.",
    value: "Company code BCB1 / FY2025-2026",
    priority: "High",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: [
      "Company code BCB1",
      "Fiscal year FY2025-2026",
      "Asset 400000-0",
      "VAT evidence VAT-2026-06-ADJ-04",
    ],
    validations: [
      "Subledgers reconcile to their control accounts.",
      "Inventory count differences and provisions are approved.",
      "Depreciation and foreign-currency valuation are complete.",
      "Posting periods close only after all sign-offs.",
      "Balance carryforward agrees to the final trial balance.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Reconcile subledgers",
        role: "Financial accountant",
        app: "Reconcile GR/IR and Subledgers",
        transactionCode: "FBL1N / FBL5N / MB5S",
        instruction:
          "Reconcile supplier, customer, GR/IR, and bank balances to their general-ledger control accounts and resolve unexplained differences.",
        why:
          "Year-end statements are unreliable when detailed ledgers do not agree to the general ledger.",
        result: "Close task YEC-01 is signed off with no unexplained difference.",
        documentType: "Close evidence",
        documentNumber: "YEC-2026-01",
        inventoryImpact: "No direct movement.",
        accountingEntries: [],
        controlChecks: [
          "Control accounts must not contain unsupported manual postings.",
          "Age and explain every unreconciled item.",
        ],
      },
      {
        sequence: 2,
        title: "Finalize inventory valuation",
        role: "Inventory accountant",
        app: "Manage Physical Inventory",
        transactionCode: "MI07 / MRN9",
        instruction:
          "Post approved count differences, review slow-moving stock, and record the year-end inventory provision.",
        why:
          "Physical quantities and recoverable value must both be reflected at the reporting date.",
        result:
          "Inventory adjustment document 4900006198 and provision document 100004218 are posted.",
        documentType: "Inventory close documents",
        documentNumber: "4900006198 / 100004218",
        inventoryImpact:
          "Book quantity is aligned to count results and impaired stock remains separately identifiable.",
        accountingEntries: [
          {
            debit: "Inventory impairment expense",
            credit: "Inventory provision",
            amount: "£18,400",
            explanation: "Records the approved slow-moving stock provision.",
          },
        ],
        controlChecks: [
          "Count differences require independent approval.",
          "Provision logic must be consistent with the approved policy.",
        ],
      },
      {
        sequence: 3,
        title: "Complete asset depreciation",
        role: "Asset accountant",
        app: "Schedule Asset Accounting Jobs",
        transactionCode: "AFAB / AJAB",
        instruction:
          "Run the final-period depreciation test and posting, review the asset history sheet, and execute fiscal-year change checks.",
        why:
          "All capital assets must carry complete depreciation before the asset year is closed.",
        result: "Asset close evidence YEC-2026-AA confirms all periods posted.",
        documentType: "Asset close evidence",
        documentNumber: "YEC-2026-AA",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [
          {
            debit: "Depreciation expense",
            credit: "Accumulated depreciation",
            amount: "£214,760",
            explanation: "Posts the final scheduled depreciation for BCB1.",
          },
        ],
        controlChecks: [
          "No asset may show an incomplete depreciation run.",
          "Review acquisitions under construction and retirements.",
        ],
      },
      {
        sequence: 4,
        title: "Post foreign-currency valuation",
        role: "Financial accountant",
        app: "Perform Foreign Currency Valuation",
        transactionCode: "FAGL_FCV",
        instruction:
          "Value open foreign-currency customer, supplier, and bank items using the approved closing rates and review the simulation before posting.",
        why:
          "Closing-rate valuation states monetary balances at the reporting-date exchange rate.",
        result: "Valuation document 1200004431 records a £7,920 net loss.",
        documentType: "Valuation document",
        documentNumber: "1200004431",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [
          {
            debit: "Unrealised foreign-exchange loss",
            credit: "Foreign-currency valuation adjustment",
            amount: "£7,920",
            explanation: "Records the net reporting-date valuation loss.",
          },
        ],
        controlChecks: [
          "Confirm rate type and valuation date.",
          "Review material differences before posting the valuation run.",
        ],
      },
      {
        sequence: 5,
        title: "Reconcile tax and close periods",
        role: "Tax and finance manager",
        app: "Manage Posting Periods",
        transactionCode: "OB52",
        instruction:
          "Reconcile VAT and corporation-tax accounts, confirm all close owners have signed off, then restrict the FY2025-2026 posting periods.",
        why:
          "Period control prevents late postings from changing approved year-end balances.",
        result: "Period-control evidence YEC-2026-05 locks routine posting.",
        documentType: "Period close evidence",
        documentNumber: "YEC-2026-05",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [],
        controlChecks: [
          "Keep exceptional posting access limited and logged.",
          "Tax accounts must reconcile to filed or approved schedules.",
        ],
      },
      {
        sequence: 6,
        title: "Carry forward and publish statements",
        role: "Financial controller",
        app: "Balance Carryforward and Financial Statements",
        transactionCode: "FAGLGVTR / F.01",
        instruction:
          "Run balance carryforward, compare opening balances to the final trial balance, and generate the approved balance sheet and income statement.",
        why:
          "Carryforward establishes the next fiscal year while the statements provide the final reporting output.",
        result: "Financial statement pack FS-BCB1-2026 is approved.",
        documentType: "Financial statement pack",
        documentNumber: "FS-BCB1-2026",
        inventoryImpact: "No physical movement; closing balances become opening balances.",
        accountingEntries: [],
        controlChecks: [
          "Opening balance sheet accounts must equal prior-year closing balances.",
          "Retained earnings must agree to the final income statement result.",
        ],
      },
    ],
  },
  {
    id: "ADV-ICO-001",
    type: "Intercompany Sale",
    title: "Fulfil a cross-company customer order",
    scenario:
      "BCB1 sells to a national customer while affiliate company BCD1 supplies and invoices the stock across company-code boundaries.",
    modules: ["SD", "MM", "TM", "FI", "CO-PA"],
    businessTrigger:
      "The customer delivery promise can only be met from affiliate distribution stock.",
    value: "480 KEG / £71,040 external revenue",
    priority: "High",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: [
      "Selling company BCB1",
      "Delivering company BCD1",
      "Customer order 182991",
      "Intercompany price condition PI01",
    ],
    validations: [
      "Selling and delivering company codes are derived correctly.",
      "External and intercompany invoices reference the same delivery.",
      "Intercompany revenue and cost eliminate in consolidation.",
      "Customer receivable remains in the selling company.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Create and validate the cross-company order",
        role: "Sales operations specialist",
        app: "Manage Sales Orders",
        transactionCode: "VA01",
        instruction:
          "Create order 182991 in BCB1, confirm BCD1 as delivering plant owner, and validate route, ATP, tax, and intercompany pricing prerequisites.",
        why:
          "Correct organizational derivation controls which company owns the customer and which company supplies the goods.",
        result: "Order 182991 confirms 480 KEG from the affiliate plant.",
        documentType: "Sales order",
        documentNumber: "182991",
        inventoryImpact: "BCD1 stock is allocated; no goods movement is posted.",
        accountingEntries: [],
        controlChecks: [
          "Confirm customer sales area belongs to BCB1.",
          "Confirm the delivering plant is assigned to BCD1.",
        ],
      },
      {
        sequence: 2,
        title: "Deliver and post goods issue",
        role: "Affiliate shipping coordinator",
        app: "Run Outbound Process",
        transactionCode: "VL02N",
        instruction:
          "Pick the confirmed batches, complete transport staging, and post goods issue for delivery 800012508 from BCD1.",
        why:
          "Goods issue records the supplying company inventory and cost impact while preserving the customer-order reference.",
        result: "Material document 4900006288 posts the affiliate goods issue.",
        documentType: "Outbound delivery",
        documentNumber: "800012508",
        inventoryImpact: "BCD1 finished-goods inventory decreases by 480 KEG.",
        accountingEntries: [
          {
            debit: "BCD1 cost of intercompany sales",
            credit: "BCD1 finished goods inventory",
            amount: "£51,840",
            explanation: "Records the supplying company standard cost at goods issue.",
          },
        ],
        controlChecks: [
          "Picking and batch quantities must match the delivery.",
          "The delivery must retain order and company-code references.",
        ],
      },
      {
        sequence: 3,
        title: "Create external and intercompany billing",
        role: "Intercompany billing accountant",
        app: "Create Billing Documents",
        transactionCode: "VF01 / IV",
        instruction:
          "Create the BCB1 customer invoice and the BCD1 intercompany invoice, then reconcile delivery quantity, transfer price, tax, and company postings.",
        why:
          "Dual billing recognizes the external customer sale and the internal supply relationship without duplicating the customer receivable.",
        result: "Customer invoice 900001592 and intercompany invoice 910000244 are posted.",
        documentType: "Billing documents",
        documentNumber: "900001592 / 910000244",
        inventoryImpact: "No further quantity movement.",
        accountingEntries: [
          { debit: "Customer receivable", credit: "BCB1 external revenue", amount: "£71,040", explanation: "Records the customer-facing sale." },
          { debit: "BCB1 intercompany cost", credit: "BCD1 intercompany revenue", amount: "£58,320", explanation: "Records the governed affiliate transfer price." },
        ],
        controlChecks: [
          "Both invoices must reference delivery 800012508.",
          "Intercompany balances must reconcile and eliminate in consolidation.",
        ],
      },
    ],
  },
  {
    id: "ADV-COST-001",
    type: "Product Costing",
    title: "Release the annual standard cost estimate",
    scenario:
      "Cost the revised Amber Ale recipe, analyse quantity and price changes, and release the approved standard price for the new fiscal year.",
    modules: ["CO-PC", "PP", "MM", "FI"],
    businessTrigger:
      "A recipe revision and supplier-price increase require the FY2026-2027 standard cost update.",
    value: "£112.40 proposed standard cost per KEG",
    priority: "High",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: ["Material FG-AMBER-KEG-50", "BOM BOM-FG-AMBER", "Routing RTG-AMBER-01", "Plant BR01"],
    validations: [
      "BOM, routing, activity prices, and purchasing prices are valid on the costing date.",
      "Cost component split reconciles to the calculated standard cost.",
      "Marked cost is independently approved before release.",
      "Inventory revaluation posts once at period open.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Calculate the cost estimate",
        role: "Product cost accountant",
        app: "Create Material Cost Estimates",
        transactionCode: "CK11N",
        instruction:
          "Cost FG-AMBER-KEG-50 at BR01 using the approved costing variant, FY2026-2027 quantity structure, and current activity and purchasing prices.",
        why: "The calculation rolls material, labour, machine, overhead, and packaging assumptions into one traceable unit cost.",
        result: "Cost estimate CE-260701 calculates £112.40 per KEG.",
        documentType: "Material cost estimate",
        documentNumber: "CE-260701",
        inventoryImpact: "No valuation change until release.",
        accountingEntries: [],
        controlChecks: ["Resolve missing-price and quantity-structure messages.", "Review lot size and costing dates."],
      },
      {
        sequence: 2,
        title: "Analyse and mark the approved cost",
        role: "Costing manager",
        app: "Edit Costing Runs",
        transactionCode: "CK40N",
        instruction:
          "Compare the component split to the prior standard, document the malt, packaging, and activity-rate drivers, then mark the approved estimate.",
        why: "Marking separates managerial approval from the financial release that changes inventory valuation.",
        result: "Costing run CR-BR01-2607 is marked for release.",
        documentType: "Costing run",
        documentNumber: "CR-BR01-2607",
        inventoryImpact: "Future standard price is staged; current inventory remains unchanged.",
        accountingEntries: [],
        controlChecks: ["Explain all material component changes above 5%.", "Confirm the release period is not closed."],
      },
      {
        sequence: 3,
        title: "Release and reconcile inventory revaluation",
        role: "Financial controller",
        app: "Release Standard Cost Estimates",
        transactionCode: "CK24",
        instruction:
          "Release the marked estimate, verify the material master standard price, and reconcile the resulting inventory revaluation posting.",
        why: "Release makes the approved unit cost effective for inventory valuation and future production variances.",
        result: "FG-AMBER-KEG-50 is released at £112.40 with revaluation document 130000874.",
        documentType: "Price release document",
        documentNumber: "130000874",
        inventoryImpact: "Existing BR01 inventory is revalued to the new standard price.",
        accountingEntries: [
          { debit: "Finished goods inventory", credit: "Inventory revaluation gain", amount: "£38,720", explanation: "Illustrative increase from the prior released standard." },
        ],
        controlChecks: ["Release only the approved costing run.", "Reconcile material master, cost estimate, and FI document."],
      },
    ],
  },
  {
    id: "ADV-MAINT-001",
    type: "Maintenance Settlement",
    title: "Settle a brewery overhaul order",
    scenario:
      "Complete technical closure, analyse actual overhaul cost, and settle an approved maintenance order to its responsible cost centre and asset.",
    modules: ["PM", "CO", "MM", "FI-AA"],
    businessTrigger: "Annual filler overhaul order 40007184 is technically complete and ready for month-end settlement.",
    value: "£84,600 actual overhaul cost",
    priority: "Medium",
    status: "Not started",
    currentStep: 1,
    completedSteps: [],
    objectReferences: ["Maintenance order 40007184", "Equipment PKG-FILL-02", "Cost centre BR01-PACK", "Asset 300184-0"],
    validations: [
      "Confirmations, goods issues, services, and invoices are complete.",
      "Open commitments are resolved before technical completion.",
      "Settlement rule totals 100% and uses approved receivers.",
      "Order balance is zero after settlement.",
    ],
    auditTrail: [],
    allowedActions: ["complete-step"],
    steps: [
      {
        sequence: 1,
        title: "Review technical and commercial completion",
        role: "Maintenance planner",
        app: "Manage Maintenance Orders",
        transactionCode: "IW32",
        instruction: "Review confirmations, materials, external services, invoices, notifications, and commitments before setting order 40007184 to technically complete.",
        why: "Technical completion stops routine processing and confirms the equipment history is complete before financial close.",
        result: "Order 40007184 is technically complete with no open commitment.",
        documentType: "Maintenance order",
        documentNumber: "40007184",
        inventoryImpact: "All issued spare parts remain consumed by the order.",
        accountingEntries: [],
        controlChecks: ["Verify final confirmation and malfunction end time.", "Resolve purchase requisitions and open service entries."],
      },
      {
        sequence: 2,
        title: "Analyse actual cost and settlement rule",
        role: "Maintenance controller",
        app: "Display Actual Costs",
        transactionCode: "KOB1 / IW33",
        instruction: "Reconcile labour, material, service, and overhead actuals, then validate the approved split between expense cost centre BR01-PACK and capital asset 300184-0.",
        why: "The settlement rule determines which costs remain period expense and which qualifying improvement costs are capitalized.",
        result: "£61,600 is assigned to expense and £23,000 to the asset receiver.",
        documentType: "Settlement rule",
        documentNumber: "SR-40007184",
        inventoryImpact: "No inventory movement.",
        accountingEntries: [],
        controlChecks: ["Capitalized scope must meet accounting policy.", "Receiver percentages must total 100%."],
      },
      {
        sequence: 3,
        title: "Execute settlement and close the order",
        role: "Cost accountant",
        app: "Settle Orders",
        transactionCode: "KO88",
        instruction: "Run settlement in test mode, resolve errors, post the settlement, verify the zero order balance, and complete financial closure.",
        why: "Settlement transfers accumulated order cost to its final financial owners and prevents duplicate period carryover.",
        result: "Settlement document 140000392 clears order 40007184.",
        documentType: "Settlement document",
        documentNumber: "140000392",
        inventoryImpact: "No physical stock movement.",
        accountingEntries: [
          { debit: "BR01-PACK maintenance expense", credit: "Maintenance order settlement", amount: "£61,600", explanation: "Settles routine overhaul cost to the responsible cost centre." },
          { debit: "Packaging equipment asset", credit: "Maintenance order settlement", amount: "£23,000", explanation: "Capitalizes the approved improvement component." },
        ],
        controlChecks: ["Review test-run messages before posting.", "Confirm order balance and residual commitments are zero."],
      },
    ],
  },
];
