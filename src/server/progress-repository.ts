import "server-only";

import {
  normalizeLearnerProgress,
  type LearnerProgress,
} from "@/data/progress";
import { createDurableStore } from "@/server/durable-store";

type ProgressDatabase = {
  version: 1;
  learners: Record<string, LearnerProgress>;
};

function emptyDatabase(): ProgressDatabase {
  return { version: 1, learners: {} };
}

function isProgressDatabase(value: unknown): value is ProgressDatabase {
  const candidate = value as Partial<ProgressDatabase> | null;
  return Boolean(candidate?.version === 1 && candidate.learners);
}

const progressStore = createDurableStore<ProgressDatabase>({
  key: "learning-progress",
  fileName: "learning-progress.json",
  empty: emptyDatabase,
  validate: isProgressDatabase,
});

export async function getLearnerProgress(learnerId: string) {
  const database = await progressStore.read();
  const stored = database.learners[learnerId];
  return stored ? normalizeLearnerProgress(learnerId, stored) : null;
}

export async function saveLearnerProgress(
  learnerId: string,
  input: unknown,
) {
  const progress = normalizeLearnerProgress(learnerId, input);
  progress.updatedAt = new Date().toISOString();

  await progressStore.update((database) => {
    database.learners[learnerId] = progress;
  });
  return progress;
}

export async function getLearningProgressStats() {
  const database = await progressStore.read();
  const progress = Object.entries(database.learners).map(
    ([learnerId, learner]) => normalizeLearnerProgress(learnerId, learner),
  );
  const guidedEvidenceNotes = progress.reduce(
    (total, learner) =>
      total +
      Object.values(learner.guidedEvidence).reduce(
        (learnerTotal, notes) => learnerTotal + Object.keys(notes).length,
        0,
      ),
    0,
  );
  const learnersWithGuidedEvidence = progress.filter((learner) =>
    Object.values(learner.guidedEvidence).some(
      (notes) => Object.keys(notes).length > 0,
    ),
  ).length;
  return {
    learners: progress.length,
    completedLessons: progress.reduce(
      (total, learner) =>
        total +
        Object.values(learner.scenarios).filter((scenario) => scenario.complete)
          .length,
      0,
    ),
    completedDiagnostics: progress.reduce(
      (total, learner) =>
        total +
        Object.values(learner.diagnostics).filter(
          (diagnostic) => diagnostic.complete,
        ).length,
      0,
    ),
    guidedEvidenceNotes,
    learnersWithGuidedEvidence,
    averageGuidedEvidenceNotes:
      progress.length > 0 ? Math.round(guidedEvidenceNotes / progress.length) : 0,
    latestUpdatedAt:
      progress
        .map((learner) => learner.updatedAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
  };
}
