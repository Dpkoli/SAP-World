import "server-only";

import type { MentorResponse } from "@/data/mentor";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const defaultTimeoutMs = 8000;

function providerConfig() {
  const endpoint = process.env.SAP_WORLD_AI_ENDPOINT?.trim();
  const apiKey = process.env.SAP_WORLD_AI_API_KEY?.trim();
  const model = process.env.SAP_WORLD_AI_MODEL?.trim();
  const timeoutMs = Number(process.env.SAP_WORLD_AI_TIMEOUT_MS);

  if (!endpoint || !apiKey || !model) {
    return null;
  }

  return {
    endpoint,
    apiKey,
    model,
    timeoutMs:
      Number.isFinite(timeoutMs) && timeoutMs > 1000
        ? Math.min(Math.trunc(timeoutMs), 30000)
        : defaultTimeoutMs,
  };
}

export function getMentorProviderStatus() {
  const config = providerConfig();
  const endpointConfigured = Boolean(process.env.SAP_WORLD_AI_ENDPOINT?.trim());
  const apiKeyConfigured = Boolean(process.env.SAP_WORLD_AI_API_KEY?.trim());
  const model = process.env.SAP_WORLD_AI_MODEL?.trim() || null;

  return {
    mode: config ? "external" as const : "local" as const,
    configured: Boolean(config),
    endpointConfigured,
    apiKeyConfigured,
    model,
    timeoutMs: config?.timeoutMs ?? defaultTimeoutMs,
  };
}

function evidenceSummary(response: MentorResponse) {
  return response.sources
    .map(
      (source, index) =>
        `${index + 1}. ${source.type}: ${source.title} (${source.reference})`,
    )
    .join("\n");
}

export async function enhanceMentorResponse(input: {
  question: string;
  localResponse: MentorResponse;
}): Promise<MentorResponse> {
  const config = providerConfig();
  if (!config) {
    return { ...input.localResponse, provider: "local" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are the SAP World mentor. Rewrite the provided grounded answer so it is clearer and easier for a learner to follow. Do not add facts, numbers, SAP objects, postings, or process steps that are not present in the grounded answer or evidence list. If evidence is insufficient, keep the refusal.",
          },
          {
            role: "user",
            content: [
              `Learner question: ${input.question}`,
              `Grounded answer: ${input.localResponse.answer}`,
              `Evidence list:\n${evidenceSummary(input.localResponse)}`,
              "Return only the final answer text.",
            ].join("\n\n"),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ...input.localResponse,
        provider: "local",
        fallbackReason: `External mentor returned HTTP ${response.status}.`,
      };
    }

    const result = (await response.json()) as ChatCompletionResponse;
    const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return {
        ...input.localResponse,
        provider: "local",
        fallbackReason: "External mentor returned an empty answer.",
      };
    }

    return {
      ...input.localResponse,
      answer,
      provider: "external",
      model: config.model,
    };
  } catch (error) {
    return {
      ...input.localResponse,
      provider: "local",
      fallbackReason:
        error instanceof Error
          ? `External mentor unavailable: ${error.message}`
          : "External mentor unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
