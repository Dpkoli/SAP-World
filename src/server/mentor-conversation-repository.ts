import "server-only";

import { randomUUID } from "node:crypto";

import type {
  MentorConversation,
  MentorConversationView,
  MentorExchange,
  MentorQualityCheck,
} from "@/data/mentor-conversations";
import type { MentorResponse } from "@/data/mentor";
import { createDurableStore } from "@/server/durable-store";

type MentorConversationDatabase = {
  version: 1;
  conversations: Record<string, MentorConversation>;
};

function emptyDatabase(): MentorConversationDatabase {
  return { version: 1, conversations: {} };
}

function isMentorConversationDatabase(
  value: unknown,
): value is MentorConversationDatabase {
  const candidate = value as Partial<MentorConversationDatabase> | null;
  return Boolean(
    candidate?.version === 1 &&
      candidate.conversations &&
      typeof candidate.conversations === "object",
  );
}

const conversationStore = createDurableStore<MentorConversationDatabase>({
  key: "mentor-conversations",
  fileName: "mentor-conversations.json",
  empty: emptyDatabase,
  validate: isMentorConversationDatabase,
});

function conversationKey(learnerId: string, scenarioId: string) {
  return `${learnerId}:${scenarioId}`;
}

function publicConversation(
  conversation: MentorConversation,
): MentorConversationView {
  return {
    id: conversation.id,
    scenarioId: conversation.scenarioId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    exchanges: conversation.exchanges,
  };
}

function redactSensitiveText(value: string) {
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, "Bearer [redacted]")
    .replace(
      /\b(api[_ -]?key|password|secret|token)\s*[:=]\s*[^\s,;]{6,}/gi,
      "$1=[redacted]",
    );
}

function qualityChecks(response: MentorResponse): MentorQualityCheck[] {
  const sensitivePattern =
    /\b(password|api[_ -]?key|client[_ -]?secret)\s*[:=]\s*[^\s,;]{6,}/i;
  return [
    {
      id: "grounding",
      status: response.grounded ? "Pass" : "Warning",
      evidence: response.grounded
        ? "Answer remained bound to SAP World evidence."
        : "The response was not marked as grounded.",
    },
    {
      id: "sources",
      status: response.sources.length > 0 ? "Pass" : "Warning",
      evidence: `${response.sources.length} evidence sources were retained.`,
    },
    {
      id: "response-length",
      status: response.answer.length <= 2400 ? "Pass" : "Warning",
      evidence: `${response.answer.length} answer characters were produced.`,
    },
    {
      id: "sensitive-content",
      status: sensitivePattern.test(response.answer) ? "Warning" : "Pass",
      evidence: sensitivePattern.test(response.answer)
        ? "The answer may contain credential-like content and requires review."
        : "No credential-like content was detected.",
    },
  ];
}

export async function getMentorConversation(
  learnerId: string,
  scenarioId: string,
) {
  const database = await conversationStore.read();
  const conversation = database.conversations[
    conversationKey(learnerId, scenarioId)
  ];
  return conversation ? publicConversation(conversation) : null;
}

export async function recordMentorExchange(input: {
  learnerId: string;
  scenarioId: string;
  step: number | null;
  question: string;
  response: MentorResponse;
}) {
  const answeredAt = new Date().toISOString();
  const checks = qualityChecks(input.response);
  const exchange: MentorExchange = {
    id: randomUUID(),
    askedAt: answeredAt,
    answeredAt,
    scenarioId: input.scenarioId,
    step: input.step,
    question: redactSensitiveText(input.question),
    answer: redactSensitiveText(input.response.answer).slice(0, 4000),
    sources: input.response.sources,
    provider: input.response.provider === "external" ? "external" : "local",
    model: input.response.model ?? null,
    fallbackReason: input.response.fallbackReason ?? null,
    quality: {
      status: checks.every((check) => check.status === "Pass")
        ? "Passed"
        : "Review required",
      checks,
    },
    feedback: null,
  };

  return conversationStore.update((database) => {
    const key = conversationKey(input.learnerId, input.scenarioId);
    const current = database.conversations[key];
    const conversation: MentorConversation = current ?? {
      id: randomUUID(),
      learnerId: input.learnerId,
      scenarioId: input.scenarioId,
      createdAt: answeredAt,
      updatedAt: answeredAt,
      exchanges: [],
    };
    conversation.updatedAt = answeredAt;
    conversation.exchanges = [exchange, ...conversation.exchanges].slice(0, 50);
    database.conversations[key] = conversation;
    return {
      conversation: publicConversation(conversation),
      exchange,
    };
  });
}

export async function recordMentorFeedback(input: {
  learnerId: string;
  messageId: string;
  rating: "helpful" | "needs-review";
  note: string;
}) {
  return conversationStore.update((database) => {
    const conversation = Object.values(database.conversations).find(
      (candidate) =>
        candidate.learnerId === input.learnerId &&
        candidate.exchanges.some((exchange) => exchange.id === input.messageId),
    );
    if (!conversation) return null;
    const exchange = conversation.exchanges.find(
      (candidate) => candidate.id === input.messageId,
    );
    if (!exchange) return null;
    exchange.feedback = {
      rating: input.rating,
      note: redactSensitiveText(input.note).slice(0, 500),
      recordedAt: new Date().toISOString(),
    };
    conversation.updatedAt = exchange.feedback.recordedAt;
    return publicConversation(conversation);
  });
}

export async function getMentorAdministrationStats() {
  const database = await conversationStore.read();
  const conversations = Object.values(database.conversations);
  const exchanges = conversations.flatMap(
    (conversation) => conversation.exchanges,
  );
  return {
    conversations: conversations.length,
    exchanges: exchanges.length,
    externallyEnhanced: exchanges.filter(
      (exchange) => exchange.provider === "external",
    ).length,
    localFallbacks: exchanges.filter((exchange) => exchange.fallbackReason)
      .length,
    reviewRequired: exchanges.filter(
      (exchange) => exchange.quality.status === "Review required",
    ).length,
    helpfulRatings: exchanges.filter(
      (exchange) => exchange.feedback?.rating === "helpful",
    ).length,
    reviewRatings: exchanges.filter(
      (exchange) => exchange.feedback?.rating === "needs-review",
    ).length,
    latestActivityAt:
      conversations.map((conversation) => conversation.updatedAt).sort().at(-1) ??
      null,
  };
}
