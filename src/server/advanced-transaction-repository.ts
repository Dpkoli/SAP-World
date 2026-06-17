import {
  advancedTransactionDefinitions,
  type AdvancedTransactionCase,
} from "@/data/advanced-transactions";
import { createDurableStore } from "@/server/durable-store";

type ProgressEntry = {
  step: number;
  note: string;
  completedAt: string;
};

type ProgressStore = Record<string, Record<string, ProgressEntry[]>>;

function isProgressStore(value: unknown): value is ProgressStore {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const progressStore = createDurableStore<ProgressStore>({
  key: "advanced-transaction-progress",
  fileName: "advanced-transaction-progress.json",
  empty: () => ({}),
  validate: isProgressStore,
});

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
  const store = await progressStore.read();
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

  return progressStore.update((store) => {
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
    return mergeProgress(transaction, nextProgress);
  });
}
