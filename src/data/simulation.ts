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
};
