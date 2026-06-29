import type { MentorSource } from "@/data/mentor";

export type MentorQualityCheck = {
  id: "grounding" | "sources" | "response-length" | "sensitive-content";
  status: "Pass" | "Warning";
  evidence: string;
};

export type MentorExchange = {
  id: string;
  askedAt: string;
  answeredAt: string;
  scenarioId: string;
  step: number | null;
  question: string;
  answer: string;
  sources: MentorSource[];
  provider: "local" | "external";
  model: string | null;
  fallbackReason: string | null;
  quality: {
    status: "Passed" | "Review required";
    checks: MentorQualityCheck[];
  };
  feedback: {
    rating: "helpful" | "needs-review";
    note: string;
    recordedAt: string;
  } | null;
};

export type MentorConversation = {
  id: string;
  learnerId: string;
  scenarioId: string;
  createdAt: string;
  updatedAt: string;
  exchanges: MentorExchange[];
};

export type MentorConversationView = Omit<MentorConversation, "learnerId">;
