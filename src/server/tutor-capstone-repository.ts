import { randomUUID } from "node:crypto";

import type { ScenarioId } from "@/data/progress";
import { processScenarios } from "@/data/simulation";
import { createDurableStore } from "@/server/durable-store";
import {
  buildTutorCapstoneReview,
  type TutorCapstoneChallenge,
  type TutorCapstoneReview,
} from "@/server/tutor-capstone-service";
import type { LearnerProgress } from "@/data/progress";

export type TutorCapstoneSubmission = {
  id: string;
  scenarioId: ScenarioId;
  submittedAt: string;
  response: string;
  score: number;
  status: "Needs practice" | "Review ready" | "Strong evidence";
  feedback: string[];
  rubricScores: Array<{
    area: string;
    points: number;
    awarded: number;
    feedback: string;
  }>;
};

type CapstoneSubmissionStore = Record<
  string,
  Record<ScenarioId, TutorCapstoneSubmission[]>
>;

export type TutorCapstonePortfolio = Omit<TutorCapstoneReview, "challenges"> & {
  submissions: {
    total: number;
    reviewReady: number;
    latestSubmittedAt: string | null;
  };
  challenges: Array<
    TutorCapstoneChallenge & {
      latestSubmission: TutorCapstoneSubmission | null;
      submissions: number;
    }
  >;
};

function isCapstoneSubmissionStore(
  value: unknown,
): value is CapstoneSubmissionStore {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const capstoneStore = createDurableStore<CapstoneSubmissionStore>({
  key: "tutor-capstone-submissions",
  fileName: "tutor-capstone-submissions.json",
  empty: () => ({}),
  validate: isCapstoneSubmissionStore,
});

function includesAny(response: string, terms: string[]) {
  const normalized = response.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function scoreSubmission(
  challenge: TutorCapstoneChallenge,
  response: string,
): Omit<TutorCapstoneSubmission, "id" | "scenarioId" | "submittedAt" | "response"> {
  const words = response.trim().split(/\s+/).filter(Boolean).length;
  const normalizedEvidence = challenge.requiredEvidence.join(" ");
  const evidenceTerms = [
    challenge.processCode,
    ...challenge.requiredEvidence.flatMap((item) =>
      item
        .split(/[^A-Za-z0-9/-]+/)
        .filter((term) => term.length >= 4)
        .slice(0, 3),
    ),
  ];

  const rubricScores = challenge.rubric.map((rubric) => {
    const area = rubric.area.toLowerCase();
    let ratio = 0;
    if (area.includes("transaction")) {
      ratio =
        includesAny(response, [challenge.processCode, "transaction", "app"]) &&
        includesAny(response, evidenceTerms)
          ? 1
          : 0.45;
    } else if (area.includes("document")) {
      ratio = includesAny(response, ["document", "flow", "upstream", "downstream"])
        ? 1
        : 0.35;
    } else if (area.includes("impact")) {
      ratio = includesAny(response, ["inventory", "accounting", "operational", "financial"])
        ? 1
        : 0.35;
    } else {
      ratio = includesAny(response, ["exception", "root cause", "recovery", "correct"])
        ? 1
        : 0.35;
    }

    if (words < 80) ratio *= 0.55;
    if (!includesAny(response, normalizedEvidence.split(/\s+/).slice(0, 16))) {
      ratio *= 0.85;
    }

    const awarded = Math.round(rubric.points * Math.min(1, ratio));
    return {
      area: rubric.area,
      points: rubric.points,
      awarded,
      feedback:
        awarded >= Math.round(rubric.points * 0.8)
          ? "Evidence is strong enough for mentor review."
          : "Add more specific SAP evidence and business impact explanation.",
    };
  });

  const score = rubricScores.reduce((total, rubric) => total + rubric.awarded, 0);
  const status =
    score >= 85
      ? "Strong evidence"
      : score >= 70
        ? "Review ready"
        : "Needs practice";

  return {
    score,
    status,
    rubricScores,
    feedback: [
      status === "Needs practice"
        ? "Strengthen the answer before mentor review."
        : "Submission is ready for mentor or manager discussion.",
      words < 80
        ? "Use a fuller explanation with the SAP document chain, postings, and exception recovery."
        : "Response length is sufficient for assessment review.",
      `Reference at least three evidence points from ${challenge.processCode}.`,
    ],
  };
}

function mergePortfolio(
  review: TutorCapstoneReview,
  submissions: Record<ScenarioId, TutorCapstoneSubmission[]> | undefined,
): TutorCapstonePortfolio {
  const challenges = review.challenges.map((challenge) => {
    const history = submissions?.[challenge.scenarioId] ?? [];
    return {
      ...challenge,
      latestSubmission: history.at(-1) ?? null,
      submissions: history.length,
    };
  });
  const allSubmissions = Object.values(submissions ?? {}).flat();

  return {
    ...review,
    submissions: {
      total: allSubmissions.length,
      reviewReady: allSubmissions.filter(
        (submission) => submission.status !== "Needs practice",
      ).length,
      latestSubmittedAt:
        allSubmissions
          .map((submission) => submission.submittedAt)
          .sort()
          .at(-1) ?? null,
    },
    challenges,
  };
}

export async function getTutorCapstonePortfolio(
  learnerId: string,
  progress: LearnerProgress,
) {
  const review = buildTutorCapstoneReview(progress);
  const store = await capstoneStore.read();
  return mergePortfolio(review, store[learnerId]);
}

export async function submitTutorCapstone(input: {
  learnerId: string;
  progress: LearnerProgress;
  scenarioId: ScenarioId;
  response: string;
}) {
  if (!processScenarios.some((scenario) => scenario.id === input.scenarioId)) {
    throw new Error("Capstone challenge not found.");
  }

  return capstoneStore.update((store) => {
    const review = buildTutorCapstoneReview(input.progress);
    const challenge = review.challenges.find(
      (item) => item.scenarioId === input.scenarioId,
    );
    if (!challenge) {
      throw new Error("Capstone challenge not found.");
    }
    if (challenge.status === "Locked") {
      throw new Error("Complete readiness actions before submitting this capstone.");
    }

    const scored = scoreSubmission(challenge, input.response);
    const submission: TutorCapstoneSubmission = {
      id: randomUUID(),
      scenarioId: input.scenarioId,
      submittedAt: new Date().toISOString(),
      response: input.response,
      ...scored,
    };

    const learnerSubmissions = store[input.learnerId] ?? {};
    const history = learnerSubmissions[input.scenarioId] ?? [];
    store[input.learnerId] = {
      ...learnerSubmissions,
      [input.scenarioId]: [...history, submission],
    };

    return mergePortfolio(review, store[input.learnerId]);
  });
}

export async function getTutorCapstoneAdministrationStats() {
  const store = await capstoneStore.read();
  const learnerEntries = Object.entries(store);
  const submissions = learnerEntries.flatMap(([learnerId, scenarios]) =>
    Object.entries(scenarios).flatMap(([scenarioId, history]) =>
      history.map((submission) => ({
        learnerId,
        scenarioId: scenarioId as ScenarioId,
        submission,
      })),
    ),
  );
  const processBreakdown = processScenarios.map((scenario) => {
    const processSubmissions = submissions.filter(
      (item) => item.scenarioId === scenario.id,
    );
    return {
      scenarioId: scenario.id,
      processCode: scenario.code,
      title: scenario.title,
      submissions: processSubmissions.length,
      reviewReady: processSubmissions.filter(
        (item) => item.submission.status !== "Needs practice",
      ).length,
      averageScore: processSubmissions.length
        ? Math.round(
            processSubmissions.reduce(
              (total, item) => total + item.submission.score,
              0,
            ) / processSubmissions.length,
          )
        : 0,
    };
  });

  return {
    learners: learnerEntries.length,
    submissions: submissions.length,
    reviewReady: submissions.filter(
      (item) => item.submission.status === "Review ready",
    ).length,
    strongEvidence: submissions.filter(
      (item) => item.submission.status === "Strong evidence",
    ).length,
    needsPractice: submissions.filter(
      (item) => item.submission.status === "Needs practice",
    ).length,
    latestSubmittedAt:
      submissions
        .map((item) => item.submission.submittedAt)
        .sort()
        .at(-1) ?? null,
    processBreakdown,
  };
}
