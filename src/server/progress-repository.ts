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
