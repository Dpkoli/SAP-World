"use client";

import {
  Award,
  ArrowRight,
  BookOpenCheck,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Factory,
  GraduationCap,
  LayoutDashboard,
  Lock,
  Menu,
  MessageCircleMore,
  PlayCircle,
  Search,
  Send,
  Settings,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  activity,
  knowledgeCheck,
  kpis,
  learningPaths,
  mentorAnswers,
  processCatalog,
  processSteps,
  tutorSteps,
} from "@/data/simulation";

type View = "overview" | "academy" | "processes" | "tutor";

const navigation = [
  { id: "overview" as const, label: "Enterprise overview", icon: LayoutDashboard },
  { id: "academy" as const, label: "Learning centre", icon: BookOpenCheck },
  { id: "processes" as const, label: "Process explorer", icon: Boxes },
  { id: "tutor" as const, label: "Transaction tutor", icon: GraduationCap },
];

export function SapWorld() {
  const [view, setView] = useState<View>("overview");
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lessonStep, setLessonStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "I’m connected to the Burton Brewery simulation. Ask me about this goods receipt, its accounting impact, or what happens next.",
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem("sap-world-progress");
      if (saved) {
        try {
          const progress = JSON.parse(saved) as {
            lessonStep?: number;
            lessonComplete?: boolean;
          };
          setLessonStep(
            Math.min(progress.lessonStep ?? 0, tutorSteps.length - 1),
          );
          setLessonComplete(Boolean(progress.lessonComplete));
        } catch {
          window.localStorage.removeItem("sap-world-progress");
        }
      }
      setProgressLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    window.localStorage.setItem(
      "sap-world-progress",
      JSON.stringify({ lessonStep, lessonComplete }),
    );
  }, [lessonComplete, lessonStep, progressLoaded]);

  function askMentor(prompt: string) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    setAnswer(
      mentorAnswers[cleanPrompt] ??
        `This question relates to the active goods receipt for PO 4500011842. In this simulation, SAP connects the purchasing document, material movement, inspection lot, and FI posting so you can trace the full business impact.`,
    );
    setQuestion("");
  }

  const currentTutorStep = tutorSteps[lessonStep];
  const lessonProgress = lessonComplete
    ? 100
    : Math.round(((lessonStep + 1) / tutorSteps.length) * 100);

  function handleTutorNext() {
    if (lessonStep < tutorSteps.length - 1) {
      setLessonStep((step) => step + 1);
      return;
    }
    if (quizAnswer === knowledgeCheck.correctIndex) {
      setLessonComplete(true);
    }
  }

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
                setView(item.id);
                setMobileOpen(false);
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <p className="nav-label nav-spacer">Enterprise</p>
          <button className="nav-item"><Building2 size={18} />Company structure</button>
          <button className="nav-item"><Factory size={18} />Plants & operations</button>
          <button className="nav-item"><Users size={18} />Business partners</button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item"><Settings size={18} />Settings</button>
          <div className="user-card">
            <div className="avatar">DK</div>
            <div><strong>Deepa Koli</strong><span>SAP learner</span></div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div className="enterprise-switcher">
            <span className="company-icon"><Factory size={17} /></span>
            <div>
              <span>Active enterprise</span>
              <strong>Burton Craft Beverages Ltd.</strong>
            </div>
            <ChevronRight size={17} />
          </div>
          <div className="topbar-actions">
            <button className="search-button"><Search size={18} /><span>Search SAP objects</span><kbd>⌘ K</kbd></button>
            <button className="help-button"><CircleHelp size={20} /></button>
          </div>
        </header>

        <div className="content">
          {view === "overview" && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">Thursday, 12 June 2026 · Period 03</p>
                  <h1>Good morning, Deepa</h1>
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
                    <button onClick={() => setView("processes")}>View full flow <ArrowRight size={15} /></button>
                  </div>
                  <div className="process-context">
                    <div><span>Business scenario</span><strong>Raw material replenishment</strong></div>
                    <div><span>Supplier</span><strong>Highland Maltings PLC</strong></div>
                    <div><span>Value</span><strong>£14,800.00</strong></div>
                  </div>
                  <div className="flow">
                    {processSteps.map((step, index) => (
                      <div className={`flow-item ${step.status}`} key={step.id}>
                        <div className="flow-node">{step.status === "complete" ? <Check size={16} /> : index + 1}</div>
                        <div><strong>{step.label}</strong><span>{step.document}</span></div>
                        {index < processSteps.length - 1 && <div className="flow-line" />}
                      </div>
                    ))}
                  </div>
                  <div className="attention">
                    <TriangleAlert size={20} />
                    <div><strong>Action required: Complete quality inspection</strong><span>Inspection lot 0400001844 is blocking 20,000 KG from production use.</span></div>
                    <button onClick={() => setView("tutor")}>Start guided task</button>
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
                <div><span className="section-kicker">Your learning path</span><h3>Receiving materials with quality inspection</h3><p>{lessonComplete ? "Lesson complete · Knowledge check passed." : `Step ${lessonStep + 1} of ${tutorSteps.length} · Your progress is saved automatically.`}</p></div>
                <div className="lesson-progress"><strong>{lessonProgress}%</strong><div><span style={{ width: `${lessonProgress}%` }} /></div></div>
                <button onClick={() => setView("tutor")}>Resume lesson <ChevronRight size={16} /></button>
              </section>
            </>
          )}

          {view === "academy" && (
            <section className="academy-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Role-based SAP learning</p><h1>Learning centre</h1><p>Build practical skills through connected work performed inside the simulated enterprise.</p></div>
                <div className="academy-score"><Award size={20} /><div><span>Learning score</span><strong>{lessonComplete ? "180" : "120"} XP</strong></div></div>
              </div>

              <div className="academy-summary">
                <article className="panel"><span>Current role</span><strong>Warehouse Operative</strong><small>Burton Brewery · Plant BR01</small></article>
                <article className="panel"><span>Lessons completed</span><strong>{lessonComplete ? "1 of 4" : "0 of 4"}</strong><small>Foundation pathway</small></article>
                <article className="panel"><span>Process coverage</span><strong>3 modules</strong><small>MM · QM · FI</small></article>
              </div>

              <div className="catalog-heading"><div><span className="section-kicker">Recommended pathways</span><h2>Learn through real business scenarios</h2></div><span>4 pathways</span></div>
              <div className="path-grid">
                {learningPaths.map((path) => {
                  const available = path.status === "available";
                  const progress = available ? lessonProgress : path.progress;
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
                      <button
                        disabled={!available}
                        onClick={() => setView("tutor")}
                      >
                        {available ? <><PlayCircle size={16} /> {lessonComplete ? "Review lesson" : progress > 0 ? "Continue pathway" : "Start pathway"}</> : "Coming soon"}
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="catalog-heading process-catalog-heading"><div><span className="section-kicker">Enterprise coverage</span><h2>End-to-end process curriculum</h2></div></div>
              <div className="curriculum-table panel">
                {processCatalog.map((process) => (
                  <div className="curriculum-row" key={process.name}>
                    <span className="process-code">{process.code}</span>
                    <div><strong>{process.name}</strong><small>{process.modules}</small></div>
                    <span>{process.scenarios} scenarios</span>
                    <div className="readiness"><div><span style={{ width: `${process.readiness}%` }} /></div><strong>{process.readiness}% ready</strong></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === "processes" && (
            <section className="process-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Document flow · Scenario P2P-2026-0148</p><h1>Procure to Pay</h1><p>Trace every SAP document and business impact from demand to payment.</p></div>
                <button className="primary-button" onClick={() => setView("tutor")}><GraduationCap size={18} /> Learn this process</button>
              </div>
              <div className="process-map panel">
                {processSteps.map((step, index) => (
                  <div className={`map-step ${step.status}`} key={step.id}>
                    <div className="map-index">{step.status === "complete" ? <Check size={18} /> : index + 1}</div>
                    <div className="map-copy"><span>{step.module}</span><h3>{step.label}</h3><strong>{step.document}</strong></div>
                    <div className="map-impact">
                      <span>{index < 2 ? "No accounting impact" : index === 2 ? "Inventory +£14,800 · GR/IR +£14,800" : "Awaiting preceding document"}</span>
                    </div>
                    {index < processSteps.length - 1 && <ArrowRight className="map-arrow" size={20} />}
                  </div>
                ))}
              </div>
              <div className="impact-grid">
                <article className="panel"><span className="section-kicker">Inventory impact</span><h3>20,000 KG received</h3><p>Pale Ale Malt is held in quality inspection stock at BR01 / RM01 until a usage decision is recorded.</p></article>
                <article className="panel"><span className="section-kicker">Accounting impact</span><h3>Dr Inventory / Cr GR-IR</h3><p>The receipt recognizes the asset before the supplier invoice creates a payable.</p></article>
                <article className="panel"><span className="section-kicker">Operational impact</span><h3>Production supply protected</h3><p>The batch covers seven days of planned brewing demand, subject to quality release.</p></article>
              </div>
            </section>
          )}

          {view === "tutor" && (
            <section className="tutor-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Guided mode · SAP MM</p><h1>Post a goods receipt</h1><p>Learn with real values from the Burton Brewery simulation.</p></div>
                <span className="lesson-count">Step {lessonStep + 1} of {tutorSteps.length}</span>
              </div>
              <div className="tutor-layout">
                <aside className="lesson-nav panel">
                  <div className="lesson-nav-title"><span>Lesson progress</span><strong>{lessonProgress}%</strong></div>
                  <div className="progress-track"><span style={{ width: `${lessonProgress}%` }} /></div>
                  {tutorSteps.map((step, index) => (
                    <button className={index === lessonStep ? "current" : index < lessonStep ? "done" : ""} onClick={() => setLessonStep(index)} key={step.number}>
                      <span>{index < lessonStep ? <Check size={14} /> : step.number}</span>
                      <div><small>Step {step.number}</small><strong>{step.title}</strong></div>
                    </button>
                  ))}
                </aside>

                <article className="lesson-content panel">
                  <div className="transaction-bar"><span>Fiori app</span><strong>Post Goods Receipt for Purchasing Document</strong><code>MIGO</code></div>
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
                  {lessonStep === tutorSteps.length - 1 && (
                    <div className="knowledge-check">
                      <div className="knowledge-title"><Award size={20} /><div><span>Knowledge check</span><strong>{knowledgeCheck.question}</strong></div></div>
                      <div className="answer-list">
                        {knowledgeCheck.options.map((option, index) => {
                          const checked = quizAnswer === index;
                          const isCorrect = checked && index === knowledgeCheck.correctIndex;
                          const isWrong = checked && index !== knowledgeCheck.correctIndex;
                          return (
                            <button
                              className={isCorrect ? "correct" : isWrong ? "wrong" : checked ? "selected" : ""}
                              onClick={() => {
                                setQuizAnswer(index);
                                setLessonComplete(false);
                              }}
                              key={option}
                            >
                              <span>{String.fromCharCode(65 + index)}</span>{option}
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswer !== null && (
                        <p className={quizAnswer === knowledgeCheck.correctIndex ? "quiz-feedback correct" : "quiz-feedback wrong"}>
                          {quizAnswer === knowledgeCheck.correctIndex ? knowledgeCheck.explanation : "Not quite. Think about when SAP creates an accounts-payable document and try again."}
                        </p>
                      )}
                    </div>
                  )}
                  {lessonComplete && <div className="completion-banner"><Award size={22} /><div><strong>Lesson completed</strong><span>Your result and progress are saved on this device.</span></div></div>}
                  <div className="lesson-actions">
                    <button disabled={lessonStep === 0} onClick={() => setLessonStep((step) => step - 1)}>Previous</button>
                    <button className="primary-button" disabled={lessonStep === tutorSteps.length - 1 && quizAnswer !== knowledgeCheck.correctIndex} onClick={handleTutorNext}>
                      {lessonStep === tutorSteps.length - 1 ? "Complete lesson" : "Next step"} <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              </div>
            </section>
          )}
        </div>
      </main>

      <button className="mentor-fab" onClick={() => setMentorOpen(true)}><MessageCircleMore size={21} /><span>Ask SAP Mentor</span></button>
      {mentorOpen && (
        <aside className="mentor-panel">
          <div className="mentor-header">
            <div className="mentor-avatar"><Sparkles size={19} /></div>
            <div><strong>SAP Mentor</strong><span><i /> Context-aware assistant</span></div>
            <button onClick={() => setMentorOpen(false)}><X size={19} /></button>
          </div>
          <div className="mentor-context"><Factory size={16} /> Burton Brewery · PO 4500011842</div>
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
