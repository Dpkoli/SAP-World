"use client";

import {
  Award,
  ArrowRight,
  BookOpenCheck,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Factory,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Lock,
  MapPin,
  Menu,
  MessageCircleMore,
  Package,
  PlayCircle,
  Search,
  Send,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { learnerInitials, type LearnerProfile } from "@/data/auth";
import {
  businessPartners,
  employees,
  enterpriseSummary,
  enterpriseUnits,
  plants,
} from "@/data/enterprise";
import {
  enterpriseEvents,
  fiscalYearSummaries,
  type FiscalYear,
} from "@/data/history";
import {
  defaultIndustryId,
  industryById,
  industryEnterprises,
  type IndustryId,
} from "@/data/industries";
import {
  defaultDiagnosticProgress,
  defaultScenarioProgress,
  normalizeLearnerProgress,
  type DiagnosticProgress,
  type ScenarioId,
  type ScenarioProgress,
} from "@/data/progress";
import {
  activity,
  kpis,
  learningPaths,
  mentorAnswers,
  processCatalog,
  processScenarios,
} from "@/data/simulation";
import { troubleshootingCaseFor } from "@/data/troubleshooting";

type View =
  | "overview"
  | "academy"
  | "processes"
  | "tutor"
  | "history"
  | "structure"
  | "plants"
  | "partners";

const navigation = [
  { id: "overview" as const, label: "Enterprise overview", icon: LayoutDashboard },
  { id: "academy" as const, label: "Learning centre", icon: BookOpenCheck },
  { id: "processes" as const, label: "Process explorer", icon: Boxes },
  { id: "history" as const, label: "Simulation history", icon: CalendarDays },
  { id: "tutor" as const, label: "Transaction tutor", icon: GraduationCap },
];

export function SapWorld({
  user,
  onSignOut,
}: {
  user: LearnerProfile;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<View>("overview");
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("p2p");
  const [preferredIndustryId, setPreferredIndustryId] =
    useState<IndustryId>(defaultIndustryId);
  const [scenarioProgress, setScenarioProgress] = useState<ScenarioProgress>(defaultScenarioProgress);
  const [diagnosticProgress, setDiagnosticProgress] = useState<DiagnosticProgress>(defaultDiagnosticProgress);
  const [quizAnswers, setQuizAnswers] = useState<Record<ScenarioId, number | null>>({ p2p: null, o2c: null, ptp: null, r2r: null, qm: null, pm: null, h2r: null });
  const [tutorMode, setTutorMode] = useState<"guided" | "troubleshoot">("guided");
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<Record<ScenarioId, number | null>>({ p2p: null, o2c: null, ptp: null, r2r: null, qm: null, pm: null, h2r: null });
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "saving" | "saved" | "offline">("loading");
  const [searchOpen, setSearchOpen] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<"All" | "Supplier" | "Customer">("All");
  const [selectedYear, setSelectedYear] = useState<FiscalYear>("2025–2026");
  const [eventCategory, setEventCategory] = useState("All");
  const [selectedEventId, setSelectedEventId] = useState("EVT-2604-035");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "I’m connected to the Burton Brewery simulation. Ask me about this goods receipt, its accounting impact, or what happens next.",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      let localProgress: unknown = null;
      const storageKey = `sap-world-progress:${user.id}`;
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          localProgress = JSON.parse(saved);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      try {
        const response = await fetch(
          "/api/learning/progress",
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Progress service unavailable");
        const result = (await response.json()) as {
          found: boolean;
          progress: unknown;
        };
        const source = result.found ? result.progress : localProgress;
        const normalized = normalizeLearnerProgress(user.id, source);
        if (!cancelled) {
          setScenarioProgress(normalized.scenarios);
          setDiagnosticProgress(normalized.diagnostics);
          setActiveScenarioId(normalized.activeScenarioId);
          setPreferredIndustryId(normalized.preferredIndustryId);
          setSyncStatus(result.found ? "saved" : "saving");
        }
      } catch {
        const normalized = normalizeLearnerProgress(user.id, localProgress);
        if (!cancelled) {
          setScenarioProgress(normalized.scenarios);
          setDiagnosticProgress(normalized.diagnostics);
          setActiveScenarioId(normalized.activeScenarioId);
          setPreferredIndustryId(normalized.preferredIndustryId);
          setSyncStatus("offline");
        }
      } finally {
        if (!cancelled) setProgressLoaded(true);
      }
    }

    void loadProgress();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!progressLoaded) return;
    const payload = {
      activeScenarioId,
      preferredIndustryId,
      scenarios: scenarioProgress,
      diagnostics: diagnosticProgress,
    };
    window.localStorage.setItem(
      `sap-world-progress:${user.id}`,
      JSON.stringify(payload),
    );

    const timer = window.setTimeout(async () => {
      setSyncStatus("saving");
      try {
        const response = await fetch(
          "/api/learning/progress",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) throw new Error("Progress save failed");
        setSyncStatus("saved");
      } catch {
        setSyncStatus("offline");
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    activeScenarioId,
    diagnosticProgress,
    preferredIndustryId,
    progressLoaded,
    scenarioProgress,
    user.id,
  ]);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  function askMentor(prompt: string) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    setAnswer(
      mentorAnswers[cleanPrompt] ??
        `This question relates to ${activeScenario.code}, the active ${activeScenario.title} scenario. SAP connects its operational documents, inventory movements, and financial postings so you can trace the complete business impact.`,
    );
    setQuestion("");
  }

  const activeScenario =
    processScenarios.find((scenario) => scenario.id === activeScenarioId) ??
    processScenarios[0];
  const activeProgress = scenarioProgress[activeScenarioId];
  const activeQuizAnswer = quizAnswers[activeScenarioId];
  const troubleshootingCase = troubleshootingCaseFor(activeScenarioId);
  const diagnosisAnswer = diagnosisAnswers[activeScenarioId];
  const diagnosisCorrect =
    diagnosticProgress[activeScenarioId].complete ||
    diagnosisAnswer === troubleshootingCase.correctDiagnosis;
  const activeEnterprise = industryById(defaultIndustryId);
  const preferredIndustry = industryById(preferredIndustryId);
  const currentTutorStep = activeScenario.tutorSteps[activeProgress.step];
  const lessonProgress = activeProgress.complete
    ? 100
    : Math.round(((activeProgress.step + 1) / activeScenario.tutorSteps.length) * 100);

  function updateActiveProgress(update: Partial<{ step: number; complete: boolean }>) {
    setScenarioProgress((current) => ({
      ...current,
      [activeScenarioId]: { ...current[activeScenarioId], ...update },
    }));
  }

  function handleTutorNext() {
    if (activeProgress.step < activeScenario.tutorSteps.length - 1) {
      updateActiveProgress({ step: activeProgress.step + 1 });
      return;
    }
    if (activeQuizAnswer === activeScenario.knowledgeCheck.correctIndex) {
      updateActiveProgress({ complete: true });
    }
  }

  function recordDiagnosis(index: number) {
    if (diagnosticProgress[activeScenarioId].complete) return;

    const correct = index === troubleshootingCase.correctDiagnosis;
    setDiagnosisAnswers((current) => ({
      ...current,
      [activeScenarioId]: index,
    }));
    setDiagnosticProgress((current) => ({
      ...current,
      [activeScenarioId]: {
        attempts: current[activeScenarioId].attempts + 1,
        complete: correct,
        completedAt: correct ? new Date().toISOString() : null,
      },
    }));
  }

  function readinessFor(scenarioId: ScenarioId) {
    const scenario = processScenarios.find((item) => item.id === scenarioId)!;
    const lesson = scenarioProgress[scenarioId];
    const guidedProgress = lesson.complete
      ? 100
      : Math.round(((lesson.step + 1) / scenario.tutorSteps.length) * 100);
    const guidedScore = Math.round(guidedProgress * 0.6);
    return Math.min(
      100,
      guidedScore + (diagnosticProgress[scenarioId].complete ? 40 : 0),
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? [
        ...enterpriseUnits.map((unit) => ({
          id: unit.code,
          title: unit.name,
          subtitle: `${unit.type} · ${unit.location ?? unit.parent ?? ""}`,
          target: "structure" as View,
        })),
        ...plants.map((plant) => ({
          id: plant.code,
          title: plant.name,
          subtitle: `Plant · ${plant.location}`,
          target: "plants" as View,
        })),
        ...businessPartners.map((partner) => ({
          id: partner.id,
          title: partner.name,
          subtitle: `${partner.category} · ${partner.city}`,
          target: "partners" as View,
        })),
        ...enterpriseEvents.map((event) => ({
          id: event.id,
          title: event.title,
          subtitle: `${event.category} · ${event.date}`,
          target: "history" as View,
        })),
        ...employees.map((employee) => ({
          id: employee.id,
          title: employee.name,
          subtitle: `${employee.position} · ${employee.plant} · ${employee.costCenter}`,
          target: "structure" as View,
        })),
      ]
        .filter((result) =>
          `${result.id} ${result.title} ${result.subtitle}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
        .slice(0, 8)
    : [];

  function navigateTo(viewId: View) {
    setView(viewId);
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }

  const visibleEvents = enterpriseEvents.filter(
    (event) =>
      event.fiscalYear === selectedYear &&
      (eventCategory === "All" || event.category === eventCategory),
  );
  const selectedEvent =
    visibleEvents.find((event) => event.id === selectedEventId) ??
    visibleEvents[0];
  const eventCategories = [
    "All",
    ...Array.from(
      new Set(
        enterpriseEvents
          .filter((event) => event.fiscalYear === selectedYear)
          .map((event) => event.category),
      ),
    ),
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SAP World</strong>
            <span>Enterprise Simulation</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="primary-nav">
          <p className="nav-label">Workspace</p>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "nav-item active" : "nav-item"}
              onClick={() => {
                navigateTo(item.id);
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <p className="nav-label nav-spacer">Enterprise</p>
          <button className={view === "structure" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("structure")}><Building2 size={18} />Company structure</button>
          <button className={view === "plants" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("plants")}><Factory size={18} />Plants & operations</button>
          <button className={view === "partners" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("partners")}><Users size={18} />Business partners</button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item"><Settings size={18} />Settings</button>
          <button className="nav-item" onClick={onSignOut}><LogOut size={18} />Sign out</button>
          <div className="user-card">
            <div className="avatar">{learnerInitials(user.name)}</div>
            <div><strong>{user.name}</strong><span>SAP learner</span></div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <button className="enterprise-switcher" onClick={() => setEnterpriseOpen(true)}>
            <span className="company-icon"><Factory size={17} /></span>
            <div>
              <span>Active enterprise</span>
              <strong>{activeEnterprise.enterprise}</strong>
            </div>
            <ChevronRight size={17} />
          </button>
          <div className="topbar-actions">
            <span className={`sync-status ${syncStatus}`}>
              <i />
              {syncStatus === "loading"
                ? "Loading progress"
                : syncStatus === "saving"
                  ? "Saving"
                  : syncStatus === "saved"
                    ? "Progress saved"
                    : "Browser backup"}
            </span>
            <button className="search-button" onClick={() => setSearchOpen(true)}><Search size={18} /><span>Search SAP objects</span><kbd>Ctrl K</kbd></button>
            <button className="help-button"><CircleHelp size={20} /></button>
          </div>
        </header>

        <div className="content">
          {view === "overview" && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">Thursday, 12 June 2026 · Period 03</p>
                  <h1>Good morning, {user.name.split(" ")[0]}</h1>
                  <p>Here is what is happening across your simulated enterprise today.</p>
                </div>
                <button className="primary-button" onClick={() => setView("tutor")}>
                  <GraduationCap size={18} /> Continue learning
                </button>
              </section>

              <section className="kpi-grid">
                {kpis.map((kpi) => (
                  <article className="kpi-card" key={kpi.label}>
                    <span>{kpi.label}</span>
                    <div><strong>{kpi.value}</strong><small className={kpi.tone}>{kpi.change}</small></div>
                  </article>
                ))}
              </section>

              <section className="overview-grid">
                <article className="panel process-card">
                  <div className="panel-header">
                    <div><span className="section-kicker">Active process</span><h2>Procure to Pay</h2></div>
                    <button onClick={() => { setActiveScenarioId("p2p"); setView("processes"); }}>View full flow <ArrowRight size={15} /></button>
                  </div>
                  <div className="process-context">
                    <div><span>Business scenario</span><strong>Raw material replenishment</strong></div>
                    <div><span>Supplier</span><strong>Highland Maltings PLC</strong></div>
                    <div><span>Value</span><strong>£14,800.00</strong></div>
                  </div>
                  <div className="flow">
                    {processScenarios[0].steps.map((step, index) => (
                      <div className={`flow-item ${step.status}`} key={step.id}>
                        <div className="flow-node">{step.status === "complete" ? <Check size={16} /> : index + 1}</div>
                        <div><strong>{step.label}</strong><span>{step.document}</span></div>
                        {index < processScenarios[0].steps.length - 1 && <div className="flow-line" />}
                      </div>
                    ))}
                  </div>
                  <div className="attention">
                    <TriangleAlert size={20} />
                    <div><strong>Action required: Complete quality inspection</strong><span>Inspection lot 0400001844 is blocking 20,000 KG from production use.</span></div>
                    <button onClick={() => { setActiveScenarioId("p2p"); setView("tutor"); }}>Start guided task</button>
                  </div>
                </article>

                <article className="panel activity-card">
                  <div className="panel-header"><div><span className="section-kicker">Live operations</span><h2>Recent activity</h2></div></div>
                  <div className="activity-list">
                    {activity.map((item) => (
                      <div className="activity-row" key={item.time + item.title}>
                        <span className="activity-time">{item.time}</span>
                        <span className="module-tag">{item.module}</span>
                        <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="learning-banner">
                <div className="lesson-icon"><BookOpenCheck size={24} /></div>
                <div><span className="section-kicker">Your learning path</span><h3>{activeScenario.tutorTitle}</h3><p>{activeProgress.complete ? "Lesson complete · Knowledge check passed." : `Step ${activeProgress.step + 1} of ${activeScenario.tutorSteps.length} · Your progress is saved automatically.`}</p></div>
                <div className="lesson-progress"><strong>{lessonProgress}%</strong><div><span style={{ width: `${lessonProgress}%` }} /></div></div>
                <button onClick={() => setView("tutor")}>Resume lesson <ChevronRight size={16} /></button>
              </section>
            </>
          )}

          {view === "academy" && (
            <section className="academy-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Role-based SAP learning</p><h1>Learning centre</h1><p>Build practical skills through connected work performed inside the simulated enterprise.</p></div>
                <div className="academy-score"><Award size={20} /><div><span>Learning score</span><strong>{120 + Object.values(scenarioProgress).filter((progress) => progress.complete).length * 60 + Object.values(diagnosticProgress).filter((progress) => progress.complete).length * 40} XP</strong></div></div>
              </div>

              <div className="academy-summary">
                <article className="panel"><span>Current role</span><strong>Warehouse Operative</strong><small>Burton Brewery · Plant BR01</small></article>
                <article className="panel"><span>Lessons completed</span><strong>{Object.values(scenarioProgress).filter((progress) => progress.complete).length} of 7</strong><small>Available learning pathways</small></article>
                <article className="panel"><span>Exceptions diagnosed</span><strong>{Object.values(diagnosticProgress).filter((progress) => progress.complete).length} of 7</strong><small>{Object.values(diagnosticProgress).reduce((sum, progress) => sum + progress.attempts, 0)} diagnostic attempts</small></article>
              </div>

              <button className="industry-preference panel" onClick={() => setEnterpriseOpen(true)}>
                <span className="company-icon"><Building2 size={18} /></span>
                <div><span className="section-kicker">Industry roadmap preference</span><strong>{preferredIndustry.industry}</strong><small>{preferredIndustry.status === "live" ? "Your selected enterprise is available now." : `${preferredIndustry.enterprise} · ${preferredIndustry.release}`}</small></div>
                <span>Explore all industries <ChevronRight size={15} /></span>
              </button>

              <div className="catalog-heading"><div><span className="section-kicker">Recommended pathways</span><h2>Learn through real business scenarios</h2></div><span>{learningPaths.length} pathways</span></div>
              <div className="path-grid">
                {learningPaths.map((path) => {
                  const available = path.status === "available";
                  const scenarioId: ScenarioId | null =
                    path.id === "mm-goods-receipt" ? "p2p" :
                    path.id === "sd-order-to-cash" ? "o2c" :
                    path.id === "pp-brew-plan" ? "ptp" :
                    path.id === "fi-month-close" ? "r2r" :
                    path.id === "qm-inspection" ? "qm" :
                    path.id === "pm-breakdown" ? "pm" :
                    path.id === "hcm-hire" ? "h2r" : null;
                  const pathState = scenarioId ? scenarioProgress[scenarioId] : null;
                  const scenario = scenarioId ? processScenarios.find((item) => item.id === scenarioId) : null;
                  const progress = pathState && scenario
                    ? pathState.complete ? 100 : Math.round(((pathState.step + 1) / scenario.tutorSteps.length) * 100)
                    : path.progress;
                  const diagnostic = scenarioId ? diagnosticProgress[scenarioId] : null;
                  return (
                    <article className={`path-card panel ${available ? "" : "locked"}`} key={path.id}>
                      <div className="path-card-top">
                        <span className="module-pill">{path.module}</span>
                        <span className="level-pill">{path.level}</span>
                      </div>
                      <div className="path-icon">{available ? <GraduationCap size={23} /> : <Lock size={20} />}</div>
                      <span className="path-process">{path.process}</span>
                      <h3>{path.title}</h3>
                      <p>{path.description}</p>
                      <div className="path-meta"><span>{path.role}</span><span>{path.duration}</span><span>{path.lessons} lessons</span></div>
                      <div className="path-progress"><div><span style={{ width: `${progress}%` }} /></div><strong>{progress}%</strong></div>
                      {diagnostic && (
                        <div className={diagnostic.complete ? "diagnostic-status complete" : "diagnostic-status"}>
                          <TriangleAlert size={14} />
                          <span>{diagnostic.complete ? `Troubleshooting passed in ${diagnostic.attempts} ${diagnostic.attempts === 1 ? "attempt" : "attempts"}` : diagnostic.attempts > 0 ? `${diagnostic.attempts} diagnostic ${diagnostic.attempts === 1 ? "attempt" : "attempts"} · Continue lab` : "Troubleshooting lab not attempted"}</span>
                        </div>
                      )}
                      <button
                        disabled={!available}
                        onClick={() => {
                          if (scenarioId) setActiveScenarioId(scenarioId);
                          setView("tutor");
                        }}
                      >
                        {available ? <><PlayCircle size={16} /> {pathState?.complete ? "Review lesson" : progress > 25 ? "Continue pathway" : "Start pathway"}</> : "Coming soon"}
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="catalog-heading process-catalog-heading"><div><span className="section-kicker">Enterprise coverage</span><h2>End-to-end process curriculum</h2></div></div>
              <div className="curriculum-table panel">
                {processCatalog.map((process, index) => {
                  const scenarioId = processScenarios[index].id;
                  const readiness = readinessFor(scenarioId);
                  return (
                  <div className="curriculum-row" key={process.name}>
                    <span className="process-code">{process.code}</span>
                    <div><strong>{process.name}</strong><small>{process.modules}</small></div>
                    <span>{process.scenarios} scenarios</span>
                    <div className="readiness"><div><span style={{ width: `${readiness}%` }} /></div><strong>{readiness}% ready</strong></div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {view === "structure" && (
            <section className="enterprise-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">SAP organizational design</p><h1>Company structure</h1><p>Understand how legal, purchasing, sales, manufacturing, and inventory units connect.</p></div>
                <span className="api-badge">API · /api/enterprise</span>
              </div>
              <div className="enterprise-stats">
                <article className="panel"><Landmark size={19} /><div><span>Company code</span><strong>{enterpriseSummary.companyCode}</strong></div></article>
                <article className="panel"><Factory size={19} /><div><span>Plants</span><strong>{enterpriseSummary.plants}</strong></div></article>
                <article className="panel"><Users size={19} /><div><span>Active partners</span><strong>{enterpriseSummary.activePartners}</strong></div></article>
                <article className="panel"><Users size={19} /><div><span>Employees</span><strong>{enterpriseSummary.employees}</strong></div></article>
              </div>
              <div className="org-layout">
                <article className="panel org-tree">
                  <div className="panel-header"><div><span className="section-kicker">Enterprise hierarchy</span><h2>Organizational units</h2></div></div>
                  <div className="org-root">
                    <span>Company code</span><strong>BCB1 · Burton Craft Beverages Ltd.</strong><small>GBP · Fiscal year K4</small>
                  </div>
                  <div className="org-branches">
                    {["Purchasing Org", "Sales Org", "Plant"].map((type) => (
                      <div className="org-branch" key={type}>
                        <span>{type}</span>
                        {enterpriseUnits.filter((unit) => unit.type === type).map((unit) => (
                          <div className="org-node" key={unit.code}>
                            <strong>{unit.code}</strong><span>{unit.name}</span><small className={unit.status.toLowerCase()}>{unit.status}</small>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </article>
                <article className="panel org-detail">
                  <div className="panel-header"><div><span className="section-kicker">Plant BR01</span><h2>Storage locations</h2></div></div>
                  {enterpriseUnits.filter((unit) => unit.type === "Storage Location").map((unit) => (
                    <div className="storage-row" key={unit.code}>
                      <span className="storage-icon"><Package size={16} /></span>
                      <div><strong>{unit.code} · {unit.name}</strong><small>{unit.location}</small></div>
                      <span className="status-chip active">{unit.status}</span>
                    </div>
                  ))}
                  <div className="structure-note"><Sparkles size={18} /><p>These organizational assignments determine where materials are valued, purchased, stored, produced, and sold in SAP.</p></div>
                </article>
              </div>
            </section>
          )}

          {view === "plants" && (
            <section className="enterprise-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Manufacturing and logistics network</p><h1>Plants & operations</h1><p>Monitor capacity, utilization, people, storage, and active operational demand.</p></div>
              </div>
              <div className="plant-grid">
                {plants.map((plant) => (
                  <article className="plant-card panel" key={plant.code}>
                    <div className="plant-card-header">
                      <span className="plant-symbol"><Factory size={21} /></span>
                      <span className={`status-chip ${plant.status.toLowerCase()}`}>{plant.status}</span>
                    </div>
                    <span className="section-kicker">{plant.code}</span>
                    <h2>{plant.name}</h2>
                    <p className="plant-location"><MapPin size={14} />{plant.location}</p>
                    <p className="plant-role">{plant.role}</p>
                    <div className="utilization"><div><span>Capacity utilization</span><strong>{plant.utilization}%</strong></div><div className="utilization-track"><span style={{ width: `${plant.utilization}%` }} /></div></div>
                    <div className="plant-metrics">
                      <div><span>Capacity</span><strong>{plant.capacity}</strong></div>
                      <div><span>Employees</span><strong>{plant.employees}</strong></div>
                      <div><span>Storage locations</span><strong>{plant.storageLocations}</strong></div>
                      <div><span>Active orders</span><strong>{plant.activeOrders}</strong></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "partners" && (
            <section className="enterprise-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">SAP Business Partner master data</p><h1>Business partners</h1><p>Review suppliers and customers with commercial exposure, status, and risk context.</p></div>
                <div className="filter-tabs">
                  {(["All", "Supplier", "Customer"] as const).map((filter) => <button className={partnerFilter === filter ? "active" : ""} onClick={() => setPartnerFilter(filter)} key={filter}>{filter}</button>)}
                </div>
              </div>
              <div className="partner-table panel">
                <div className="partner-table-head"><span>Partner</span><span>Category</span><span>Location</span><span>Annual value</span><span>Open items</span><span>Risk</span><span>Status</span></div>
                {businessPartners.filter((partner) => partnerFilter === "All" || partner.category === partnerFilter).map((partner) => (
                  <div className="partner-row" key={partner.id}>
                    <div><strong>{partner.name}</strong><small>{partner.id} · {partner.role}</small></div>
                    <span className={`partner-category ${partner.category.toLowerCase()}`}>{partner.category}</span>
                    <span>{partner.city}, {partner.country}</span>
                    <strong>{partner.annualValue}</strong>
                    <strong>{partner.openItems}</strong>
                    <span className={`risk-chip ${partner.risk.toLowerCase()}`}>{partner.risk}</span>
                    <span className={`status-chip ${partner.status.toLowerCase()}`}>{partner.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === "history" && (
            <section className="history-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Connected enterprise chronology</p><h1>Simulation history</h1><p>Trace how decisions, disruptions, and SAP documents changed the enterprise from 2023 to 2026.</p></div>
                <span className="api-badge">API · /api/simulation/events</span>
              </div>

              <div className="year-comparison">
                {fiscalYearSummaries.map((summary) => (
                  <button
                    className={`year-card panel ${selectedYear === summary.year ? "active" : ""}`}
                    onClick={() => {
                      setSelectedYear(summary.year);
                      setEventCategory("All");
                      const firstEvent = enterpriseEvents.find((event) => event.fiscalYear === summary.year);
                      if (firstEvent) setSelectedEventId(firstEvent.id);
                    }}
                    key={summary.year}
                  >
                    <span>{summary.phase}</span>
                    <h2>{summary.year}</h2>
                    <div className="year-metrics"><div><small>Revenue</small><strong>{summary.revenue}</strong></div><div><small>Margin</small><strong>{summary.operatingMargin}</strong></div><div><small>Production</small><strong>{summary.production}</strong></div></div>
                    <p>{summary.narrative}</p>
                  </button>
                ))}
              </div>

              <div className="history-toolbar">
                <div><span className="section-kicker">{selectedYear}</span><h2>Enterprise events</h2></div>
                <div className="category-filters">
                  {eventCategories.map((category) => <button className={eventCategory === category ? "active" : ""} onClick={() => setEventCategory(category)} key={category}>{category}</button>)}
                </div>
              </div>

              <div className="history-layout">
                <div className="timeline panel">
                  {visibleEvents.map((event) => (
                    <button className={`timeline-event ${selectedEvent?.id === event.id ? "selected" : ""}`} onClick={() => setSelectedEventId(event.id)} key={event.id}>
                      <span className={`timeline-marker ${event.severity.toLowerCase()}`} />
                      <div className="timeline-date"><strong>{new Date(`${event.date}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</strong><span>{event.date.slice(0, 4)}</span></div>
                      <div className="timeline-copy"><div><span className="event-category">{event.category}</span><span className={`severity-badge ${event.severity.toLowerCase()}`}>{event.severity}</span></div><h3>{event.title}</h3><p>{event.summary}</p><small>{event.modules.join(" · ")}</small></div>
                      <ChevronRight size={17} />
                    </button>
                  ))}
                  {visibleEvents.length === 0 && <div className="empty-events">No events match this category in {selectedYear}.</div>}
                </div>

                {selectedEvent && selectedEvent.fiscalYear === selectedYear && (
                  <article className="event-detail panel">
                    <div className="event-detail-header">
                      <div><span className="section-kicker">{selectedEvent.id}</span><h2>{selectedEvent.title}</h2></div>
                      <span className={`status-chip ${selectedEvent.status.toLowerCase()}`}>{selectedEvent.status}</span>
                    </div>
                    <div className="event-meta"><span><CalendarDays size={14} />{new Date(`${selectedEvent.date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span><span><Clock3 size={14} />{selectedEvent.fiscalYear}</span></div>
                    <div className="cause-box"><TriangleAlert size={19} /><div><strong>Why did this happen?</strong><p>{selectedEvent.businessCause}</p></div></div>
                    <div className="document-chain">
                      <span className="section-kicker">Connected SAP documents</span>
                      <div>{selectedEvent.documents.map((document, index) => <div className="document-node" key={`${document.type}-${document.number}`}><FileText size={15} /><span>{document.type}</span><strong>{document.number}</strong>{index < selectedEvent.documents.length - 1 && <ArrowRight size={14} />}</div>)}</div>
                    </div>
                    <div className="impact-stack">
                      <div><span className="impact-icon operational"><Factory size={16} /></span><p><strong>Operational impact</strong>{selectedEvent.operationalImpact}</p></div>
                      <div><span className="impact-icon inventory"><Package size={16} /></span><p><strong>Inventory impact</strong>{selectedEvent.inventoryImpact}</p></div>
                      <div><span className="impact-icon financial"><TrendingUp size={16} /></span><p><strong>Financial impact</strong>{selectedEvent.financialImpact}</p></div>
                    </div>
                    <div className="resolution-box"><Check size={18} /><div><strong>SAP-enabled resolution</strong><p>{selectedEvent.resolution}</p></div></div>
                  </article>
                )}
              </div>
            </section>
          )}

          {view === "processes" && (
            <section className="process-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Document flow · Scenario {activeScenario.code}</p><h1>{activeScenario.title}</h1><p>Trace every SAP document and business impact across the complete process.</p></div>
                <button className="primary-button" onClick={() => setView("tutor")}><GraduationCap size={18} /> Learn this process</button>
              </div>
              <div className="scenario-tabs">
                {processScenarios.map((scenario) => (
                  <button className={activeScenarioId === scenario.id ? "active" : ""} onClick={() => setActiveScenarioId(scenario.id)} key={scenario.id}>
                    <span>{scenario.id.toUpperCase()}</span><strong>{scenario.title}</strong><small>{scenario.module}</small>
                  </button>
                ))}
              </div>
              <div className="process-context process-page-context">
                <div><span>Business scenario</span><strong>{activeScenario.scenario}</strong></div>
                <div><span>{activeScenario.partyLabel}</span><strong>{activeScenario.party}</strong></div>
                <div><span>Value</span><strong>{activeScenario.value}</strong></div>
              </div>
              <div className="process-map panel">
                {activeScenario.steps.map((step, index) => (
                  <div className={`map-step ${step.status}`} key={step.id}>
                    <div className="map-index">{step.status === "complete" ? <Check size={18} /> : index + 1}</div>
                    <div className="map-copy"><span>{step.module}</span><h3>{step.label}</h3><strong>{step.document}</strong></div>
                    <div className="map-impact">
                      <span>{step.status === "waiting" ? "Awaiting preceding document" : activeScenario.id === "p2p" && index === 2 ? "Inventory +£14,800 · GR/IR +£14,800" : activeScenario.id === "o2c" && index === 0 ? "Commercial commitment · No FI posting" : "Process document completed"}</span>
                    </div>
                    {index < activeScenario.steps.length - 1 && <ArrowRight className="map-arrow" size={20} />}
                  </div>
                ))}
              </div>
              <div className="impact-grid">
                {activeScenario.impacts.map((impact) => <article className="panel" key={impact.label}><span className="section-kicker">{impact.label}</span><h3>{impact.title}</h3><p>{impact.description}</p></article>)}
              </div>
            </section>
          )}

          {view === "tutor" && (
            <section className="tutor-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">{tutorMode === "guided" ? "Guided transaction" : "Troubleshooting lab"} · {activeScenario.module}</p><h1>{tutorMode === "guided" ? activeScenario.tutorTitle : troubleshootingCase.title}</h1><p>{tutorMode === "guided" ? activeScenario.tutorDescription : troubleshootingCase.businessContext}</p></div>
                <span className="lesson-count">{tutorMode === "guided" ? `Step ${activeProgress.step + 1} of ${activeScenario.tutorSteps.length}` : troubleshootingCase.id}</span>
              </div>
              <div className="scenario-tabs tutor-scenario-tabs">
                {processScenarios.map((scenario) => (
                  <button className={activeScenarioId === scenario.id ? "active" : ""} onClick={() => {
                    setActiveScenarioId(scenario.id);
                    setQuizAnswers((current) => ({ ...current, [scenario.id]: null }));
                  }} key={scenario.id}>
                    <span>{scenario.id.toUpperCase()}</span><strong>{scenario.title}</strong><small>{scenario.module}</small>
                  </button>
                ))}
              </div>
              <div className="tutor-mode-switch" role="tablist" aria-label="Tutor mode">
                <button className={tutorMode === "guided" ? "active" : ""} onClick={() => setTutorMode("guided")}><GraduationCap size={16} /><span><strong>Guided transaction</strong><small>Learn the correct SAP process step by step</small></span></button>
                <button className={tutorMode === "troubleshoot" ? "active" : ""} onClick={() => setTutorMode("troubleshoot")}><TriangleAlert size={16} /><span><strong>Troubleshooting lab</strong><small>Diagnose a realistic process failure</small></span></button>
              </div>
              {tutorMode === "guided" ? (
              <div className="tutor-layout">
                <aside className="lesson-nav panel">
                  <div className="lesson-nav-title"><span>Lesson progress</span><strong>{lessonProgress}%</strong></div>
                  <div className="progress-track"><span style={{ width: `${lessonProgress}%` }} /></div>
                  {activeScenario.tutorSteps.map((step, index) => (
                    <button className={index === activeProgress.step ? "current" : index < activeProgress.step ? "done" : ""} onClick={() => updateActiveProgress({ step: index })} key={step.number}>
                      <span>{index < activeProgress.step ? <Check size={14} /> : step.number}</span>
                      <div><small>Step {step.number}</small><strong>{step.title}</strong></div>
                    </button>
                  ))}
                </aside>

                <article className="lesson-content panel">
                  <div className="transaction-bar"><span>Fiori app</span><strong>{activeScenario.appName}</strong><code>{activeScenario.transactionCode}</code></div>
                  <span className="step-label">STEP {currentTutorStep.number}</span>
                  <h2>{currentTutorStep.title}</h2>
                  <p className="instruction">{currentTutorStep.instruction}</p>
                  {currentTutorStep.fields && (
                    <div className="field-preview">
                      {currentTutorStep.fields.map((field) => <div key={field.label}><span>{field.label}</span><strong>{field.value}</strong></div>)}
                    </div>
                  )}
                  <div className="explanation-box why"><Sparkles size={20} /><div><strong>Why are we doing this?</strong><p>{currentTutorStep.why}</p></div></div>
                  <div className="explanation-box result"><Check size={20} /><div><strong>What will you achieve?</strong><p>{currentTutorStep.result}</p></div></div>
                  {activeProgress.step === activeScenario.tutorSteps.length - 1 && (
                    <div className="knowledge-check">
                      <div className="knowledge-title"><Award size={20} /><div><span>Knowledge check</span><strong>{activeScenario.knowledgeCheck.question}</strong></div></div>
                      <div className="answer-list">
                        {activeScenario.knowledgeCheck.options.map((option, index) => {
                          const checked = activeQuizAnswer === index;
                          const isCorrect = checked && index === activeScenario.knowledgeCheck.correctIndex;
                          const isWrong = checked && index !== activeScenario.knowledgeCheck.correctIndex;
                          return (
                            <button
                              className={isCorrect ? "correct" : isWrong ? "wrong" : checked ? "selected" : ""}
                              onClick={() => {
                                setQuizAnswers((current) => ({ ...current, [activeScenarioId]: index }));
                                updateActiveProgress({ complete: false });
                              }}
                              key={option}
                            >
                              <span>{String.fromCharCode(65 + index)}</span>{option}
                            </button>
                          );
                        })}
                      </div>
                      {activeQuizAnswer !== null && (
                        <p className={activeQuizAnswer === activeScenario.knowledgeCheck.correctIndex ? "quiz-feedback correct" : "quiz-feedback wrong"}>
                          {activeQuizAnswer === activeScenario.knowledgeCheck.correctIndex ? activeScenario.knowledgeCheck.explanation : "Not quite. Revisit the document and accounting sequence, then try again."}
                        </p>
                      )}
                    </div>
                  )}
                  {activeProgress.complete && <div className="completion-banner"><Award size={22} /><div><strong>Lesson completed</strong><span>Your result and progress are saved to your learner account.</span></div></div>}
                  <div className="lesson-actions">
                    <button disabled={activeProgress.step === 0} onClick={() => updateActiveProgress({ step: activeProgress.step - 1 })}>Previous</button>
                    <button className="primary-button" disabled={activeProgress.step === activeScenario.tutorSteps.length - 1 && activeQuizAnswer !== activeScenario.knowledgeCheck.correctIndex} onClick={handleTutorNext}>
                      {activeProgress.step === activeScenario.tutorSteps.length - 1 ? "Complete lesson" : "Next step"} <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              </div>
              ) : (
                <div className="troubleshooting-layout">
                  <aside className="case-brief panel">
                    <div className="case-brief-header">
                      <span className={`severity-badge ${troubleshootingCase.severity.toLowerCase()}`}>{troubleshootingCase.severity}</span>
                      <code>{troubleshootingCase.id} · {diagnosticProgress[activeScenarioId].attempts} {diagnosticProgress[activeScenarioId].attempts === 1 ? "attempt" : "attempts"}</code>
                    </div>
                    <span className="section-kicker">System symptom</span>
                    <h2>{troubleshootingCase.symptom}</h2>
                    <p>{troubleshootingCase.businessContext}</p>
                    <div className="case-impact-preview">
                      <div><Factory size={16} /><span><strong>Operational</strong>{troubleshootingCase.impact.operational}</span></div>
                      <div><Package size={16} /><span><strong>Inventory</strong>{troubleshootingCase.impact.inventory}</span></div>
                      <div><TrendingUp size={16} /><span><strong>Financial</strong>{troubleshootingCase.impact.financial}</span></div>
                    </div>
                  </aside>

                  <div className="diagnostic-workspace">
                    <article className="panel evidence-panel">
                      <div className="diagnostic-heading"><Search size={19} /><div><span>Step 1</span><h2>Inspect the SAP evidence</h2></div></div>
                      <div className="evidence-grid">
                        {troubleshootingCase.evidence.map((item) => (
                          <div key={item.source}><span>{item.source}</span><strong>{item.finding}</strong></div>
                        ))}
                      </div>
                    </article>

                    <article className="panel diagnosis-panel">
                      <div className="diagnostic-heading"><TriangleAlert size={19} /><div><span>Step 2</span><h2>Identify the root cause</h2></div></div>
                      <p>Which diagnosis best explains all the evidence without inventing a transaction?</p>
                      <div className="diagnosis-options">
                        {troubleshootingCase.diagnoses.map((diagnosis, index) => {
                          const selected = diagnosisAnswer === index;
                          const correct =
                            (selected && diagnosisCorrect) ||
                            (diagnosticProgress[activeScenarioId].complete &&
                              index === troubleshootingCase.correctDiagnosis);
                          return (
                            <button
                              className={correct ? "correct" : selected ? "wrong" : ""}
                              disabled={diagnosticProgress[activeScenarioId].complete}
                              onClick={() => recordDiagnosis(index)}
                              key={diagnosis}
                            >
                              <span>{String.fromCharCode(65 + index)}</span>{diagnosis}
                            </button>
                          );
                        })}
                      </div>
                      {(diagnosisAnswer !== null ||
                        diagnosticProgress[activeScenarioId].complete) && (
                        <div className={diagnosisCorrect ? "diagnosis-feedback correct" : "diagnosis-feedback wrong"}>
                          {diagnosisCorrect ? <Check size={18} /> : <TriangleAlert size={18} />}
                          <p><strong>{diagnosisCorrect ? "Root cause confirmed" : "That does not explain all the evidence"}</strong>{diagnosisCorrect ? troubleshootingCase.explanation : "Compare the proposed cause with each SAP finding, then choose again."}</p>
                        </div>
                      )}
                    </article>

                    {diagnosisCorrect && (
                      <article className="panel recovery-panel">
                        <div className="diagnostic-heading"><Check size={19} /><div><span>Step 3</span><h2>Execute the controlled recovery</h2></div></div>
                        <div className="recovery-steps">
                          {troubleshootingCase.recoverySteps.map((step, index) => (
                            <div key={step.action}>
                              <span>{index + 1}</span>
                              <div><h3>{step.action}</h3><code>{step.sap}</code><p>{step.why}</p></div>
                            </div>
                          ))}
                        </div>
                        <div className="prevention-note"><Sparkles size={18} /><p><strong>Prevent recurrence</strong>{troubleshootingCase.prevention}</p></div>
                      </article>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {enterpriseOpen && (
        <div className="enterprise-overlay" onClick={() => setEnterpriseOpen(false)}>
          <section className="enterprise-dialog" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span className="section-kicker">SAP Enterprise Simulation Cloud</span>
                <h2>Choose an industry environment</h2>
                <p>
                  The brewery simulation is live with connected transactions.
                  Select a planned industry to save it as your roadmap preference.
                </p>
              </div>
              <button onClick={() => setEnterpriseOpen(false)} aria-label="Close enterprise selector"><X size={19} /></button>
            </header>
            <div className="enterprise-live-banner">
              <Factory size={21} />
              <div><span>Active workspace</span><strong>{activeEnterprise.enterprise}</strong><small>{activeEnterprise.operatingModel} · {activeEnterprise.companyCode}</small></div>
              <span className="status-chip operating">Live</span>
            </div>
            <div className="industry-grid">
              {industryEnterprises.map((enterprise) => {
                const selected = preferredIndustryId === enterprise.id;
                return (
                  <article className={`industry-card ${enterprise.status} ${selected ? "selected" : ""}`} key={enterprise.id}>
                    <div className="industry-card-top">
                      <span className={enterprise.status === "live" ? "status-chip operating" : "status-chip planned"}>{enterprise.status === "live" ? "Live" : enterprise.release}</span>
                      {selected && <span className="preference-check"><Check size={13} /> Selected</span>}
                    </div>
                    <span className="industry-name">{enterprise.industry}</span>
                    <h3>{enterprise.enterprise}</h3>
                    <p>{enterprise.description}</p>
                    <small>{enterprise.operatingModel}</small>
                    <div className="industry-modules">
                      {enterprise.modules.map((module) => <span key={module}>{module}</span>)}
                    </div>
                    <button
                      className={selected ? "selected" : ""}
                      onClick={() => {
                        setPreferredIndustryId(enterprise.id);
                        setEnterpriseOpen(false);
                      }}
                    >
                      {enterprise.status === "live"
                        ? selected
                          ? "Current enterprise"
                          : "Open enterprise"
                        : selected
                          ? "Roadmap preference saved"
                          : "Set as roadmap preference"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="search-input-row"><Search size={20} /><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search code, company, plant, supplier, or customer..." /><button onClick={() => setSearchOpen(false)}><X size={18} /></button></div>
            <div className="search-results">
              {!normalizedQuery && <p>Try “BR01”, “Highland”, “customer”, or “storage”.</p>}
              {normalizedQuery && searchResults.length === 0 && <p>No SAP objects matched your search.</p>}
              {searchResults.map((result) => (
                <button onClick={() => {
                  if (result.target === "history") {
                    const event = enterpriseEvents.find((item) => item.id === result.id);
                    if (event) {
                      setSelectedYear(event.fiscalYear);
                      setEventCategory("All");
                      setSelectedEventId(event.id);
                    }
                  }
                  navigateTo(result.target);
                }} key={`${result.target}-${result.id}`}>
                  <span className="result-code">{result.id}</span><div><strong>{result.title}</strong><small>{result.subtitle}</small></div><ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button className="mentor-fab" onClick={() => setMentorOpen(true)}><MessageCircleMore size={21} /><span>Ask SAP Mentor</span></button>
      {mentorOpen && (
        <aside className="mentor-panel">
          <div className="mentor-header">
            <div className="mentor-avatar"><Sparkles size={19} /></div>
            <div><strong>SAP Mentor</strong><span><i /> Context-aware assistant</span></div>
            <button onClick={() => setMentorOpen(false)}><X size={19} /></button>
          </div>
          <div className="mentor-context"><Factory size={16} /> Burton Brewery · {activeScenario.code}</div>
          <div className="mentor-body">
            <div className="mentor-message">{answer}</div>
            <p>Suggested questions</p>
            {Object.keys(mentorAnswers).map((prompt) => <button key={prompt} onClick={() => askMentor(prompt)}>{prompt}<ChevronRight size={14} /></button>)}
          </div>
          <form className="mentor-input" onSubmit={(event) => { event.preventDefault(); askMentor(question); }}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this transaction..." />
            <button type="submit" aria-label="Send question"><Send size={17} /></button>
          </form>
        </aside>
      )}
    </div>
  );
}
