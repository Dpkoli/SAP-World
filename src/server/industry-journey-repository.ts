import "server-only";

import {
  industryClosingCalendar,
  industryCurriculumTasks,
  type CurriculumYear,
  type IndustryJourneyProgress,
} from "@/data/industry-curriculum";
import {
  isIndustryId,
  type IndustryId,
} from "@/data/industries";
import { createDurableStore } from "@/server/durable-store";

type IndustryJourneyDatabase = {
  version: 1;
  learners: Record<string, Partial<Record<IndustryId, IndustryJourneyProgress>>>;
};

function emptyDatabase(): IndustryJourneyDatabase {
  return { version: 1, learners: {} };
}

function isJourneyProgress(value: unknown): value is IndustryJourneyProgress {
  const candidate = value as Partial<IndustryJourneyProgress> | null;
  return Boolean(
    candidate &&
      isIndustryId(candidate.industryId) &&
      typeof candidate.startedAt === "string" &&
      typeof candidate.updatedAt === "string" &&
      (typeof candidate.currentTaskId === "string" ||
        candidate.currentTaskId === null) &&
      Array.isArray(candidate.completedTaskIds) &&
      Array.isArray(candidate.completedPeriodIds),
  );
}

function isJourneyDatabase(value: unknown): value is IndustryJourneyDatabase {
  const candidate = value as Partial<IndustryJourneyDatabase> | null;
  if (!candidate || candidate.version !== 1 || !candidate.learners) return false;
  return Object.values(candidate.learners).every((journeys) =>
    Object.values(journeys ?? {}).every((journey) => isJourneyProgress(journey)),
  );
}

const journeyStore = createDurableStore<IndustryJourneyDatabase>({
  key: "industry-journeys",
  fileName: "industry-journeys.json",
  empty: emptyDatabase,
  validate: isJourneyDatabase,
});

function normalizedProgress(progress: IndustryJourneyProgress) {
  const tasks = industryCurriculumTasks(progress.industryId);
  const validTaskIds = new Set(tasks.map((task) => task.id));
  const completedTaskIds = progress.completedTaskIds.filter((id) =>
    validTaskIds.has(id),
  );
  const nextTask = tasks.find((task) => !completedTaskIds.includes(task.id));
  const validPeriods = new Set(
    ([1, 2, 3] as CurriculumYear[]).flatMap((year) =>
      industryClosingCalendar(progress.industryId, year).map(
        (period) => period.id,
      ),
    ),
  );
  return {
    ...progress,
    completedTaskIds,
    completedPeriodIds: progress.completedPeriodIds.filter((id) =>
      validPeriods.has(id),
    ),
    currentTaskId: nextTask?.id ?? null,
    completedAt:
      nextTask || progress.completedAt
        ? progress.completedAt
        : new Date().toISOString(),
  };
}

export async function getIndustryJourneys(learnerId: string) {
  const database = await journeyStore.read();
  return Object.values(database.learners[learnerId] ?? {}).map((journey) =>
    normalizedProgress(journey),
  );
}

export async function getIndustryJourney(
  learnerId: string,
  industryId: IndustryId,
) {
  const database = await journeyStore.read();
  const journey = database.learners[learnerId]?.[industryId];
  return journey ? normalizedProgress(journey) : null;
}

export async function startIndustryJourney(
  learnerId: string,
  industryId: IndustryId,
) {
  let result: IndustryJourneyProgress | null = null;
  await journeyStore.update((database) => {
    database.learners[learnerId] ??= {};
    const existing = database.learners[learnerId][industryId];
    if (existing) {
      result = normalizedProgress(existing);
      database.learners[learnerId][industryId] = result;
      return;
    }
    const now = new Date().toISOString();
    const firstTask = industryCurriculumTasks(industryId)[0];
    result = {
      industryId,
      startedAt: now,
      updatedAt: now,
      currentTaskId: firstTask?.id ?? null,
      completedTaskIds: [],
      completedPeriodIds: [],
      completedAt: null,
    };
    database.learners[learnerId][industryId] = result;
  });
  return result!;
}

export async function completeIndustryTask(
  learnerId: string,
  industryId: IndustryId,
  taskId: string,
) {
  let result: IndustryJourneyProgress | null = null;
  await journeyStore.update((database) => {
    const existing = database.learners[learnerId]?.[industryId];
    if (!existing) throw new Error("Start this industry before completing tasks.");
    const progress = normalizedProgress(existing);
    if (progress.completedTaskIds.includes(taskId)) {
      result = progress;
      return;
    }
    if (progress.currentTaskId !== taskId) {
      throw new Error("Complete the current mandatory task before moving ahead.");
    }
    const tasks = industryCurriculumTasks(industryId);
    const completedTaskIds = [...progress.completedTaskIds, taskId];
    const nextTask = tasks.find((task) => !completedTaskIds.includes(task.id));
    const now = new Date().toISOString();
    result = {
      ...progress,
      updatedAt: now,
      completedTaskIds,
      currentTaskId: nextTask?.id ?? null,
      completedAt: nextTask ? null : now,
    };
    database.learners[learnerId]![industryId] = result;
  });
  return result!;
}

export async function closeIndustryPeriod(
  learnerId: string,
  industryId: IndustryId,
  periodId: string,
) {
  let result: IndustryJourneyProgress | null = null;
  await journeyStore.update((database) => {
    const existing = database.learners[learnerId]?.[industryId];
    if (!existing) throw new Error("Start this industry before closing periods.");
    const progress = normalizedProgress(existing);
    if (progress.completedPeriodIds.includes(periodId)) {
      result = progress;
      return;
    }
    const calendar = ([1, 2, 3] as CurriculumYear[]).flatMap((year) =>
      industryClosingCalendar(industryId, year),
    );
    const expectedPeriod = calendar.find(
      (period) => !progress.completedPeriodIds.includes(period.id),
    );
    if (!expectedPeriod || expectedPeriod.id !== periodId) {
      throw new Error("Close calendar periods in order, beginning with Year 1 January.");
    }
    result = {
      ...progress,
      updatedAt: new Date().toISOString(),
      completedPeriodIds: [...progress.completedPeriodIds, periodId],
    };
    database.learners[learnerId]![industryId] = result;
  });
  return result!;
}
