import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeLearnerProgress,
  type LearnerProgress,
} from "@/data/progress";

type ProgressDatabase = {
  version: 1;
  learners: Record<string, LearnerProgress>;
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "learning-progress.json");
const temporaryFile = path.join(dataDirectory, "learning-progress.tmp.json");

let writeQueue = Promise.resolve();

function emptyDatabase(): ProgressDatabase {
  return { version: 1, learners: {} };
}

async function readDatabase(): Promise<ProgressDatabase> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as ProgressDatabase;
    return parsed?.version === 1 && parsed.learners ? parsed : emptyDatabase();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDatabase();
    }
    throw error;
  }
}

async function writeDatabase(database: ProgressDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

export async function getLearnerProgress(learnerId: string) {
  const database = await readDatabase();
  const stored = database.learners[learnerId];
  return stored ? normalizeLearnerProgress(learnerId, stored) : null;
}

export async function saveLearnerProgress(
  learnerId: string,
  input: unknown,
) {
  const progress = normalizeLearnerProgress(learnerId, input);
  progress.updatedAt = new Date().toISOString();

  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const database = await readDatabase();
    database.learners[learnerId] = progress;
    await writeDatabase(database);
  });
  await writeQueue;
  return progress;
}
