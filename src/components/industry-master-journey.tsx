"use client";

import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  ExternalLink,
  Flag,
  GraduationCap,
  Lock,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { IndustryPracticeWorkbench } from "@/components/industry-practice-workbench";
import {
  industryClosingCalendar,
  industryCurriculumPhases,
  industryCurriculumTasks,
  taskYearSummary,
  type CurriculumYear,
  type IndustryJourneyProgress,
  type IndustryJourneyTarget,
} from "@/data/industry-curriculum";
import { industryById, type IndustryId } from "@/data/industries";
import type { ScenarioId } from "@/data/progress";

type JourneyAction =
  | { action: "start"; industryId: IndustryId }
  | {
      action: "complete-task";
      industryId: IndustryId;
      taskId: string;
    }
  | {
      action: "close-period";
      industryId: IndustryId;
      periodId: string;
    };

export function IndustryMasterJourney({
  industryId,
  onNavigate,
}: {
  industryId: IndustryId;
  onNavigate: (
    target: IndustryJourneyTarget,
    scenarioId?: ScenarioId,
  ) => void;
}) {
  const [progress, setProgress] = useState<IndustryJourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState<CurriculumYear>(1);

  const industry = industryById(industryId);
  const tasks = useMemo(() => industryCurriculumTasks(industryId), [industryId]);
  const calendar = useMemo(
    () => industryClosingCalendar(industryId, selectedYear),
    [industryId, selectedYear],
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/industry-journey?industryId=${encodeURIComponent(industryId)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          progress?: IndustryJourneyProgress | null;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error ?? "Journey unavailable.");
        if (!cancelled) setProgress(result.progress ?? null);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Journey unavailable.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [industryId]);

  async function updateJourney(action: JourneyAction) {
    setSaving(action.action === "start" ? "start" : action.action === "complete-task" ? action.taskId : action.periodId);
    setError("");
    try {
      const response = await fetch("/api/industry-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const result = (await response.json()) as {
        progress?: IndustryJourneyProgress;
        error?: string;
      };
      if (!response.ok || !result.progress) {
        throw new Error(result.error ?? "Journey update failed.");
      }
      setProgress(result.progress);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Journey update failed.",
      );
    } finally {
      setSaving("");
    }
  }

  const completedTasks = new Set(progress?.completedTaskIds ?? []);
  const completedPeriods = new Set(progress?.completedPeriodIds ?? []);
  const currentTask =
    tasks.find((task) => task.id === progress?.currentTaskId) ?? null;
  const currentIndex = currentTask
    ? tasks.findIndex((task) => task.id === currentTask.id)
    : progress
      ? tasks.length
      : 0;
  const nextTask = currentTask ? tasks[currentIndex + 1] ?? null : null;
  const completion = progress
    ? Math.round((completedTasks.size / tasks.length) * 100)
    : 0;
  const nextOpenPeriod = ([1, 2, 3] as CurriculumYear[])
    .flatMap((year) => industryClosingCalendar(industryId, year))
    .find((period) => !completedPeriods.has(period.id));

  function phaseStatus(phaseId: string) {
    const phaseTasks = tasks.filter((task) => task.phaseId === phaseId);
    const completed = phaseTasks.filter((task) => completedTasks.has(task.id)).length;
    if (completed === phaseTasks.length && phaseTasks.length > 0) return "complete";
    if (currentTask?.phaseId === phaseId) return "current";
    return "locked";
  }

  return (
    <section className="master-journey" aria-labelledby="master-journey-title">
      <div className="master-journey-heading">
        <div>
          <span className="section-kicker">Beginner-to-expert curriculum</span>
          <h2 id="master-journey-title">Industry Master Journey</h2>
          <p>
            Configure, transact, cost, close, report, troubleshoot, and defend
            {` ${industry.enterprise}`} across three complete fiscal years.
          </p>
        </div>
        {!progress && !loading ? (
          <button
            className="journey-start-button"
            disabled={saving === "start"}
            onClick={() =>
              void updateJourney({ action: "start", industryId })
            }
          >
            <PlayCircle size={18} />
            {saving === "start" ? "Starting..." : "Start Industry"}
          </button>
        ) : (
          <div className="journey-progress-summary">
            <span>{loading ? "Loading" : `${completion}% complete`}</span>
            <strong>
              {completedTasks.size}/{tasks.length} mandatory tasks
            </strong>
          </div>
        )}
      </div>

      {error && (
        <div className="journey-error" role="alert">
          {error}
        </div>
      )}

      <div className="journey-progress-track" aria-label={`${completion}% complete`}>
        <span style={{ width: `${completion}%` }} />
      </div>

      <div className="journey-phase-rail" aria-label="Mandatory curriculum phases">
        {industryCurriculumPhases.map((phase) => {
          const status = phaseStatus(phase.id);
          const phaseTasks = tasks.filter((task) => task.phaseId === phase.id);
          const completed = phaseTasks.filter((task) =>
            completedTasks.has(task.id),
          ).length;
          return (
            <article className={status} key={phase.id}>
              <div>
                {status === "complete" ? (
                  <Check size={16} />
                ) : status === "locked" ? (
                  <Lock size={14} />
                ) : (
                  phase.number
                )}
              </div>
              <span>{phase.level}</span>
              <strong>
                {phase.number}. {phase.title}
              </strong>
              <small>{completed}/{phaseTasks.length} tasks</small>
              <p>{phase.outcome}</p>
            </article>
          );
        })}
      </div>

      {!progress && !loading && (
        <div className="journey-empty-state">
          <GraduationCap size={34} />
          <div>
            <strong>One curriculum. No guessing what comes next.</strong>
            <p>
              Start the industry to unlock Phase 1. Every phase is mandatory and
              your current task, external SAP instructions, close calendar, and
              three-year progress will be saved to your account.
            </p>
          </div>
        </div>
      )}

      {progress && currentTask && (
        <div className="journey-task-layout">
          <article className="journey-current-task">
            <div className="journey-task-title">
              <div>
                <span className="section-kicker">
                  Current task {currentIndex + 1} of {tasks.length} / {currentTask.level}
                </span>
                <h3>{currentTask.title}</h3>
                <p>{currentTask.objective}</p>
              </div>
              <button
                className="journey-open-app"
                onClick={() =>
                  onNavigate(currentTask.target, currentTask.scenarioId)
                }
              >
                Open related app <ExternalLink size={15} />
              </button>
            </div>

            <div className="sap-instruction-banner">
              <div>
                <span>External SAP workspace</span>
                <strong>{currentTask.externalSap.workspace}</strong>
              </div>
              <div>
                <span>Fiori app / transaction examples</span>
                <strong>{currentTask.externalSap.appOrTransaction}</strong>
              </div>
              <div>
                <span>Navigation</span>
                <strong>{currentTask.externalSap.navigation}</strong>
              </div>
            </div>

            <div className="sap-instruction-grid">
              <div>
                <span className="journey-detail-label">Prerequisites</span>
                <ul>
                  {currentTask.externalSap.prerequisites.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="journey-detail-label">Expected input</span>
                <ul>
                  {currentTask.externalSap.expectedInput.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="sap-step-list">
              <span className="journey-detail-label">Step-by-step execution</span>
              {currentTask.externalSap.steps.map((step, index) => (
                <div key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            <div className="sap-instruction-grid outcome">
              <div>
                <span className="journey-detail-label">Expected result</span>
                <ul>
                  {currentTask.externalSap.expectedResult.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="journey-detail-label">Evidence to retain</span>
                <ul>
                  {currentTask.externalSap.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {currentTask.externalSap.caution && (
              <p className="sap-caution">
                <ShieldCheck size={15} /> {currentTask.externalSap.caution}
              </p>
            )}

            <div className="journey-task-actions">
              <span>
                Mark complete only after the expected result and evidence are
                visible in your training system.
              </span>
              <button
                disabled={saving === currentTask.id}
                onClick={() =>
                  void updateJourney({
                    action: "complete-task",
                    industryId,
                    taskId: currentTask.id,
                  })
                }
              >
                <CircleCheckBig size={17} />
                {saving === currentTask.id
                  ? "Saving..."
                  : "Complete current task"}
              </button>
            </div>
          </article>

          <aside className="journey-next-task">
            <span className="section-kicker">Next task</span>
            {nextTask ? (
              <>
                <strong>{nextTask.title}</strong>
                <p>{nextTask.objective}</p>
                <small>
                  <Lock size={13} /> Unlocks after the current task
                </small>
              </>
            ) : (
              <>
                <strong>Industry curriculum complete</strong>
                <p>Your mandatory task sequence is complete. Finish any open close-calendar periods and review your evidence portfolio.</p>
              </>
            )}
            <div className="journey-sequence-note">
              <ArrowRight size={15} />
              <span>Mandatory phases cannot be skipped.</span>
            </div>
          </aside>
        </div>
      )}

      {progress && !currentTask && (
        <div className="journey-complete-state">
          <Flag size={30} />
          <div>
            <strong>All mandatory curriculum tasks are complete.</strong>
            <p>Close any remaining monthly periods, then use the portfolio and capstone evidence for assessor review.</p>
          </div>
        </div>
      )}

      {progress && (
        <div className="journey-planning-grid">
          <article className="journey-calendar">
            <div className="journey-section-heading">
              <div>
                <span className="section-kicker">Monthly and yearly closing calendar</span>
                <h3>Thirty-six controlled closes</h3>
              </div>
              <div className="journey-year-tabs" aria-label="Close calendar year">
                {([1, 2, 3] as CurriculumYear[]).map((year) => (
                  <button
                    className={selectedYear === year ? "active" : ""}
                    onClick={() => setSelectedYear(year)}
                    key={year}
                  >
                    Year {year}
                  </button>
                ))}
              </div>
            </div>
            <div className="journey-month-grid">
              {calendar.map((period) => {
                const complete = completedPeriods.has(period.id);
                const current = nextOpenPeriod?.id === period.id;
                return (
                  <article
                    className={complete ? "complete" : current ? "current" : "locked"}
                    key={period.id}
                  >
                    <div>
                      <span>{period.closeType}</span>
                      {complete ? <Check size={15} /> : <Clock3 size={15} />}
                    </div>
                    <strong>{period.label}</strong>
                    <p>{period.focus}</p>
                    <small>{period.expectedResult}</small>
                    <details>
                      <summary>Close checklist</summary>
                      <ol>
                        {period.requiredActions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ol>
                    </details>
                    <button
                      disabled={!current || saving === period.id}
                      onClick={() =>
                        void updateJourney({
                          action: "close-period",
                          industryId,
                          periodId: period.id,
                        })
                      }
                    >
                      {complete
                        ? "Closed"
                        : saving === period.id
                          ? "Saving..."
                          : current
                            ? "Mark period closed"
                            : "Complete earlier period"}
                    </button>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="journey-three-year-map">
            <div className="journey-section-heading">
              <div>
                <span className="section-kicker">Three-year progress map</span>
                <h3>Foundation to expert</h3>
              </div>
              <CalendarCheck size={24} />
            </div>
            {([1, 2, 3] as CurriculumYear[]).map((year) => {
              const yearTasks = taskYearSummary(tasks, year);
              const completedYearTasks = yearTasks.filter((task) =>
                completedTasks.has(task.id),
              ).length;
              const closedMonths = industryClosingCalendar(industryId, year).filter(
                (period) => completedPeriods.has(period.id),
              ).length;
              const taskPercentage = yearTasks.length
                ? Math.round((completedYearTasks / yearTasks.length) * 100)
                : 0;
              const intent =
                year === 1
                  ? "Configure and transact"
                  : year === 2
                    ? "Cost, control, and close"
                    : "Optimise and prove expertise";
              return (
                <div className="journey-year-card" key={year}>
                  <div className="journey-year-number">Y{year}</div>
                  <div>
                    <span>{intent}</span>
                    <strong>{taskPercentage}% task mastery</strong>
                    <p>{completedYearTasks}/{yearTasks.length} tasks / {closedMonths}/12 months closed</p>
                    <div><span style={{ width: `${taskPercentage}%` }} /></div>
                  </div>
                  <ChevronRight size={18} />
                </div>
              );
            })}
          </article>
        </div>
      )}

      {progress && <IndustryPracticeWorkbench industryId={industryId} />}
    </section>
  );
}
