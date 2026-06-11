"use client";

import {
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
  Menu,
  MessageCircleMore,
  Search,
  Send,
  Settings,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  activity,
  kpis,
  mentorAnswers,
  processSteps,
  tutorSteps,
} from "@/data/simulation";

type View = "overview" | "processes" | "tutor";

const navigation = [
  { id: "overview" as const, label: "Enterprise overview", icon: LayoutDashboard },
  { id: "processes" as const, label: "Process explorer", icon: Boxes },
  { id: "tutor" as const, label: "Transaction tutor", icon: GraduationCap },
];

export function SapWorld() {
  const [view, setView] = useState<View>("overview");
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lessonStep, setLessonStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "I’m connected to the Burton Brewery simulation. Ask me about this goods receipt, its accounting impact, or what happens next.",
  );

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
                <div><span className="section-kicker">Your learning path</span><h3>Receiving materials with quality inspection</h3><p>Lesson 4 of 8 · Understand the inventory and financial impact of a goods receipt.</p></div>
                <div className="lesson-progress"><strong>50%</strong><div><span /></div></div>
                <button onClick={() => setView("tutor")}>Resume lesson <ChevronRight size={16} /></button>
              </section>
            </>
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
                  <div className="lesson-nav-title"><span>Lesson progress</span><strong>{Math.round(((lessonStep + 1) / tutorSteps.length) * 100)}%</strong></div>
                  <div className="progress-track"><span style={{ width: `${((lessonStep + 1) / tutorSteps.length) * 100}%` }} /></div>
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
                  <div className="lesson-actions">
                    <button disabled={lessonStep === 0} onClick={() => setLessonStep((step) => step - 1)}>Previous</button>
                    <button className="primary-button" onClick={() => setLessonStep((step) => Math.min(step + 1, tutorSteps.length - 1))}>
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
