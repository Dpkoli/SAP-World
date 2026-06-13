import { promises as fs } from "node:fs";
import path from "node:path";

import {
  advancedTransactionDefinitions,
  type AdvancedTransactionCase,
} from "@/data/advanced-transactions";

type ProgressEntry = {
  step: number;
  note: string;
  completedAt: string;
};

type ProgressStore = Record<string, Record<string, ProgressEntry[]>>;

const dataDirectory = path.join(process.cwd(), ".data");
const progressFile = path.join(
  dataDirectory,
  "advanced-transaction-progress.json",
);

let writeQueue = Promise.resolve();

async function readStore(): Promise<ProgressStore> {
  try {
    return JSON.parse(await fs.readFile(progressFile, "utf8")) as ProgressStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function writeStore(store: ProgressStore) {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(progressFile, `${JSON.stringify(store, null, 2)}\n`);
}

function mergeProgress(
  transaction: AdvancedTransactionCase,
  progress: ProgressEntry[],
): AdvancedTransactionCase {
  const completedSteps = progress.map((entry) => entry.step);
  const currentStep =
    transaction.steps.find((step) => !completedSteps.includes(step.sequence))
      ?.sequence ?? null;

  return {
    ...transaction,
    status:
      completedSteps.length === 0
        ? "Not started"
        : currentStep === null
          ? "Completed"
          : "In progress",
    currentStep,
    completedSteps,
    auditTrail: progress.map((entry) => ({
      ...entry,
      title:
        transaction.steps.find((step) => step.sequence === entry.step)?.title ??
        `Step ${entry.step}`,
    })),
    allowedActions: currentStep === null ? [] : ["complete-step"],
  };
}

export async function getAdvancedTransactions(learnerId: string) {
  const store = await readStore();
  const learnerProgress = store[learnerId] ?? {};

  return advancedTransactionDefinitions.map((transaction) =>
    mergeProgress(transaction, learnerProgress[transaction.id] ?? []),
  );
}

export async function completeAdvancedTransactionStep(
  learnerId: string,
  transactionId: string,
  step: number,
  note: string,
) {
  const transaction = advancedTransactionDefinitions.find(
    (item) => item.id === transactionId,
  );

  if (!transaction) {
    throw new Error("Transaction case not found.");
  }

  return new Promise<AdvancedTransactionCase>((resolve, reject) => {
    writeQueue = writeQueue
      .then(async () => {
        const store = await readStore();
        const learnerProgress = store[learnerId] ?? {};
        const progress = learnerProgress[transactionId] ?? [];
        const merged = mergeProgress(transaction, progress);

        if (merged.currentStep === null) {
          throw new Error("This transaction case is already complete.");
        }

        if (merged.currentStep !== step) {
          throw new Error(
            `Complete step ${merged.currentStep} before step ${step}.`,
          );
        }

        const nextProgress = [
          ...progress,
          {
            step,
            note,
            completedAt: new Date().toISOString(),
          },
        ];

        store[learnerId] = {
          ...learnerProgress,
          [transactionId]: nextProgress,
        };
        await writeStore(store);
        resolve(mergeProgress(transaction, nextProgress));
      })
      .catch(reject);
  });
}
