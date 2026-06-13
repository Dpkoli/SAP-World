import type { ScenarioId } from "@/data/progress";

export type MentorSource = {
  id: string;
  type:
    | "Process"
    | "Tutor"
    | "Exception"
    | "History"
    | "Enterprise"
    | "Master Data"
    | "Workflow"
    | "Analytics";
  title: string;
  reference: string;
};

export type MentorResponse = {
  answer: string;
  sources: MentorSource[];
  suggestions: string[];
  grounded: true;
};

export const mentorSuggestions: Record<ScenarioId, string[]> = {
  p2p: [
    "Why is the stock in quality inspection?",
    "What accounting entry was created?",
    "Why would an invoice be blocked?",
  ],
  o2c: [
    "When does cost of goods sold post?",
    "Why would a sales order be credit blocked?",
    "What happens after delivery creation?",
  ],
  ptp: [
    "Why did MRP create this planned order?",
    "When are production costs posted?",
    "Why can a production order fail release?",
  ],
  r2r: [
    "Why do we post an accrual?",
    "Why are production orders settled?",
    "What causes an aged GR/IR balance?",
  ],
  qm: [
    "Why is a usage decision required?",
    "What happens when a result fails?",
    "Does the quality stock transfer create value?",
  ],
  pm: [
    "Why create a maintenance order from a notification?",
    "When do maintenance costs post?",
    "What happens when a critical spare is unavailable?",
  ],
  h2r: [
    "Why is organizational assignment important?",
    "How does payroll affect finance?",
    "Why can payroll posting fail?",
  ],
  w2d: [
    "When does warehouse stock leave inventory?",
    "Why can goods issue be blocked?",
    "How do handling units support dispatch?",
  ],
};
