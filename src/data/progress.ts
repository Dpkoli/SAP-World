import { processScenarios } from "@/data/simulation";

export type ScenarioId = (typeof processScenarios)[number]["id"];

export type ScenarioProgress = Record<
  ScenarioId,
  { step: number; complete: boolean }
>;

export type DiagnosticProgress = Record<
  ScenarioId,
  { attempts: number; complete: boolean; completedAt: string | null }
>;

export type LearnerProgress = {
  learnerId: string;
  activeScenarioId: ScenarioId;
  scenarios: ScenarioProgress;
  diagnostics: DiagnosticProgress;
  updatedAt: string;
};

export const defaultScenarioProgress = processScenarios.reduce(
  (result, scenario) => {
    result[scenario.id] = { step: 0, complete: false };
    return result;
  },
  {} as ScenarioProgress,
);

export const defaultDiagnosticProgress = processScenarios.reduce(
  (result, scenario) => {
    result[scenario.id] = {
      attempts: 0,
      complete: false,
      completedAt: null,
    };
    return result;
  },
  {} as DiagnosticProgress,
);

export function isScenarioId(value: unknown): value is ScenarioId {
  return (
    typeof value === "string" &&
    processScenarios.some((scenario) => scenario.id === value)
  );
}

export function normalizeScenarioProgress(
  value: unknown,
  legacy?: { lessonStep?: number; lessonComplete?: boolean },
): ScenarioProgress {
  const saved =
    typeof value === "object" && value !== null
      ? (value as Partial<ScenarioProgress>)
      : undefined;

  return processScenarios.reduce((result, scenario) => {
    const candidate =
      saved?.[scenario.id] ??
      (scenario.id === "p2p"
        ? {
            step: legacy?.lessonStep ?? 0,
            complete: Boolean(legacy?.lessonComplete),
          }
        : defaultScenarioProgress[scenario.id]);
    const rawStep =
      typeof candidate?.step === "number" && Number.isFinite(candidate.step)
        ? Math.trunc(candidate.step)
        : 0;

    result[scenario.id] = {
      step: Math.min(
        Math.max(rawStep, 0),
        scenario.tutorSteps.length - 1,
      ),
      complete: Boolean(candidate?.complete),
    };
    return result;
  }, {} as ScenarioProgress);
}

export function normalizeLearnerProgress(
  learnerId: string,
  value: unknown,
): LearnerProgress {
  const input =
    typeof value === "object" && value !== null
      ? (value as {
          activeScenarioId?: unknown;
          scenarios?: unknown;
          diagnostics?: unknown;
          lessonStep?: number;
          lessonComplete?: boolean;
          updatedAt?: unknown;
        })
      : {};

  return {
    learnerId,
    activeScenarioId: isScenarioId(input.activeScenarioId)
      ? input.activeScenarioId
      : "p2p",
    scenarios: normalizeScenarioProgress(input.scenarios, {
      lessonStep: input.lessonStep,
      lessonComplete: input.lessonComplete,
    }),
    diagnostics: normalizeDiagnosticProgress(input.diagnostics),
    updatedAt:
      typeof input.updatedAt === "string"
        ? input.updatedAt
        : new Date().toISOString(),
  };
}

export function normalizeDiagnosticProgress(
  value: unknown,
): DiagnosticProgress {
  const saved =
    typeof value === "object" && value !== null
      ? (value as Partial<DiagnosticProgress>)
      : undefined;

  return processScenarios.reduce((result, scenario) => {
    const candidate = saved?.[scenario.id];
    const attempts =
      typeof candidate?.attempts === "number" &&
      Number.isFinite(candidate.attempts)
        ? Math.max(0, Math.trunc(candidate.attempts))
        : 0;
    const complete = Boolean(candidate?.complete);

    result[scenario.id] = {
      attempts,
      complete,
      completedAt:
        complete && typeof candidate?.completedAt === "string"
          ? candidate.completedAt
          : null,
    };
    return result;
  }, {} as DiagnosticProgress);
}
