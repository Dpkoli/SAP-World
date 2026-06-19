"use client";

import {
  Award,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Factory,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  ListTree,
  Lock,
  MapPin,
  Menu,
  MessageCircleMore,
  Package,
  PlayCircle,
  Repeat2,
  Search,
  Send,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  learnerInitials,
  roleLabels,
  rolePermissions,
  type LearnerProfile,
} from "@/data/auth";
import {
  analyticsMetrics,
  driversForYear,
  metricLabel,
  metricValue,
  performanceDrivers,
  periodsForYear,
  profitabilitySegments,
  type AnalyticsMetric,
} from "@/data/analytics";
import { documentFlowFor } from "@/data/document-flows";
import type {
  GovernanceAction,
  GovernanceCase,
} from "@/data/governance";
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
  mentorSuggestions,
  type MentorSource,
} from "@/data/mentor";
import type {
  AdvancedTransactionCase,
  AdvancedTransactionType,
} from "@/data/advanced-transactions";
import { implementationBlueprintFor } from "@/data/implementation";
import {
  batches,
  billsOfMaterial,
  masterDataForScenario,
  materialById,
  materials,
  qualitySpecifications,
  routings,
  sourceRecords,
  workCenters,
} from "@/data/master-data";
import {
  defaultIndustryId,
  industryById,
  industryEnterprises,
  type IndustryId,
} from "@/data/industries";
import {
  industryBlueprintById,
} from "@/data/industry-blueprints";
import {
  simulationFiscalYears,
  type GeneratedSimulation,
  type SimulationFiscalYear,
} from "@/data/generated-simulations";
import {
  simulationLedgerProcesses,
  type SimulationLedgerDocument,
  type SimulationLedgerProcess,
  type SimulationLedgerSummary,
} from "@/data/simulation-ledger";
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
  processCatalog,
  processScenarios,
} from "@/data/simulation";
import { transactionPlaybooks } from "@/data/transaction-playbooks";
import { troubleshootingCaseFor } from "@/data/troubleshooting";
import type {
  WorkflowAction,
  WorkflowCase,
} from "@/data/workflows";

type View =
  | "overview"
  | "academy"
  | "industries"
  | "studio"
  | "processes"
  | "advanced"
  | "tutor"
  | "history"
  | "analytics"
  | "governance"
  | "workflows"
  | "structure"
  | "masterdata"
  | "plants"
  | "partners"
  | "admin";

type AdminOperations = {
  generatedAt: string;
  storage: {
    backend: "local-file" | "postgresql";
    durable: boolean;
    configured: boolean;
    checkedAt?: string;
  };
  mentor: {
    mode: "local" | "external";
    configured: boolean;
    endpointConfigured: boolean;
    apiKeyConfigured: boolean;
    model: string | null;
    timeoutMs: number;
  };
  readiness: {
    status: "Ready" | "Ready with warnings" | "Blocked";
    summary: {
      checks: number;
      passed: number;
      warnings: number;
      failed: number;
    };
    deploymentGate: string;
  };
  observability: {
    retention: {
      maxEvents: number;
      storedEvents: number;
    };
    totals: {
      events: number;
      recent24h: number;
      successes: number;
      warnings: number;
      failures: number;
    };
  };
  accounts: {
    users: number;
    roles: { learner: number; admin: number };
    sessions: { total: number; active: number; expired: number };
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: LearnerProfile["role"];
      createdAt: string;
    }>;
  };
  progress: {
    learners: number;
    completedLessons: number;
    completedDiagnostics: number;
    latestUpdatedAt: string | null;
  };
  capstones: {
    learners: number;
    submissions: number;
    reviewReady: number;
    strongEvidence: number;
    needsPractice: number;
    latestSubmittedAt: string | null;
    processBreakdown: Array<{
      scenarioId: ScenarioId;
      processCode: string;
      title: string;
      submissions: number;
      reviewReady: number;
      averageScore: number;
    }>;
  };
  simulations: {
    learners: number;
    simulations: number;
    industries: number;
    latestGeneratedAt: string | null;
  };
  ledgerAnalytics: {
    totals: {
      documents: number;
      processChains: number;
      transactionValue: number;
      journalDocuments: number;
      exceptions: number;
    };
    integrity: {
      status: "Passed" | "Failed";
      brokenLinks: number;
      orphanDocuments: number;
      uniqueDocumentNumbers: number;
    };
  };
  contentControl: {
    domains: number;
    released: number;
    reviewRequired: number;
    blocked: number;
    averageReadiness: number;
    records: number;
  };
  content: Record<string, number>;
  controls: string[];
};

type TutorReadinessReview = {
  generatedAt: string;
  overall: {
    score: number;
    level: "Not started" | "In progress" | "Practice ready" | "Scenario ready";
    completedLessons: number;
    completedDiagnostics: number;
    processes: number;
  };
  nextBestActions: string[];
  processes: Array<{
    scenarioId: ScenarioId;
    processCode: string;
    title: string;
    module: string;
    score: number;
    level: "Not started" | "In progress" | "Practice ready" | "Scenario ready";
    guidedProgress: number;
    diagnosticProgress: number;
    completedStages: number;
    totalStages: number;
    nextAction: string;
    weakAreas: string[];
    evidence: string[];
  }>;
};

type TutorCapstoneReview = {
  generatedAt: string;
  summary: {
    challenges: number;
    open: number;
    readyForReview: number;
    locked: number;
    portfolioReadiness: number;
  };
  submissions: {
    total: number;
    reviewReady: number;
    latestSubmittedAt: string | null;
  };
  challenges: Array<{
    scenarioId: ScenarioId;
    processCode: string;
    title: string;
    module: string;
    status: "Locked" | "Open" | "Ready for review";
    readinessScore: number;
    prompt: string;
    requiredEvidence: string[];
    tasks: string[];
    rubric: Array<{
      area: string;
      points: number;
      expectation: string;
    }>;
    remediation: string[];
    submissions: number;
    latestSubmission: {
      id: string;
      submittedAt: string;
      response: string;
      score: number;
      status: "Needs practice" | "Review ready" | "Strong evidence";
      feedback: string[];
      rubricScores: Array<{
        area: string;
        points: number;
        awarded: number;
        feedback: string;
      }>;
    } | null;
  }>;
};

const navigation = [
  { id: "overview" as const, label: "Enterprise overview", icon: LayoutDashboard },
  { id: "academy" as const, label: "Learning centre", icon: BookOpenCheck },
  { id: "industries" as const, label: "Industry blueprints", icon: Landmark },
  { id: "studio" as const, label: "Simulation studio", icon: Sparkles },
  { id: "processes" as const, label: "Process explorer", icon: Boxes },
  { id: "advanced" as const, label: "Advanced transactions", icon: Repeat2 },
  { id: "analytics" as const, label: "Performance analytics", icon: BarChart3 },
  { id: "history" as const, label: "Simulation history", icon: CalendarDays },
  { id: "workflows" as const, label: "Approval inbox", icon: ClipboardCheck },
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
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<
    Partial<Record<ScenarioId, string>>
  >({ p2p: "GR" });
  const [preferredIndustryId, setPreferredIndustryId] =
    useState<IndustryId>(defaultIndustryId);
  const [selectedIndustryBlueprintId, setSelectedIndustryBlueprintId] =
    useState<IndustryId>(defaultIndustryId);
  const [studioIndustryId, setStudioIndustryId] =
    useState<IndustryId>(defaultIndustryId);
  const [studioFiscalYear, setStudioFiscalYear] =
    useState<SimulationFiscalYear>("2025-2026");
  const [studioEventIndex, setStudioEventIndex] = useState(0);
  const [generatedSimulations, setGeneratedSimulations] = useState<
    GeneratedSimulation[]
  >([]);
  const [selectedSimulationId, setSelectedSimulationId] = useState("");
  const [studioLoading, setStudioLoading] = useState(true);
  const [studioError, setStudioError] = useState("");
  const [studioExecutionNote, setStudioExecutionNote] = useState("");
  const [studioLedgerSummary, setStudioLedgerSummary] =
    useState<SimulationLedgerSummary | null>(null);
  const [studioLedgerDocuments, setStudioLedgerDocuments] = useState<
    SimulationLedgerDocument[]
  >([]);
  const [studioLedgerYear, setStudioLedgerYear] = useState<
    "All" | SimulationFiscalYear
  >("All");
  const [studioLedgerProcess, setStudioLedgerProcess] = useState<
    "All" | SimulationLedgerProcess
  >("All");
  const [selectedLedgerDocumentId, setSelectedLedgerDocumentId] = useState("");
  const [studioLedgerLoading, setStudioLedgerLoading] = useState(false);
  const [studioLedgerError, setStudioLedgerError] = useState("");
  const [scenarioProgress, setScenarioProgress] = useState<ScenarioProgress>(defaultScenarioProgress);
  const [diagnosticProgress, setDiagnosticProgress] = useState<DiagnosticProgress>(defaultDiagnosticProgress);
  const [quizAnswers, setQuizAnswers] = useState<Record<ScenarioId, number | null>>({ p2p: null, o2c: null, ptp: null, r2r: null, qm: null, pm: null, h2r: null, w2d: null });
  const [tutorMode, setTutorMode] = useState<
    "guided" | "troubleshoot" | "implementation" | "capstone"
  >("guided");
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<Record<ScenarioId, number | null>>({ p2p: null, o2c: null, ptp: null, r2r: null, qm: null, pm: null, h2r: null, w2d: null });
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "saving" | "saved" | "offline">("loading");
  const [tutorReadiness, setTutorReadiness] =
    useState<TutorReadinessReview | null>(null);
  const [tutorReadinessError, setTutorReadinessError] = useState("");
  const [tutorCapstone, setTutorCapstone] =
    useState<TutorCapstoneReview | null>(null);
  const [tutorCapstoneError, setTutorCapstoneError] = useState("");
  const [capstoneResponse, setCapstoneResponse] = useState("");
  const [capstoneSubmitting, setCapstoneSubmitting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<"All" | "Supplier" | "Customer">("All");
  const [selectedMaterialId, setSelectedMaterialId] = useState("FG-AMBER-KEG-50");
  const [materialTypeFilter, setMaterialTypeFilter] = useState("All");
  const [governanceCases, setGovernanceCases] = useState<GovernanceCase[]>([]);
  const [selectedGovernanceId, setSelectedGovernanceId] =
    useState("MDG-BP-260031");
  const [governanceDomain, setGovernanceDomain] = useState("All");
  const [governanceComment, setGovernanceComment] = useState("");
  const [governanceLoading, setGovernanceLoading] = useState(true);
  const [governanceError, setGovernanceError] = useState("");
  const [workflows, setWorkflows] = useState<WorkflowCase[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("WF-O2C-CREDIT-001");
  const [workflowFilter, setWorkflowFilter] = useState("All");
  const [workflowComment, setWorkflowComment] = useState("");
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [workflowError, setWorkflowError] = useState("");
  const [workflowOverdue, setWorkflowOverdue] = useState(0);
  const [advancedTransactions, setAdvancedTransactions] = useState<
    AdvancedTransactionCase[]
  >([]);
  const [selectedAdvancedId, setSelectedAdvancedId] =
    useState("ADV-STO-001");
  const [advancedTypeFilter, setAdvancedTypeFilter] = useState<
    "All" | AdvancedTransactionType
  >("All");
  const [advancedNote, setAdvancedNote] = useState("");
  const [advancedLoading, setAdvancedLoading] = useState(true);
  const [advancedError, setAdvancedError] = useState("");
  const [selectedYear, setSelectedYear] = useState<FiscalYear>("2025–2026");
  const [analyticsYear, setAnalyticsYear] = useState<FiscalYear>("2025–2026");
  const [analyticsMetric, setAnalyticsMetric] =
    useState<AnalyticsMetric>("Operating margin");
  const [selectedDriverId, setSelectedDriverId] =
    useState("DRV-FY26-RETURN");
  const [profitabilityDimension, setProfitabilityDimension] =
    useState<"Product" | "Customer" | "Channel">("Product");
  const [eventCategory, setEventCategory] = useState("All");
  const [selectedEventId, setSelectedEventId] = useState("EVT-2604-035");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "I’m grounded in the Burton Brewery simulation. Ask about the active transaction, its document flow, accounting or inventory impact, or a process exception.",
  );
  const [mentorSources, setMentorSources] = useState<MentorSource[]>([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState("");
  const [adminOperations, setAdminOperations] =
    useState<AdminOperations | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGeneratedSimulations() {
      setStudioLoading(true);
      try {
        const response = await fetch("/api/simulation-studio", {
          cache: "no-store",
        });
        const result = (await response.json()) as {
          simulations?: GeneratedSimulation[];
          error?: string;
        };
        if (!response.ok || !result.simulations) {
          throw new Error(
            result.error ?? "Simulation Studio service unavailable.",
          );
        }
        if (!cancelled) {
          setGeneratedSimulations(result.simulations);
          setSelectedSimulationId((current) =>
            current || result.simulations?.[0]?.id || "",
          );
          setStudioError("");
        }
      } catch (error) {
        if (!cancelled) {
          setStudioError(
            error instanceof Error
              ? error.message
              : "Simulation Studio service unavailable.",
          );
        }
      } finally {
        if (!cancelled) setStudioLoading(false);
      }
    }

    void loadGeneratedSimulations();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!selectedSimulationId) return;

    let cancelled = false;

    async function loadSimulationLedger() {
      setStudioLedgerLoading(true);
      setStudioLedgerError("");
      const search = new URLSearchParams();
      if (studioLedgerYear !== "All") {
        search.set("year", studioLedgerYear);
      }
      if (studioLedgerProcess !== "All") {
        search.set("process", studioLedgerProcess);
      }
      const query = search.size ? `?${search.toString()}` : "";

      try {
        const response = await fetch(
          `/api/simulation-studio/${selectedSimulationId}/ledger${query}`,
          { cache: "no-store" },
        );
        const result = (await response.json()) as {
          summary?: SimulationLedgerSummary;
          documents?: SimulationLedgerDocument[];
          error?: string;
        };
        if (!response.ok || !result.summary || !result.documents) {
          throw new Error(
            result.error ?? "Enterprise ledger service unavailable.",
          );
        }
        if (!cancelled) {
          setStudioLedgerSummary(result.summary);
          setStudioLedgerDocuments(result.documents);
          setSelectedLedgerDocumentId((current) =>
            result.documents!.some((document) => document.id === current)
              ? current
              : result.documents![0]?.id ?? "",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setStudioLedgerError(
            error instanceof Error
              ? error.message
              : "Enterprise ledger service unavailable.",
          );
          setStudioLedgerSummary(null);
          setStudioLedgerDocuments([]);
        }
      } finally {
        if (!cancelled) setStudioLedgerLoading(false);
      }
    }

    void loadSimulationLedger();
    return () => {
      cancelled = true;
    };
  }, [selectedSimulationId, studioLedgerProcess, studioLedgerYear]);

  useEffect(() => {
    let cancelled = false;

    async function loadAdvancedTransactions() {
      setAdvancedLoading(true);
      try {
        const response = await fetch("/api/advanced-transactions", {
          cache: "no-store",
        });
        const result = (await response.json()) as {
          transactions?: AdvancedTransactionCase[];
          error?: string;
        };
        if (!response.ok || !result.transactions) {
          throw new Error(
            result.error ?? "Advanced transaction service unavailable.",
          );
        }
        if (!cancelled) {
          setAdvancedTransactions(result.transactions);
          setAdvancedError("");
        }
      } catch (error) {
        if (!cancelled) {
          setAdvancedError(
            error instanceof Error
              ? error.message
              : "Advanced transaction service unavailable.",
          );
        }
      } finally {
        if (!cancelled) setAdvancedLoading(false);
      }
    }

    void loadAdvancedTransactions();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

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
    let cancelled = false;

    async function loadGovernance() {
      setGovernanceLoading(true);
      try {
        const response = await fetch("/api/governance", { cache: "no-store" });
        const result = (await response.json()) as {
          requests?: GovernanceCase[];
          error?: string;
        };
        if (!response.ok || !result.requests) {
          throw new Error(result.error ?? "Governance service unavailable.");
        }
        if (!cancelled) {
          setGovernanceCases(result.requests);
          setGovernanceError("");
        }
      } catch (error) {
        if (!cancelled) {
          setGovernanceError(
            error instanceof Error
              ? error.message
              : "Governance service unavailable.",
          );
        }
      } finally {
        if (!cancelled) setGovernanceLoading(false);
      }
    }

    void loadGovernance();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkflows() {
      setWorkflowLoading(true);
      try {
        const response = await fetch("/api/workflows", { cache: "no-store" });
        const result = (await response.json()) as {
          workflows?: WorkflowCase[];
          overdue?: number;
          error?: string;
        };
        if (!response.ok || !result.workflows) {
          throw new Error(result.error ?? "Workflow service unavailable.");
        }
        if (!cancelled) {
          setWorkflows(result.workflows);
          setWorkflowOverdue(result.overdue ?? 0);
          setWorkflowError("");
        }
      } catch (error) {
        if (!cancelled) {
          setWorkflowError(
            error instanceof Error
              ? error.message
              : "Workflow service unavailable.",
          );
        }
      } finally {
        if (!cancelled) setWorkflowLoading(false);
      }
    }

    void loadWorkflows();
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
    if (!progressLoaded || syncStatus === "saving") return;
    let cancelled = false;

    async function loadTutorReadiness() {
      try {
        const response = await fetch("/api/tutor/readiness", {
          cache: "no-store",
        });
        const result = (await response.json()) as
          | TutorReadinessReview
          | { error?: string };
        if (!response.ok || ("error" in result && result.error)) {
          throw new Error(
            "error" in result && result.error
              ? result.error
              : "Tutor readiness is unavailable.",
          );
        }
        if (!cancelled) {
          setTutorReadiness(result as TutorReadinessReview);
          setTutorReadinessError("");
        }
      } catch (error) {
        if (!cancelled) {
          setTutorReadinessError(
            error instanceof Error
              ? error.message
              : "Tutor readiness is unavailable.",
          );
        }
      }
    }

    void loadTutorReadiness();
    return () => {
      cancelled = true;
    };
  }, [progressLoaded, syncStatus, user.id]);

  useEffect(() => {
    if (!progressLoaded || syncStatus === "saving") return;
    let cancelled = false;

    async function loadTutorCapstone() {
      try {
        const response = await fetch("/api/tutor/capstone", {
          cache: "no-store",
        });
        const result = (await response.json()) as
          | TutorCapstoneReview
          | { error?: string };
        if (!response.ok || ("error" in result && result.error)) {
          throw new Error(
            "error" in result && result.error
              ? result.error
              : "Tutor capstone assessment is unavailable.",
          );
        }
        if (!cancelled) {
          setTutorCapstone(result as TutorCapstoneReview);
          setTutorCapstoneError("");
        }
      } catch (error) {
        if (!cancelled) {
          setTutorCapstoneError(
            error instanceof Error
              ? error.message
              : "Tutor capstone assessment is unavailable.",
          );
        }
      }
    }

    void loadTutorCapstone();
    return () => {
      cancelled = true;
    };
  }, [progressLoaded, syncStatus, user.id]);

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

  useEffect(() => {
    if (view !== "admin" || user.role !== "admin") return;
    let cancelled = false;

    async function loadAdminOperations() {
      setAdminLoading(true);
      setAdminError("");
      try {
        const response = await fetch("/api/admin/operations", {
          cache: "no-store",
        });
        const result = (await response.json()) as
          | AdminOperations
          | { error?: string };
        if (!response.ok || ("error" in result && result.error)) {
          throw new Error(
            "error" in result && result.error
              ? result.error
              : "Admin operations are unavailable.",
          );
        }
        if (!cancelled) {
          setAdminOperations(result as AdminOperations);
        }
      } catch (error) {
        if (!cancelled) {
          setAdminError(
            error instanceof Error
              ? error.message
              : "Admin operations are unavailable.",
          );
        }
      } finally {
        if (!cancelled) setAdminLoading(false);
      }
    }

    void loadAdminOperations();
    return () => {
      cancelled = true;
    };
  }, [user.role, view]);

  async function askMentor(prompt: string) {
    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 3 || mentorLoading) return;
    setMentorLoading(true);
    setMentorError("");
    setQuestion("");
    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanPrompt,
          scenarioId: activeScenarioId,
          step: activeProgress.step,
        }),
      });
      const result = (await response.json()) as {
        answer?: string;
        sources?: MentorSource[];
        error?: string;
      };
      if (!response.ok || !result.answer) {
        throw new Error(result.error ?? "Mentor response unavailable.");
      }
      setAnswer(result.answer);
      setMentorSources(result.sources ?? []);
    } catch (error) {
      setMentorError(
        error instanceof Error
          ? error.message
          : "Mentor response unavailable.",
      );
    } finally {
      setMentorLoading(false);
    }
  }

  async function submitCapstoneEvidence() {
    if (
      !activeCapstoneChallenge ||
      activeCapstoneChallenge.status === "Locked" ||
      capstoneResponse.trim().length < 80
    ) {
      return;
    }

    setCapstoneSubmitting(true);
    setTutorCapstoneError("");
    try {
      const response = await fetch("/api/tutor/capstone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: activeScenarioId,
          response: capstoneResponse,
        }),
      });
      const result = (await response.json()) as {
        portfolio?: TutorCapstoneReview;
        error?: string;
      };
      if (!response.ok || !result.portfolio) {
        throw new Error(result.error ?? "Capstone submission failed.");
      }
      setTutorCapstone(result.portfolio);
      setCapstoneResponse("");
    } catch (error) {
      setTutorCapstoneError(
        error instanceof Error ? error.message : "Capstone submission failed.",
      );
    } finally {
      setCapstoneSubmitting(false);
    }
  }

  async function submitWorkflowDecision(action: WorkflowAction) {
    if (!selectedWorkflow || workflowComment.trim().length < 5) return;
    setWorkflowLoading(true);
    setWorkflowError("");
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflow.id,
          action,
          comment: workflowComment,
        }),
      });
      const result = (await response.json()) as {
        workflow?: WorkflowCase;
        wasOverdue?: boolean;
        error?: string;
      };
      if (!response.ok || !result.workflow) {
        throw new Error(result.error ?? "Workflow decision could not be saved.");
      }
      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.id === result.workflow!.id ? result.workflow! : workflow,
        ),
      );
      if (
        selectedWorkflow.status === "Pending" &&
        result.workflow.status !== "Pending" &&
        result.wasOverdue
      ) {
        setWorkflowOverdue((current) => Math.max(0, current - 1));
      }
      setWorkflowComment("");
    } catch (error) {
      setWorkflowError(
        error instanceof Error
          ? error.message
          : "Workflow decision could not be saved.",
      );
    } finally {
      setWorkflowLoading(false);
    }
  }

  async function submitGovernanceDecision(action: GovernanceAction) {
    if (!selectedGovernance || governanceComment.trim().length < 5) return;
    setGovernanceLoading(true);
    setGovernanceError("");
    try {
      const response = await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedGovernance.id,
          action,
          comment: governanceComment,
        }),
      });
      const result = (await response.json()) as {
        request?: GovernanceCase;
        error?: string;
      };
      if (!response.ok || !result.request) {
        throw new Error(
          result.error ?? "Governance decision could not be saved.",
        );
      }
      setGovernanceCases((current) =>
        current.map((request) =>
          request.id === result.request!.id ? result.request! : request,
        ),
      );
      setGovernanceComment("");
    } catch (error) {
      setGovernanceError(
        error instanceof Error
          ? error.message
          : "Governance decision could not be saved.",
      );
    } finally {
      setGovernanceLoading(false);
    }
  }

  async function completeAdvancedStep() {
    if (
      !selectedAdvancedTransaction ||
      selectedAdvancedTransaction.currentStep === null ||
      advancedNote.trim().length < 5
    ) {
      return;
    }

    setAdvancedLoading(true);
    setAdvancedError("");
    try {
      const response = await fetch("/api/advanced-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: selectedAdvancedTransaction.id,
          step: selectedAdvancedTransaction.currentStep,
          note: advancedNote,
        }),
      });
      const result = (await response.json()) as {
        transaction?: AdvancedTransactionCase;
        error?: string;
      };
      if (!response.ok || !result.transaction) {
        throw new Error(
          result.error ?? "Transaction evidence could not be saved.",
        );
      }
      setAdvancedTransactions((current) =>
        current.map((transaction) =>
          transaction.id === result.transaction!.id
            ? result.transaction!
            : transaction,
        ),
      );
      setAdvancedNote("");
    } catch (error) {
      setAdvancedError(
        error instanceof Error
          ? error.message
          : "Transaction evidence could not be saved.",
      );
    } finally {
      setAdvancedLoading(false);
    }
  }

  async function generateStudioSimulation() {
    if (studioLoading) return;
    setStudioLoading(true);
    setStudioError("");
    try {
      const response = await fetch("/api/simulation-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industryId: studioIndustryId,
          fiscalYear: studioFiscalYear,
          eventIndex: studioEventIndex,
        }),
      });
      const result = (await response.json()) as {
        simulation?: GeneratedSimulation;
        error?: string;
      };
      if (!response.ok || !result.simulation) {
        throw new Error(result.error ?? "Simulation could not be generated.");
      }
      setGeneratedSimulations((current) => [
        result.simulation!,
        ...current.filter(
          (simulation) => simulation.signature !== result.simulation!.signature,
        ),
      ]);
      setSelectedSimulationId(result.simulation.id);
    } catch (error) {
      setStudioError(
        error instanceof Error
          ? error.message
          : "Simulation could not be generated.",
      );
    } finally {
      setStudioLoading(false);
    }
  }

  async function executeStudioStep() {
    const execution = selectedGeneratedSimulation?.execution;
    if (
      !selectedGeneratedSimulation ||
      !execution ||
      execution.currentStep === null ||
      studioExecutionNote.trim().length < 5 ||
      studioLoading
    ) {
      return;
    }

    setStudioLoading(true);
    setStudioError("");
    try {
      const response = await fetch(
        `/api/simulation-studio/${selectedGeneratedSimulation.id}/execution`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedVersion: execution.version,
            step: execution.currentStep,
            note: studioExecutionNote,
          }),
        },
      );
      const result = (await response.json()) as {
        execution?: NonNullable<GeneratedSimulation["execution"]>;
        error?: string;
      };
      if (!response.ok || !result.execution) {
        throw new Error(result.error ?? "Simulation step could not be executed.");
      }
      setGeneratedSimulations((current) =>
        current.map((simulation) =>
          simulation.id === selectedGeneratedSimulation.id
            ? { ...simulation, execution: result.execution }
            : simulation,
        ),
      );
      setStudioExecutionNote("");
    } catch (error) {
      setStudioError(
        error instanceof Error
          ? error.message
          : "Simulation step could not be executed.",
      );
    } finally {
      setStudioLoading(false);
    }
  }

  const activeScenario =
    processScenarios.find((scenario) => scenario.id === activeScenarioId) ??
    processScenarios[0];
  const activePlaybook =
    transactionPlaybooks.find(
      (playbook) => playbook.scenarioId === activeScenario.id,
    ) ?? transactionPlaybooks[0];
  const activeDocumentFlow = documentFlowFor(activeScenarioId);
  const selectedDocument =
    activeDocumentFlow.nodes.find(
      (node) => node.id === selectedDocumentIds[activeScenarioId],
    ) ??
    activeDocumentFlow.nodes.find((node) => node.status === "active") ??
    activeDocumentFlow.nodes[0];
  const activeProgress = scenarioProgress[activeScenarioId];
  const activeQuizAnswer = quizAnswers[activeScenarioId];
  const troubleshootingCase = troubleshootingCaseFor(activeScenarioId);
  const diagnosisAnswer = diagnosisAnswers[activeScenarioId];
  const diagnosisCorrect =
    diagnosticProgress[activeScenarioId].complete ||
    diagnosisAnswer === troubleshootingCase.correctDiagnosis;
  const activeEnterprise = industryById(defaultIndustryId);
  const preferredIndustry = industryById(preferredIndustryId);
  const selectedIndustryEnterprise = industryById(
    selectedIndustryBlueprintId,
  );
  const selectedIndustryBlueprint = industryBlueprintById(
    selectedIndustryBlueprintId,
  );
  const studioIndustry = industryById(studioIndustryId);
  const studioBlueprint = industryBlueprintById(studioIndustryId);
  const selectedGeneratedSimulation =
    generatedSimulations.find(
      (simulation) => simulation.id === selectedSimulationId,
    ) ?? generatedSimulations[0];
  const selectedLedgerDocument =
    studioLedgerDocuments.find(
      (document) => document.id === selectedLedgerDocumentId,
    ) ?? studioLedgerDocuments[0];
  const implementationBlueprint =
    implementationBlueprintFor(activeScenarioId);
  const scenarioMasterData = masterDataForScenario(activeScenarioId);
  const selectedMaterial =
    materialById(selectedMaterialId) ?? materials[0];
  const selectedBom = billsOfMaterial.find(
    (bom) => bom.headerMaterialId === selectedMaterial.id,
  );
  const selectedRouting = routings.find(
    (routing) => routing.materialId === selectedMaterial.id,
  );
  const selectedBatches = batches.filter(
    (batch) => batch.materialId === selectedMaterial.id,
  );
  const selectedSpecifications = qualitySpecifications.filter(
    (specification) => specification.materialId === selectedMaterial.id,
  );
  const selectedSources = sourceRecords.filter(
    (source) => source.materialId === selectedMaterial.id,
  );
  const visibleGovernanceCases = governanceCases.filter(
    (request) =>
      governanceDomain === "All" || request.domain === governanceDomain,
  );
  const selectedGovernance =
    governanceCases.find((request) => request.id === selectedGovernanceId) ??
    visibleGovernanceCases[0] ??
    governanceCases[0];
  const visibleWorkflows = workflows.filter(
    (workflow) =>
      workflowFilter === "All" || workflow.status === workflowFilter,
  );
  const selectedWorkflow =
    workflows.find((workflow) => workflow.id === selectedWorkflowId) ??
    visibleWorkflows[0] ??
    workflows[0];
  const activeScenarioWorkflow = workflows.find(
    (workflow) =>
      workflow.scenarioId === activeScenarioId &&
      workflow.status === "Pending",
  ) ?? workflows.find((workflow) => workflow.scenarioId === activeScenarioId);
  const visibleAdvancedTransactions = advancedTransactions.filter(
    (transaction) =>
      advancedTypeFilter === "All" ||
      transaction.type === advancedTypeFilter,
  );
  const selectedAdvancedTransaction =
    advancedTransactions.find(
      (transaction) => transaction.id === selectedAdvancedId,
    ) ??
    visibleAdvancedTransactions[0] ??
    advancedTransactions[0];
  const currentAdvancedStep = selectedAdvancedTransaction?.steps.find(
    (step) => step.sequence === selectedAdvancedTransaction.currentStep,
  );
  const analyticsYearPeriods = periodsForYear(analyticsYear);
  const analyticsYearDrivers = driversForYear(analyticsYear);
  const selectedPerformanceDriver =
    analyticsYearDrivers.find((driver) => driver.id === selectedDriverId) ??
    analyticsYearDrivers[0];
  const metricMaximum = Math.max(
    ...analyticsYearPeriods.map((period) => metricValue(period, analyticsMetric)),
    1,
  );
  const visibleProfitability = profitabilitySegments.filter(
    (segment) =>
      segment.fiscalYear === analyticsYear &&
      segment.dimension === profitabilityDimension,
  );
  const currentTutorStep = activeScenario.tutorSteps[activeProgress.step];
  const currentPlaybookStage =
    activePlaybook.stages.find(
      (stage) => stage.sequence === currentTutorStep.number,
    ) ?? activePlaybook.stages[0];
  const lessonProgress = activeProgress.complete
    ? 100
    : Math.round(((activeProgress.step + 1) / activeScenario.tutorSteps.length) * 100);
  const activeReadinessProcess =
    tutorReadiness?.processes.find(
      (process) => process.scenarioId === activeScenarioId,
    ) ?? null;
  const priorityReadinessProcesses =
    tutorReadiness?.processes
      .filter((process) => process.score < 90)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3) ?? [];
  const activeCapstoneChallenge =
    tutorCapstone?.challenges.find(
      (challenge) => challenge.scenarioId === activeScenarioId,
    ) ?? null;
  const tutorHeading =
    tutorMode === "guided"
      ? "Guided transaction"
      : tutorMode === "troubleshoot"
        ? "Troubleshooting lab"
        : tutorMode === "implementation"
          ? "Implementation blueprint"
          : "Capstone assessment";
  const tutorTitle =
    tutorMode === "guided"
      ? activeScenario.tutorTitle
      : tutorMode === "troubleshoot"
        ? troubleshootingCase.title
        : tutorMode === "implementation"
          ? implementationBlueprint.title
          : activeCapstoneChallenge?.title ?? "SAP capstone assessment";
  const tutorDescription =
    tutorMode === "guided"
      ? activeScenario.tutorDescription
      : tutorMode === "troubleshoot"
        ? troubleshootingCase.businessContext
        : tutorMode === "implementation"
          ? implementationBlueprint.objective
          : activeCapstoneChallenge?.prompt ??
            (tutorCapstoneError ||
              "Preparing your capstone challenge from saved learner evidence.");
  const tutorBadge =
    tutorMode === "guided"
      ? `Step ${activeProgress.step + 1} of ${activeScenario.tutorSteps.length}`
      : tutorMode === "troubleshoot"
        ? troubleshootingCase.id
        : tutorMode === "implementation"
          ? implementationBlueprint.consultantRole
          : activeCapstoneChallenge?.status ?? "Loading";

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
        ...materials.map((material) => ({
          id: material.id,
          title: material.description,
          subtitle: `${material.type} Â· ${material.plant} Â· ${material.standardPrice}`,
          target: "masterdata" as View,
        })),
        ...governanceCases.map((request) => ({
          id: request.objectId,
          title: request.title,
          subtitle: `${request.domain} governance / ${request.status}`,
          target: "governance" as View,
          governanceId: request.id,
        })),
        ...workflows.map((workflow) => ({
          id: workflow.documentNumber,
          title: workflow.title,
          subtitle: `${workflow.status} / ${workflow.module}`,
          target: "workflows" as View,
          workflowId: workflow.id,
        })),
        ...advancedTransactions.map((transaction) => ({
          id: transaction.id,
          title: transaction.title,
          subtitle: `${transaction.type} / ${transaction.status}`,
          target: "advanced" as View,
          advancedId: transaction.id,
        })),
        ...industryEnterprises.map((industry) => ({
          id: industry.id,
          title: industry.industry,
          subtitle: `${industry.enterprise} / ${industry.operatingModel}`,
          target: "industries" as View,
          industryId: industry.id,
        })),
        ...generatedSimulations.map((simulation) => ({
          id: simulation.id,
          title: simulation.title,
          subtitle: `${simulation.industry} / ${simulation.fiscalYear} / ${simulation.exposure}`,
          target: "studio" as View,
          simulationId: simulation.id,
        })),
        ...performanceDrivers.map((driver) => ({
          id: driver.id,
          title: driver.title,
          subtitle: `${driver.fiscalYear} / ${driver.category}`,
          target: "analytics" as View,
          driverId: driver.id,
          fiscalYear: driver.fiscalYear,
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
  const isAdmin = user.role === "admin";

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
          <button className={view === "masterdata" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("masterdata")}><ListTree size={18} />Master data</button>
          <button className={view === "governance" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("governance")}><ShieldCheck size={18} />Data governance</button>
          <button className={view === "plants" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("plants")}><Factory size={18} />Plants & operations</button>
          <button className={view === "partners" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("partners")}><Users size={18} />Business partners</button>
          {isAdmin && (
            <>
              <p className="nav-label nav-spacer">Administration</p>
              <button className={view === "admin" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("admin")}><Settings size={18} />Control plane</button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item"><Settings size={18} />Settings</button>
          <button className="nav-item" onClick={onSignOut}><LogOut size={18} />Sign out</button>
          <div className="user-card">
            <div className="avatar">{learnerInitials(user.name)}</div>
            <div><strong>{user.name}</strong><span>{roleLabels[user.role]}</span></div>
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

          {view === "admin" && isAdmin && (
            <section className="admin-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Role-based platform control</p><h1>Admin control plane</h1><p>Monitor storage, learner activity, simulation generation, and content coverage without exposing credentials or session tokens.</p></div>
                <span className="api-badge">API /api/admin/operations</span>
              </div>

              {adminError && <div className="workflow-error" role="alert">{adminError}</div>}
              {adminLoading && <article className="panel workflow-empty">Loading admin operations...</article>}

              {adminOperations && !adminLoading && (
                <>
                  <section className="admin-grid">
                    <article className="panel"><span>Storage backend</span><strong>{adminOperations.storage.backend}</strong><small>{adminOperations.storage.durable ? "Durable database mode" : "Local development fallback"}</small></article>
                    <article className="panel"><span>Mentor provider</span><strong>{adminOperations.mentor.mode}</strong><small>{adminOperations.mentor.configured ? `${adminOperations.mentor.model} / ${adminOperations.mentor.timeoutMs}ms` : "Deterministic local fallback"}</small></article>
                    <article className="panel"><span>Readiness gate</span><strong>{adminOperations.readiness.status}</strong><small>{adminOperations.readiness.deploymentGate}</small></article>
                    <article className="panel"><span>Total users</span><strong>{adminOperations.accounts.users}</strong><small>{adminOperations.accounts.roles.admin} admins / {adminOperations.accounts.roles.learner} learners</small></article>
                    <article className="panel"><span>Active sessions</span><strong>{adminOperations.accounts.sessions.active}</strong><small>{adminOperations.accounts.sessions.expired} expired retained</small></article>
                    <article className="panel"><span>Generated simulations</span><strong>{adminOperations.simulations.simulations}</strong><small>{adminOperations.simulations.industries} industries represented</small></article>
                  </section>

                  <article className="panel admin-ledger">
                    <div className="panel-header"><div><span className="section-kicker">Production operations readiness</span><h2>Deployment gate summary</h2></div><strong>/api/admin/readiness</strong></div>
                    <div className="admin-metrics">
                      <div><span>Total checks</span><strong>{adminOperations.readiness.summary.checks}</strong></div>
                      <div><span>Passed</span><strong>{adminOperations.readiness.summary.passed}</strong></div>
                      <div><span>Warnings</span><strong>{adminOperations.readiness.summary.warnings}</strong></div>
                      <div><span>Failed</span><strong>{adminOperations.readiness.summary.failed}</strong></div>
                      <div><span>Status</span><strong>{adminOperations.readiness.status}</strong></div>
                      <div><span>Gate</span><strong>{adminOperations.readiness.summary.failed === 0 ? "Review" : "Fix"}</strong></div>
                    </div>
                  </article>

                  <article className="panel admin-ledger">
                    <div className="panel-header"><div><span className="section-kicker">Operational observability</span><h2>Server-side event stream</h2></div><strong>/api/admin/observability</strong></div>
                    <div className="admin-metrics">
                      <div><span>Total events</span><strong>{adminOperations.observability.totals.events.toLocaleString("en-GB")}</strong></div>
                      <div><span>Recent 24h</span><strong>{adminOperations.observability.totals.recent24h.toLocaleString("en-GB")}</strong></div>
                      <div><span>Successes</span><strong>{adminOperations.observability.totals.successes.toLocaleString("en-GB")}</strong></div>
                      <div><span>Warnings</span><strong>{adminOperations.observability.totals.warnings.toLocaleString("en-GB")}</strong></div>
                      <div><span>Failures</span><strong>{adminOperations.observability.totals.failures.toLocaleString("en-GB")}</strong></div>
                      <div><span>Retention</span><strong>{adminOperations.observability.retention.storedEvents}/{adminOperations.observability.retention.maxEvents}</strong></div>
                    </div>
                  </article>

                  <article className="panel admin-ledger">
                    <div className="panel-header"><div><span className="section-kicker">Normalized ledger projection</span><h2>Enterprise document analytics</h2></div><strong>{adminOperations.ledgerAnalytics.integrity.status}</strong></div>
                    <div className="admin-metrics">
                      <div><span>Ledger documents</span><strong>{adminOperations.ledgerAnalytics.totals.documents.toLocaleString("en-GB")}</strong></div>
                      <div><span>Process chains</span><strong>{adminOperations.ledgerAnalytics.totals.processChains.toLocaleString("en-GB")}</strong></div>
                      <div><span>Journal documents</span><strong>{adminOperations.ledgerAnalytics.totals.journalDocuments.toLocaleString("en-GB")}</strong></div>
                      <div><span>Exceptions</span><strong>{adminOperations.ledgerAnalytics.totals.exceptions.toLocaleString("en-GB")}</strong></div>
                      <div><span>Broken links</span><strong>{adminOperations.ledgerAnalytics.integrity.brokenLinks}</strong></div>
                      <div><span>Unique documents</span><strong>{adminOperations.ledgerAnalytics.integrity.uniqueDocumentNumbers.toLocaleString("en-GB")}</strong></div>
                    </div>
                  </article>

                  <article className="panel admin-ledger">
                    <div className="panel-header"><div><span className="section-kicker">Controlled content administration</span><h2>Release readiness register</h2></div><strong>{adminOperations.contentControl.averageReadiness}% ready</strong></div>
                    <div className="admin-metrics">
                      <div><span>Content domains</span><strong>{adminOperations.contentControl.domains}</strong></div>
                      <div><span>Released</span><strong>{adminOperations.contentControl.released}</strong></div>
                      <div><span>Review required</span><strong>{adminOperations.contentControl.reviewRequired}</strong></div>
                      <div><span>Blocked</span><strong>{adminOperations.contentControl.blocked}</strong></div>
                      <div><span>Controlled records</span><strong>{adminOperations.contentControl.records.toLocaleString("en-GB")}</strong></div>
                      <div><span>Register API</span><strong>/api/admin/content-control</strong></div>
                    </div>
                  </article>

                  <div className="admin-layout">
                    <article className="panel">
                      <div className="panel-header"><div><span className="section-kicker">Authorization model</span><h2>Role permissions</h2></div></div>
                      <div className="admin-permissions">
                        {Object.entries(rolePermissions).map(([role, permissions]) => (
                          <div key={role}>
                            <strong>{roleLabels[role as LearnerProfile["role"]]}</strong>
                            {permissions.map((permission) => <span key={permission}>{permission}</span>)}
                          </div>
                        ))}
                      </div>
                    </article>

                    <article className="panel">
                      <div className="panel-header"><div><span className="section-kicker">Recent accounts</span><h2>Safe learner directory</h2></div></div>
                      <div className="admin-users">
                        {adminOperations.accounts.recentUsers.map((account) => (
                          <div key={account.id}>
                            <div><strong>{account.name}</strong><small>{account.email}</small></div>
                            <span>{roleLabels[account.role]}</span>
                            <code>{new Date(account.createdAt).toLocaleDateString("en-GB")}</code>
                          </div>
                        ))}
                      </div>
                    </article>
                  </div>

                  <div className="admin-layout">
                    <article className="panel">
                      <div className="panel-header"><div><span className="section-kicker">Learning activity</span><h2>Progress evidence</h2></div></div>
                      <div className="admin-metrics">
                        <div><span>Learners with progress</span><strong>{adminOperations.progress.learners}</strong></div>
                        <div><span>Completed lessons</span><strong>{adminOperations.progress.completedLessons}</strong></div>
                        <div><span>Completed diagnostics</span><strong>{adminOperations.progress.completedDiagnostics}</strong></div>
                      </div>
                    </article>

                    <article className="panel">
                      <div className="panel-header"><div><span className="section-kicker">Control evidence</span><h2>Server-side safeguards</h2></div></div>
                      <div className="studio-control-list">
                        {adminOperations.controls.map((control) => <p key={control}><ShieldCheck size={15} />{control}</p>)}
                      </div>
                    </article>
                  </div>

                  <article className="panel admin-ledger">
                    <div className="panel-header"><div><span className="section-kicker">Tutor capstone evidence</span><h2>Assessment portfolio review</h2></div><strong>{adminOperations.capstones.submissions} submissions</strong></div>
                    <div className="admin-metrics">
                      <div><span>Learners</span><strong>{adminOperations.capstones.learners}</strong></div>
                      <div><span>Review ready</span><strong>{adminOperations.capstones.reviewReady}</strong></div>
                      <div><span>Strong evidence</span><strong>{adminOperations.capstones.strongEvidence}</strong></div>
                      <div><span>Needs practice</span><strong>{adminOperations.capstones.needsPractice}</strong></div>
                      <div><span>Latest</span><strong>{adminOperations.capstones.latestSubmittedAt ? new Date(adminOperations.capstones.latestSubmittedAt).toLocaleDateString("en-GB") : "None"}</strong></div>
                      <div><span>Store</span><strong>tutor-capstone-submissions</strong></div>
                    </div>
                    <div className="admin-capstone-list">
                      {adminOperations.capstones.processBreakdown.map((process) => (
                        <div key={process.scenarioId}>
                          <span>{process.processCode}</span>
                          <strong>{process.title}</strong>
                          <small>{process.submissions} submissions / {process.reviewReady} ready / {process.averageScore}% avg</small>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel">
                    <div className="panel-header"><div><span className="section-kicker">Content coverage</span><h2>Simulation catalogue inventory</h2></div><strong>{new Date(adminOperations.generatedAt).toLocaleString("en-GB")}</strong></div>
                    <div className="admin-content-grid">
                      {Object.entries(adminOperations.content).map(([key, value]) => (
                        <div key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><strong>{value}</strong></div>
                      ))}
                    </div>
                  </article>
                </>
              )}
            </section>
          )}

          {view === "academy" && (
            <section className="academy-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">Role-based SAP learning</p><h1>Learning centre</h1><p>Build practical skills through connected work performed inside the simulated enterprise.</p></div>
                <div className="academy-score"><Award size={20} /><div><span>Learning score</span><strong>{120 + Object.values(scenarioProgress).filter((progress) => progress.complete).length * 60 + Object.values(diagnosticProgress).filter((progress) => progress.complete).length * 40} XP</strong></div></div>
              </div>

              <div className="academy-summary">
                <article className="panel"><span>Current role</span><strong>Warehouse Operative</strong><small>Burton Brewery · Plant BR01</small></article>
                <article className="panel"><span>Lessons completed</span><strong>{Object.values(scenarioProgress).filter((progress) => progress.complete).length} of {processScenarios.length}</strong><small>Available learning pathways</small></article>
                <article className="panel"><span>Exceptions diagnosed</span><strong>{Object.values(diagnosticProgress).filter((progress) => progress.complete).length} of {processScenarios.length}</strong><small>{Object.values(diagnosticProgress).reduce((sum, progress) => sum + progress.attempts, 0)} diagnostic attempts</small></article>
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
                    path.id === "hcm-hire" ? "h2r" :
                    path.id === "ewm-warehouse-dispatch" ? "w2d" : null;
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

          {view === "industries" && (
            <section className="industry-blueprint-page">
              <div className="page-heading compact">
                <div>
                  <p className="eyebrow">Reusable enterprise templates</p>
                  <h1>Industry implementation blueprints</h1>
                  <p>
                    Compare how value chains, SAP design, controls, KPIs, and
                    operational behavior change across ten industries.
                  </p>
                </div>
                <span className="api-badge">API /api/industries?id={selectedIndustryBlueprintId}</span>
              </div>

              <div className="industry-blueprint-tabs">
                {industryEnterprises.map((industry) => (
                  <button
                    className={selectedIndustryBlueprintId === industry.id ? "active" : ""}
                    onClick={() => setSelectedIndustryBlueprintId(industry.id)}
                    key={industry.id}
                  >
                    <span>{industry.status === "live" ? "Live simulation" : industry.release}</span>
                    <strong>{industry.industry}</strong>
                    <small>{industry.modules.length} SAP capabilities</small>
                  </button>
                ))}
              </div>

              <article className="industry-blueprint-hero panel">
                <div>
                  <span className="section-kicker">{selectedIndustryEnterprise.operatingModel}</span>
                  <h2>{selectedIndustryEnterprise.enterprise}</h2>
                  <p>{selectedIndustryEnterprise.description}</p>
                </div>
                <div className="industry-promise">
                  <Sparkles size={19} />
                  <p><strong>Customer promise</strong>{selectedIndustryBlueprint.customerPromise}</p>
                </div>
                <div className="industry-module-strip">
                  {selectedIndustryEnterprise.modules.map((module) => <span key={module}>{module}</span>)}
                </div>
              </article>

              <div className="industry-blueprint-grid">
                <article className="industry-value-chain panel">
                  <div className="panel-header"><div><span className="section-kicker">Connected operating model</span><h2>Industry value chain</h2></div></div>
                  <p className="industry-supply-chain">{selectedIndustryBlueprint.supplyChain}</p>
                  <div>
                    {selectedIndustryBlueprint.valueChain.map((stage, index) => (
                      <div className="industry-stage" key={stage.stage}>
                        <span>{index + 1}</span>
                        <div><strong>{stage.stage}</strong><p>{stage.activities}</p><small>{stage.sap.join(" / ")}</small></div>
                        {index < selectedIndustryBlueprint.valueChain.length - 1 && <ArrowRight size={16} />}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="industry-kpi-panel panel">
                  <div className="panel-header"><div><span className="section-kicker">Operational control</span><h2>Leading KPIs</h2></div></div>
                  <div>
                    {selectedIndustryBlueprint.kpis.map((kpi) => (
                      <div key={kpi.name}><span>{kpi.name}</span><strong>{kpi.target}</strong><p>{kpi.purpose}</p></div>
                    ))}
                  </div>
                </article>
              </div>

              <div className="industry-lifecycle-grid">
                {[
                  ["Procurement lifecycle", selectedIndustryBlueprint.procurementLifecycle, "MM / Ariba / FI"],
                  ["Operations lifecycle", selectedIndustryBlueprint.productionLifecycle, "Planning / Execution / CO"],
                  ["Inventory lifecycle", selectedIndustryBlueprint.inventoryLifecycle, "MM / EWM / QM"],
                  ["Financial structure", selectedIndustryBlueprint.financialStructure, "FI / CO / Analytics"],
                ].map(([title, items, modules]) => (
                  <article className="industry-lifecycle panel" key={title as string}>
                    <span className="section-kicker">{modules as string}</span>
                    <h3>{title as string}</h3>
                    {(items as string[]).map((item, index) => <p key={item}><span>{index + 1}</span>{item}</p>)}
                  </article>
                ))}
              </div>

              <div className="industry-foundation-grid">
                <article className="panel">
                  <div className="panel-header"><div><span className="section-kicker">Implementation foundation</span><h2>Organization and master data</h2></div></div>
                  <div className="industry-foundation-columns">
                    <div><strong>Organizational template</strong>{selectedIndustryBlueprint.organizationalTemplate.map((item) => <p key={item}><Building2 size={14} />{item}</p>)}</div>
                    <div><strong>Critical master data</strong>{selectedIndustryBlueprint.masterData.map((item) => <p key={item}><ListTree size={14} />{item}</p>)}</div>
                  </div>
                </article>
                <article className="panel">
                  <div className="panel-header"><div><span className="section-kicker">Governance and evidence</span><h2>Compliance and reporting</h2></div></div>
                  <div className="industry-foundation-columns">
                    <div><strong>Compliance requirements</strong>{selectedIndustryBlueprint.compliance.map((item) => <p key={item}><ShieldCheck size={14} />{item}</p>)}</div>
                    <div><strong>Management reporting</strong>{selectedIndustryBlueprint.reporting.map((item) => <p key={item}><BarChart3 size={14} />{item}</p>)}</div>
                  </div>
                </article>
              </div>

              <article className="industry-dependencies panel">
                <div className="panel-header"><div><span className="section-kicker">Cross-functional integration</span><h2>What depends on what?</h2></div></div>
                <div>
                  {selectedIndustryBlueprint.dependencies.map((dependency) => (
                    <div key={`${dependency.from}-${dependency.to}`}><strong>{dependency.from}</strong><ArrowRight size={16} /><strong>{dependency.to}</strong><p>{dependency.logic}</p></div>
                  ))}
                </div>
              </article>

              <div className="industry-behavior-grid">
                <article className="panel">
                  <div className="panel-header"><div><span className="section-kicker">Exception patterns</span><h2>Common business problems</h2></div></div>
                  <div className="industry-problems">
                    {selectedIndustryBlueprint.commonProblems.map((problem) => (
                      <div key={problem.issue}><TriangleAlert size={17} /><div><strong>{problem.issue}</strong><p><span>Signal:</span> {problem.signal}</p><p><span>SAP response:</span> {problem.sapResponse}</p></div></div>
                    ))}
                  </div>
                </article>
                <article className="panel">
                  <div className="panel-header"><div><span className="section-kicker">Demand behavior</span><h2>Seasonality and planning</h2></div></div>
                  <div className="industry-seasonality">
                    {selectedIndustryBlueprint.seasonality.map((season) => (
                      <div key={season.period}><CalendarDays size={17} /><div><strong>{season.period}</strong><p>{season.behavior}</p><small>{season.planningResponse}</small></div></div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          )}

          {view === "studio" && (
            <section className="simulation-studio-page">
              <div className="page-heading compact">
                <div>
                  <p className="eyebrow">Deterministic enterprise generation</p>
                  <h1>Simulation Studio</h1>
                  <p>
                    Instantiate a curated industry event as a connected SAP
                    scenario with stable documents, impacts, controls, and history.
                  </p>
                </div>
                <span className="api-badge">API /api/simulation-studio</span>
              </div>

              <article className="studio-generator panel">
                <div className="studio-generator-heading">
                  <div><Sparkles size={21} /><div><span className="section-kicker">Template version sap-world-v1</span><h2>Generate a scenario package</h2></div></div>
                  <span><ShieldCheck size={14} /> No random business data</span>
                </div>
                <div className="studio-controls">
                  <label>
                    <span>Industry template</span>
                    <select value={studioIndustryId} onChange={(event) => {
                      setStudioIndustryId(event.target.value as IndustryId);
                      setStudioEventIndex(0);
                    }}>
                      {industryEnterprises.map((industry) => <option value={industry.id} key={industry.id}>{industry.industry}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Fiscal year</span>
                    <select value={studioFiscalYear} onChange={(event) => setStudioFiscalYear(event.target.value as SimulationFiscalYear)}>
                      {simulationFiscalYears.map((year) => <option value={year} key={year}>{year}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Curated business event</span>
                    <select value={studioEventIndex} onChange={(event) => setStudioEventIndex(Number(event.target.value))}>
                      {studioBlueprint.commonProblems.map((problem, index) => <option value={index} key={problem.issue}>{problem.issue}</option>)}
                    </select>
                  </label>
                  <button className="primary-button" disabled={studioLoading} onClick={() => void generateStudioSimulation()}>
                    <Sparkles size={16} /> {studioLoading ? "Generating..." : "Generate package"}
                  </button>
                </div>
                <div className="studio-template-preview">
                  <div><span>Enterprise</span><strong>{studioIndustry.enterprise}</strong></div>
                  <div><span>Trigger signal</span><strong>{studioBlueprint.commonProblems[studioEventIndex].signal}</strong></div>
                  <div><span>Controlled SAP response</span><strong>{studioBlueprint.commonProblems[studioEventIndex].sapResponse}</strong></div>
                </div>
              </article>

              {studioError && <div className="workflow-error" role="alert">{studioError}</div>}
              <div className="studio-layout">
                <aside className="studio-saved panel">
                  <div className="panel-header"><div><span className="section-kicker">Learner workspace</span><h2>Saved packages</h2></div><strong>{generatedSimulations.length}</strong></div>
                  <div>
                    {generatedSimulations.map((simulation) => (
                      <button
                        className={selectedGeneratedSimulation?.signature === simulation.signature ? "selected" : ""}
                        onClick={() => setSelectedSimulationId(simulation.id)}
                        key={simulation.signature}
                      >
                        <span>{simulation.industry} / {simulation.fiscalYear}</span>
                        <strong>{simulation.title}</strong>
                        <code>{simulation.id}</code>
                        <small>{simulation.exposure}</small>
                      </button>
                    ))}
                    {!studioLoading && !generatedSimulations.length && <div className="workflow-empty">Generate your first scenario package.</div>}
                  </div>
                </aside>

                {selectedGeneratedSimulation ? (
                  <div className="studio-workspace">
                    <article className="studio-brief panel">
                      <header>
                        <div><span className="section-kicker">{selectedGeneratedSimulation.id} / {selectedGeneratedSimulation.fiscalYear}</span><h2>{selectedGeneratedSimulation.title}</h2><p>{selectedGeneratedSimulation.businessContext}</p></div>
                        <div><span>Deterministic exposure</span><strong>{selectedGeneratedSimulation.exposure}</strong><code>{selectedGeneratedSimulation.signature.slice(0, 12)}</code></div>
                      </header>
                      <div className="studio-facts">
                        <div><span>Trigger</span><strong>{selectedGeneratedSimulation.trigger}</strong></div>
                        <div><span>Root-cause dependency</span><strong>{selectedGeneratedSimulation.rootCause}</strong></div>
                        <div><span>Seasonality</span><strong>{selectedGeneratedSimulation.seasonality}</strong></div>
                      </div>
                      <div className="industry-module-strip">{selectedGeneratedSimulation.modules.map((module) => <span key={module}>{module}</span>)}</div>
                    </article>

                    <article className="studio-history panel">
                      <div className="panel-header"><div><span className="section-kicker">Enterprise evolution</span><h2>Three-year chronology</h2></div></div>
                      <div>{selectedGeneratedSimulation.history.map((period) => <div className={period.fiscalYear === selectedGeneratedSimulation.fiscalYear ? "active" : ""} key={period.fiscalYear}><strong>{period.fiscalYear}</strong><p>{period.state}</p></div>)}</div>
                    </article>

                    <article className="studio-ledger panel">
                      <div className="panel-header">
                        <div><span className="section-kicker">Connected transaction history</span><h2>Three-year enterprise ledger</h2></div>
                        <div className="studio-ledger-filters">
                          <label>
                            <span>Fiscal year</span>
                            <select value={studioLedgerYear} onChange={(event) => setStudioLedgerYear(event.target.value as "All" | SimulationFiscalYear)}>
                              <option value="All">All years</option>
                              {simulationFiscalYears.map((year) => <option value={year} key={year}>{year}</option>)}
                            </select>
                          </label>
                          <label>
                            <span>Process</span>
                            <select value={studioLedgerProcess} onChange={(event) => setStudioLedgerProcess(event.target.value as "All" | SimulationLedgerProcess)}>
                              <option value="All">All processes</option>
                              {simulationLedgerProcesses.map((process) => <option value={process} key={process}>{process}</option>)}
                            </select>
                          </label>
                        </div>
                      </div>
                      {studioLedgerSummary && !studioLedgerLoading && (
                        <div className="studio-ledger-summary">
                          <div><span>Documents</span><strong>{studioLedgerSummary.documentCount}</strong><small>{studioLedgerDocuments.length} shown</small></div>
                          <div><span>Process chains</span><strong>{studioLedgerSummary.processChainCount}</strong><small>{studioLedgerSummary.processCoverage.length} end-to-end processes</small></div>
                          <div><span>Transaction value</span><strong>GBP {studioLedgerSummary.transactionValue.toLocaleString("en-GB")}</strong><small>Unique chain value</small></div>
                          <div><span>Controlled exceptions</span><strong>{studioLedgerSummary.exceptionCount}</strong><small>Resolved with SAP evidence</small></div>
                          <div className={studioLedgerSummary.integrity.status === "Passed" ? "passed" : "failed"}><span>Relational integrity</span><strong>{studioLedgerSummary.integrity.status}</strong><small>{studioLedgerSummary.integrity.brokenLinks} broken links / {studioLedgerSummary.integrity.orphanDocuments} orphans</small></div>
                        </div>
                      )}
                      {studioLedgerError && <div className="workflow-error" role="alert">{studioLedgerError}</div>}
                      {studioLedgerLoading ? (
                        <div className="workflow-empty">Replaying deterministic enterprise history...</div>
                      ) : studioLedgerDocuments.length ? (
                        <div className="studio-ledger-layout">
                          <div className="studio-ledger-table">
                            <div className="studio-ledger-row heading"><span>Date</span><span>Process / document</span><span>Module</span><span>Value</span><span>Status</span></div>
                            {studioLedgerDocuments.map((document) => (
                              <button className={`studio-ledger-row ${selectedLedgerDocument?.id === document.id ? "selected" : ""}`} onClick={() => setSelectedLedgerDocumentId(document.id)} key={document.id}>
                                <span>{new Date(document.postingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                <span><strong>{document.type}</strong><small>{document.process} / {document.number}</small></span>
                                <span>{document.module}</span>
                                <span>GBP {document.amount.toLocaleString("en-GB")}</span>
                                <span className={document.exception ? "exception" : ""}>{document.status}</span>
                              </button>
                            ))}
                          </div>
                          {selectedLedgerDocument && (
                            <aside className="studio-ledger-detail">
                              <div><span className="section-kicker">{selectedLedgerDocument.process} / Step {selectedLedgerDocument.sequence}</span><h3>{selectedLedgerDocument.type}</h3><code>{selectedLedgerDocument.number}</code></div>
                              <p>{selectedLedgerDocument.businessPurpose}</p>
                              <dl>
                                <div><dt>Fiscal year</dt><dd>{selectedLedgerDocument.fiscalYear}</dd></div>
                                <div><dt>Quantity</dt><dd>{selectedLedgerDocument.quantity === null ? "Not applicable" : `${selectedLedgerDocument.quantity.toLocaleString("en-GB")} ${selectedLedgerDocument.unit}`}</dd></div>
                                <div><dt>Upstream</dt><dd>{selectedLedgerDocument.upstreamDocument ?? "Chain origin"}</dd></div>
                                <div><dt>Downstream</dt><dd>{selectedLedgerDocument.downstreamDocument ?? "Chain complete"}</dd></div>
                              </dl>
                              <div className="studio-ledger-impact"><span>Inventory impact</span><p>{selectedLedgerDocument.inventoryImpact}</p></div>
                              <div className="studio-ledger-impact"><span>Accounting impact</span><p>{selectedLedgerDocument.accountingImpact}</p></div>
                              {selectedLedgerDocument.exception && (
                                <div className="studio-ledger-exception">
                                  <span><TriangleAlert size={14} /> Controlled exception</span>
                                  <strong>{selectedLedgerDocument.exception.issue}</strong>
                                  <p>{selectedLedgerDocument.exception.signal}</p>
                                  <small>{selectedLedgerDocument.exception.resolution}</small>
                                </div>
                              )}
                              {selectedLedgerDocument.journalEntries.map((entry) => (
                                <div className="studio-ledger-entry" key={`${entry.debit}-${entry.credit}`}>
                                  <div><span>Dr</span><strong>{entry.debit}</strong></div>
                                  <div><span>Cr</span><strong>{entry.credit}</strong></div>
                                  <code>GBP {entry.amount.toLocaleString("en-GB")}</code>
                                </div>
                              ))}
                            </aside>
                          )}
                        </div>
                      ) : (
                        <div className="workflow-empty">No ledger documents match these filters.</div>
                      )}
                    </article>

                    <article className="studio-documents panel">
                      <div className="panel-header"><div><span className="section-kicker">Relational document flow</span><h2>Generated SAP evidence chain</h2></div><strong>6 linked objects</strong></div>
                      <div>
                        {selectedGeneratedSimulation.documents.map((document, index) => (
                          <div key={document.number}><span>{document.sequence}</span><div><small>{document.module}</small><strong>{document.type}</strong><code>{document.number}</code><p>{document.purpose}</p></div>{index < selectedGeneratedSimulation.documents.length - 1 && <ArrowRight size={15} />}</div>
                        ))}
                      </div>
                    </article>

                    <div className="studio-impact-grid">
                      <article className="panel"><Factory size={18} /><div><span>Operational impact</span><p>{selectedGeneratedSimulation.operationalImpact}</p></div></article>
                      <article className="panel"><Package size={18} /><div><span>Inventory impact</span><p>{selectedGeneratedSimulation.inventoryImpact}</p></div></article>
                      <article className="panel"><TrendingUp size={18} /><div><span>Financial impact</span><p>{selectedGeneratedSimulation.financialImpact}</p></div></article>
                    </div>

                    <article className="studio-response panel">
                      <div className="panel-header"><div><span className="section-kicker">Tutor-ready response</span><h2>Controlled recovery sequence</h2></div></div>
                      <div>
                        {selectedGeneratedSimulation.steps.map((step) => {
                          const execution = selectedGeneratedSimulation.execution;
                          const complete = execution?.completedSteps.includes(step.sequence);
                          const current = execution?.currentStep === step.sequence;
                          return (
                            <div className={complete ? "complete" : current ? "current" : ""} key={step.sequence}>
                              <span>{complete ? <Check size={14} /> : step.sequence}</span>
                              <div><small>{step.role} / {step.app}</small><h3>{step.title}</h3><p>{step.instruction}</p><div><strong>Why</strong>{step.why}</div><div><strong>Result</strong>{step.result}</div></div>
                            </div>
                          );
                        })}
                      </div>
                    </article>

                    {selectedGeneratedSimulation.execution && (
                      <article className="studio-execution panel">
                        <div className="panel-header">
                          <div><span className="section-kicker">Event-driven execution</span><h2>Simulation command console</h2></div>
                          <span className={`advanced-status ${selectedGeneratedSimulation.execution.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedGeneratedSimulation.execution.status}</span>
                        </div>
                        <div className="studio-state-grid">
                          <div><span>Aggregate version</span><strong>v{selectedGeneratedSimulation.execution.version}</strong></div>
                          <div><span>Operational state</span><strong>{selectedGeneratedSimulation.execution.operationalState}</strong></div>
                          <div><span>Inventory state</span><strong>{selectedGeneratedSimulation.execution.inventoryState}</strong></div>
                          <div><span>Financial state</span><strong>{selectedGeneratedSimulation.execution.financialState}</strong></div>
                        </div>
                        {selectedGeneratedSimulation.execution.currentStep !== null ? (() => {
                          const currentStep = selectedGeneratedSimulation.steps.find((step) => step.sequence === selectedGeneratedSimulation.execution!.currentStep)!;
                          const currentDocument = selectedGeneratedSimulation.documents.find((document) => document.sequence === currentStep.sequence)!;
                          return (
                            <div className="studio-command">
                              <div className="studio-command-brief">
                                <span>Next command / Step {currentStep.sequence}</span>
                                <h3>{currentStep.title}</h3>
                                <p>{currentStep.instruction}</p>
                                <code>{currentDocument.type} {currentDocument.number}</code>
                              </div>
                              <label htmlFor="studio-execution-note">Execution evidence</label>
                              <textarea id="studio-execution-note" maxLength={500} value={studioExecutionNote} onChange={(event) => setStudioExecutionNote(event.target.value)} placeholder="Record what you validated, posted, or approved before executing this command..." />
                              <div><small>{studioExecutionNote.trim().length}/500 characters / expected version {selectedGeneratedSimulation.execution.version}</small><button className="primary-button" disabled={studioLoading || studioExecutionNote.trim().length < 5} onClick={() => void executeStudioStep()}>Execute step <ArrowRight size={15} /></button></div>
                            </div>
                          );
                        })() : (
                          <div className="completion-banner"><Award size={22} /><div><strong>Simulation execution completed</strong><span>All six commands, documents, and evidence events replay to a closed state.</span></div></div>
                        )}
                        <div className="studio-event-ledger">
                          <div><span className="section-kicker">Immutable event ledger</span><strong>{selectedGeneratedSimulation.execution.events.length} events</strong></div>
                          {selectedGeneratedSimulation.execution.events.map((event) => (
                            <div key={event.id}>
                              <span>v{event.version}</span>
                              <div><strong>{event.title}</strong><code>{event.documentNumber} / {event.id}</code><p>{event.note}</p><small>{event.actor} / {new Date(event.occurredAt).toLocaleString("en-GB")}</small></div>
                            </div>
                          ))}
                          {!selectedGeneratedSimulation.execution.events.length && <p className="no-journal">No commands have been executed. The generated package remains unchanged.</p>}
                        </div>
                      </article>
                    )}

                    <div className="studio-evidence-grid">
                      <article className="panel">
                        <div className="panel-header"><div><span className="section-kicker">Posting logic</span><h2>Accounting evidence</h2></div></div>
                        {selectedGeneratedSimulation.accountingEntries.map((entry) => <div className="studio-journal" key={entry.debit}><span>Dr</span><strong>{entry.debit}</strong><span>Cr</span><strong>{entry.credit}</strong><code>{entry.amount}</code><p>{entry.explanation}</p></div>)}
                      </article>
                      <article className="panel">
                        <div className="panel-header"><div><span className="section-kicker">Generation controls</span><h2>Integrity checks</h2></div></div>
                        <div className="studio-control-list">{selectedGeneratedSimulation.controls.map((control) => <p key={control}><ShieldCheck size={15} />{control}</p>)}</div>
                      </article>
                    </div>
                  </div>
                ) : (
                  <article className="studio-empty panel"><Sparkles size={25} /><h2>No generated package selected</h2><p>Choose an industry, fiscal year, and curated exception above.</p></article>
                )}
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

          {view === "governance" && (
            <section className="governance-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">SAP master-data governance</p><h1>Change requests and data controls</h1><p>Practise how enterprise data is proposed, validated, approved, and propagated without breaking connected SAP processes.</p></div>
                <span className="api-badge">API /api/governance</span>
              </div>
              <div className="governance-summary">
                <article className="panel"><ShieldCheck size={18} /><div><span>Change requests</span><strong>{governanceCases.length}</strong></div></article>
                <article className="panel"><Clock3 size={18} /><div><span>Open governance</span><strong>{governanceCases.filter((request) => request.status === "Draft" || request.status === "Pending").length}</strong></div></article>
                <article className="panel"><TriangleAlert size={18} /><div><span>Failed validations</span><strong>{governanceCases.filter((request) => request.validations.some((validation) => validation.status === "Fail")).length}</strong></div></article>
                <article className="panel"><Check size={18} /><div><span>Approved changes</span><strong>{governanceCases.filter((request) => request.status === "Approved").length}</strong></div></article>
              </div>
              <div className="governance-toolbar">
                <div><span className="section-kicker">Stewardship workbench</span><h2>Connected master-data changes</h2></div>
                <div className="filter-tabs">
                  {["All", "Material", "Supplier", "Customer", "BOM", "Pricing", "Employee"].map((domain) => (
                    <button className={governanceDomain === domain ? "active" : ""} onClick={() => setGovernanceDomain(domain)} key={domain}>{domain}</button>
                  ))}
                </div>
              </div>
              {governanceError && <p className="governance-error">{governanceError}</p>}
              <div className="governance-layout">
                <aside className="governance-list panel">
                  {visibleGovernanceCases.map((request) => (
                    <button className={selectedGovernance?.id === request.id ? "selected" : ""} onClick={() => {
                      setSelectedGovernanceId(request.id);
                      setGovernanceComment("");
                      setGovernanceError("");
                    }} key={request.id}>
                      <span className={`governance-priority ${request.priority.toLowerCase()}`}>{request.priority}</span>
                      <div><strong>{request.title}</strong><code>{request.objectId}</code><small>{request.domain} / Effective {request.effectiveDate}</small></div>
                      <span className={`governance-status ${request.status.toLowerCase().replaceAll(" ", "-")}`}>{request.status}</span>
                    </button>
                  ))}
                  {!visibleGovernanceCases.length && <p className="governance-empty">No change requests match this domain.</p>}
                </aside>
                {selectedGovernance && (
                  <div className="governance-workspace">
                    <article className="governance-brief panel">
                      <div className="governance-brief-heading">
                        <div><span className="section-kicker">{selectedGovernance.id} / {selectedGovernance.domain}</span><h2>{selectedGovernance.title}</h2><code>{selectedGovernance.objectId} / {selectedGovernance.objectName}</code></div>
                        <span className={`governance-status ${selectedGovernance.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedGovernance.status}</span>
                      </div>
                      <div className="governance-facts">
                        <div><span>Requested by</span><strong>{selectedGovernance.requestedBy}</strong></div>
                        <div><span>Requested</span><strong>{new Date(selectedGovernance.requestedAt).toLocaleString("en-GB")}</strong></div>
                        <div><span>Effective date</span><strong>{selectedGovernance.effectiveDate}</strong></div>
                        <div><span>Current owner</span><strong>{selectedGovernance.steps.find((step) => step.status === "Current")?.role ?? "Governance complete"}</strong></div>
                      </div>
                      <div className="governance-purpose"><div><strong>Business reason</strong><p>{selectedGovernance.businessReason}</p></div><div><strong>Governance policy</strong><p>{selectedGovernance.governancePolicy}</p></div><div><strong>Risk if uncontrolled</strong><p>{selectedGovernance.risk}</p></div></div>
                    </article>

                    <article className="governance-fields panel">
                      <div className="panel-header"><div><span className="section-kicker">Proposed record version</span><h2>Field-level change comparison</h2></div><strong>{selectedGovernance.fieldChanges.length} fields</strong></div>
                      <div className="governance-field-head"><span>Field</span><span>Current value</span><span>Proposed value</span><span>Business rationale</span></div>
                      {selectedGovernance.fieldChanges.map((change) => (
                        <div className="governance-field-row" key={change.field}>
                          <div><strong>{change.field}</strong>{change.critical && <small>Critical</small>}</div><code>{change.before}</code><code>{change.after}</code><p>{change.rationale}</p>
                        </div>
                      ))}
                    </article>

                    <div className="governance-control-grid">
                      <article className="governance-validations panel">
                        <div className="panel-header"><div><span className="section-kicker">Validation gate</span><h2>Can this change proceed?</h2></div></div>
                        {selectedGovernance.validations.map((validation) => (
                          <div key={validation.id}><span className={`validation-state ${validation.status.toLowerCase()}`}>{validation.status}</span><div><strong>{validation.label}</strong><small>{validation.id}</small><p>{validation.evidence}</p></div></div>
                        ))}
                      </article>
                      <article className="governance-route panel">
                        <div className="panel-header"><div><span className="section-kicker">Governance route</span><h2>Accountability and approval</h2></div></div>
                        {selectedGovernance.steps.map((step) => (
                          <div className={`governance-step ${step.status.toLowerCase()}`} key={step.sequence}>
                            <span>{step.sequence}</span><div><strong>{step.role}</strong><small>{step.assignee}</small>{step.comment && <p>{step.comment}</p>}</div><b>{step.decision ?? step.status}</b>
                          </div>
                        ))}
                      </article>
                    </div>

                    <article className="governance-dependencies panel">
                      <div className="panel-header"><div><span className="section-kicker">Relational integrity</span><h2>Downstream impact analysis</h2></div><strong>{selectedGovernance.dependencies.length} dependencies</strong></div>
                      <div>
                        {selectedGovernance.dependencies.map((dependency) => (
                          <div key={`${dependency.object}-${dependency.relationship}`}><span><ListTree size={15} /></span><div><strong>{dependency.object}</strong><small>{dependency.relationship}</small><p>{dependency.impact}</p></div></div>
                        ))}
                      </div>
                    </article>

                    {selectedGovernance.allowedActions.length > 0 && (
                      <article className="governance-decision panel">
                        <div><span className="section-kicker">Simulation decision</span><h2>Act as {selectedGovernance.steps.find((step) => step.status === "Current")?.role}</h2><p>Use the validation evidence and dependency impact to record a controlled governance decision.</p></div>
                        <textarea value={governanceComment} onChange={(event) => setGovernanceComment(event.target.value)} maxLength={500} placeholder="Explain the validation evidence reviewed and why the change should proceed or return for correction..." />
                        <div>
                          <small>{governanceComment.trim().length}/500 characters</small>
                          {selectedGovernance.allowedActions.includes("request-changes") && <button disabled={governanceLoading || governanceComment.trim().length < 5} onClick={() => submitGovernanceDecision("request-changes")}>Request changes</button>}
                          {selectedGovernance.allowedActions.includes("reject") && <button className="reject" disabled={governanceLoading || governanceComment.trim().length < 5} onClick={() => submitGovernanceDecision("reject")}>Reject</button>}
                          {selectedGovernance.allowedActions.includes("submit") && <button className="approve" disabled={governanceLoading || governanceComment.trim().length < 5} onClick={() => submitGovernanceDecision("submit")}>{governanceLoading ? "Saving..." : "Submit for review"}</button>}
                          {selectedGovernance.allowedActions.includes("approve") && <button className="approve" disabled={governanceLoading || governanceComment.trim().length < 5} onClick={() => submitGovernanceDecision("approve")}>{governanceLoading ? "Saving..." : "Approve stage"}</button>}
                        </div>
                      </article>
                    )}

                    <article className="governance-audit panel">
                      <div className="panel-header"><div><span className="section-kicker">Change evidence</span><h2>Governance audit trail</h2></div><strong>{selectedGovernance.auditTrail.length} events</strong></div>
                      {selectedGovernance.auditTrail.map((entry) => (
                        <div key={entry.id}><span>{new Date(entry.at).toLocaleString("en-GB")}</span><div><strong>{entry.action}</strong><small>{entry.actor} / {entry.actorRole}</small><p>{entry.comment}</p></div></div>
                      ))}
                    </article>
                  </div>
                )}
              </div>
            </section>
          )}

          {view === "masterdata" && (
            <section className="master-data-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">SAP relational master data</p><h1>Material, production, and quality model</h1><p>Trace how plant, sourcing, valuation, batches, specifications, BOMs, routings, and work centres control transactions.</p></div>
                <span className="api-badge">API /api/master-data</span>
              </div>
              <div className="master-data-summary">
                <article className="panel"><Package size={18} /><div><span>Materials</span><strong>{materials.length}</strong></div></article>
                <article className="panel"><ListTree size={18} /><div><span>Released BOMs</span><strong>{billsOfMaterial.length}</strong></div></article>
                <article className="panel"><Settings size={18} /><div><span>Routings</span><strong>{routings.length}</strong></div></article>
                <article className="panel"><Factory size={18} /><div><span>Work centres</span><strong>{workCenters.length}</strong></div></article>
                <article className="panel"><Boxes size={18} /><div><span>Batches</span><strong>{batches.length}</strong></div></article>
              </div>
              <div className="master-data-toolbar">
                <div><span className="section-kicker">Material catalogue</span><h2>Select an SAP material</h2></div>
                <div className="filter-tabs">
                  {["All", "ROH", "HALB", "FERT", "VERP", "ERSA"].map((filter) => (
                    <button className={materialTypeFilter === filter ? "active" : ""} onClick={() => setMaterialTypeFilter(filter)} key={filter}>{filter}</button>
                  ))}
                </div>
              </div>
              <div className="master-data-layout">
                <aside className="material-list panel">
                  {materials
                    .filter((material) => materialTypeFilter === "All" || material.type === materialTypeFilter)
                    .map((material) => (
                      <button className={selectedMaterial.id === material.id ? "selected" : ""} onClick={() => setSelectedMaterialId(material.id)} key={material.id}>
                        <span className={`material-type ${material.type.toLowerCase()}`}>{material.type}</span>
                        <div><strong>{material.description}</strong><code>{material.id}</code><small>{material.plant} / {material.storageLocation}</small></div>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                </aside>
                <div className="master-data-workspace">
                  <article className="material-header panel">
                    <div>
                      <span className="section-kicker">{selectedMaterial.type} / {selectedMaterial.materialGroup}</span>
                      <h2>{selectedMaterial.description}</h2>
                      <code>{selectedMaterial.id}</code>
                    </div>
                    <span className={`status-chip ${selectedMaterial.status.toLowerCase()}`}>{selectedMaterial.status}</span>
                    <div className="material-core-facts">
                      <div><span>Plant / storage</span><strong>{selectedMaterial.plant} / {selectedMaterial.storageLocation}</strong></div>
                      <div><span>Base unit</span><strong>{selectedMaterial.baseUnit}</strong></div>
                      <div><span>Procurement</span><strong>{selectedMaterial.procurementType}</strong></div>
                      <div><span>MRP / lot size</span><strong>{selectedMaterial.mrpType} / {selectedMaterial.lotSize}</strong></div>
                      <div><span>Lead time</span><strong>{selectedMaterial.leadTimeDays} days</strong></div>
                      <div><span>Standard price</span><strong>{selectedMaterial.standardPrice}</strong></div>
                      <div><span>Valuation class</span><strong>{selectedMaterial.valuationClass}</strong></div>
                      <div><span>Profit centre</span><strong>{selectedMaterial.profitCenter}</strong></div>
                    </div>
                    <div className="material-controls">
                      <span className={selectedMaterial.batchManaged ? "enabled" : ""}><Check size={13} />Batch management</span>
                      <span className={selectedMaterial.qualityInspection ? "enabled" : ""}><Check size={13} />Quality inspection</span>
                    </div>
                  </article>

                  {selectedBom && (
                    <article className="master-object panel">
                      <div className="master-object-heading"><div><span className="section-kicker">Bill of material</span><h2>{selectedBom.id}</h2></div><code>{selectedBom.baseQuantity} / Alternative {selectedBom.alternative}</code></div>
                      <div className="bom-table">
                        <div className="bom-head"><span>Operation</span><span>Component</span><span>Quantity</span><span>Scrap</span><span>Purpose</span></div>
                        {selectedBom.components.map((component) => (
                          <div className="bom-row" key={`${selectedBom.id}-${component.materialId}`}>
                            <code>{component.operation}</code>
                            <div><strong>{materialById(component.materialId)?.description}</strong><small>{component.materialId}</small></div>
                            <strong>{component.quantity.toLocaleString()} {component.unit}</strong>
                            <span>{component.scrapPercent}%</span>
                            <p>{component.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  )}

                  {selectedRouting && (
                    <article className="master-object panel">
                      <div className="master-object-heading"><div><span className="section-kicker">Routing and production version</span><h2>{selectedRouting.id}</h2></div><code>{selectedRouting.productionVersion} / {selectedRouting.plant}</code></div>
                      <div className="routing-flow">
                        {selectedRouting.operations.map((operation, index) => (
                          <div key={`${selectedRouting.id}-${operation.number}`}>
                            <span>{operation.number}</span>
                            <div><strong>{operation.title}</strong><code>{operation.workCenterId} / {operation.controlKey}</code><small>{operation.duration} / {operation.activityType}</small><p>{operation.purpose}</p></div>
                            {index < selectedRouting.operations.length - 1 && <ArrowRight size={16} />}
                          </div>
                        ))}
                      </div>
                    </article>
                  )}

                  <div className="master-object-grid">
                    <article className="master-object panel">
                      <div className="master-object-heading"><div><span className="section-kicker">Batch stock</span><h2>Genealogy and availability</h2></div><strong>{selectedBatches.length}</strong></div>
                      <div className="compact-object-list">
                        {selectedBatches.map((batch) => <div key={batch.id}><span className={`status-chip ${batch.status.toLowerCase()}`}>{batch.status}</span><div><strong>{batch.id}</strong><small>{batch.quantity} / {batch.stockType} / {batch.plant}/{batch.storageLocation}</small></div></div>)}
                        {!selectedBatches.length && <p>No batch stock is recorded for this material.</p>}
                      </div>
                    </article>
                    <article className="master-object panel">
                      <div className="master-object-heading"><div><span className="section-kicker">Quality specifications</span><h2>Inspection controls</h2></div><strong>{selectedSpecifications.length}</strong></div>
                      <div className="compact-object-list">
                        {selectedSpecifications.map((specification) => <div key={specification.id}><span className={specification.critical ? "critical-control" : "standard-control"}>{specification.critical ? "Critical" : "Standard"}</span><div><strong>{specification.characteristic}</strong><small>{specification.target ? `Target ${specification.target} ${specification.unit}` : specification.method} / {specification.id}</small></div></div>)}
                        {!selectedSpecifications.length && <p>No inspection specification is assigned.</p>}
                      </div>
                    </article>
                    <article className="master-object panel">
                      <div className="master-object-heading"><div><span className="section-kicker">Approved sources</span><h2>Supplier and price control</h2></div><strong>{selectedSources.length}</strong></div>
                      <div className="compact-object-list">
                        {selectedSources.map((source) => <div key={source.id}><span className={`status-chip ${source.status.toLowerCase()}`}>{source.status}</span><div><strong>{businessPartners.find((partner) => partner.id === source.supplierId)?.name}</strong><small>{source.price} / {source.plannedDeliveryDays} days / Quality {source.qualityScore}/100</small></div></div>)}
                        {!selectedSources.length && <p>This material is produced internally or has no purchasing source.</p>}
                      </div>
                    </article>
                    <article className="master-object panel">
                      <div className="master-object-heading"><div><span className="section-kicker">Work-centre dependency</span><h2>Capacity and cost assignment</h2></div><strong>{selectedRouting?.operations.length ?? 0}</strong></div>
                      <div className="compact-object-list">
                        {(selectedRouting?.operations ?? []).map((operation) => {
                          const workCenter = workCenters.find((item) => item.id === operation.workCenterId);
                          return workCenter ? <div key={`${operation.number}-${workCenter.id}`}><span className="material-type halb">WC</span><div><strong>{workCenter.name}</strong><small>{workCenter.id} / {workCenter.capacity} / {workCenter.costCenter}</small></div></div> : null;
                        })}
                        {!selectedRouting && <p>No routing work-centre assignment is required.</p>}
                      </div>
                    </article>
                  </div>
                </div>
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

          {view === "analytics" && (
            <section className="analytics-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">SAP enterprise performance management</p><h1>Performance and profitability cockpit</h1><p>Connect financial results to service, inventory, production, quality, maintenance, and working-capital behavior.</p></div>
                <span className="api-badge">API /api/analytics</span>
              </div>

              <div className="analytics-year-tabs">
                {fiscalYearSummaries.map((summary) => (
                  <button className={analyticsYear === summary.year ? "active" : ""} onClick={() => {
                    setAnalyticsYear(summary.year);
                    setSelectedDriverId(driversForYear(summary.year)[0]?.id ?? "");
                  }} key={summary.year}>
                    <span>{summary.phase}</span><strong>{summary.year}</strong><small>{summary.revenue} revenue / {summary.operatingMargin} margin</small>
                  </button>
                ))}
              </div>

              <div className="analytics-kpis">
                {analyticsYearPeriods.length > 0 && (() => {
                  const latest = analyticsYearPeriods[analyticsYearPeriods.length - 1];
                  const first = analyticsYearPeriods[0];
                  return (
                    <>
                      <article className="panel"><span>Quarterly revenue</span><strong>GBP {latest.revenueM.toFixed(1)}M</strong><small className={latest.revenueM >= first.revenueM ? "positive" : "negative"}>{latest.revenueM >= first.revenueM ? "+" : ""}{(latest.revenueM - first.revenueM).toFixed(1)}M vs Q1</small></article>
                      <article className="panel"><span>Operating margin</span><strong>{latest.operatingMargin.toFixed(1)}%</strong><small className={latest.operatingMargin >= first.operatingMargin ? "positive" : "negative"}>{latest.operatingMargin >= first.operatingMargin ? "+" : ""}{(latest.operatingMargin - first.operatingMargin).toFixed(1)} pts vs Q1</small></article>
                      <article className="panel"><span>Customer service</span><strong>{latest.serviceLevel.toFixed(1)}%</strong><small>{latest.inventoryDays} inventory days</small></article>
                      <article className="panel"><span>Operational stability</span><strong>{latest.downtimeHours} hrs</strong><small>{latest.wastePercent.toFixed(1)}% waste / GBP {latest.workingCapitalM.toFixed(1)}M working capital</small></article>
                    </>
                  );
                })()}
              </div>

              <div className="analytics-main-grid">
                <article className="analytics-trend panel">
                  <div className="panel-header">
                    <div><span className="section-kicker">Quarterly trend</span><h2>{analyticsMetric}</h2></div>
                    <div className="analytics-metric-tabs">
                      {analyticsMetrics.map((metric) => <button className={analyticsMetric === metric ? "active" : ""} onClick={() => setAnalyticsMetric(metric)} key={metric}>{metric}</button>)}
                    </div>
                  </div>
                  <div className="analytics-chart">
                    {analyticsYearPeriods.map((period) => {
                      const value = metricValue(period, analyticsMetric);
                      return (
                        <div className="analytics-bar-column" key={period.id}>
                          <strong>{metricLabel(value, analyticsMetric)}</strong>
                          <div><span style={{ height: `${Math.max(8, (value / metricMaximum) * 100)}%` }} /></div>
                          <small>{period.quarter}</small>
                        </div>
                      );
                    })}
                  </div>
                  <div className="analytics-supporting">
                    {analyticsYearPeriods.map((period) => (
                      <div key={`${period.id}-support`}><strong>{period.quarter}</strong><span>{period.volumeKhl}K HL</span><span>{period.wastePercent}% waste</span><span>GBP {period.workingCapitalM}M WC</span></div>
                    ))}
                  </div>
                </article>

                <article className="analytics-driver-list panel">
                  <div className="panel-header"><div><span className="section-kicker">Explainable performance</span><h2>Business drivers</h2></div><strong>{analyticsYearDrivers.length}</strong></div>
                  <div>
                    {analyticsYearDrivers.map((driver) => (
                      <button className={selectedPerformanceDriver?.id === driver.id ? "selected" : ""} onClick={() => setSelectedDriverId(driver.id)} key={driver.id}>
                        <span className={`driver-direction ${driver.direction.toLowerCase()}`}>{driver.direction}</span>
                        <div><strong>{driver.title}</strong><small>{driver.category} / {driver.financialImpact}</small></div>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </article>
              </div>

              {selectedPerformanceDriver && (
                <article className="analytics-driver-detail panel">
                  <div className="analytics-driver-heading">
                    <div><span className="section-kicker">{selectedPerformanceDriver.id}</span><h2>{selectedPerformanceDriver.title}</h2><p>{selectedPerformanceDriver.explanation}</p></div>
                    <span className={`driver-direction ${selectedPerformanceDriver.direction.toLowerCase()}`}>{selectedPerformanceDriver.direction}</span>
                  </div>
                  <div className="analytics-driver-evidence">
                    <div><span>Financial impact</span><strong>{selectedPerformanceDriver.financialImpact}</strong></div>
                    <div><span>KPI movement</span><strong>{selectedPerformanceDriver.metricImpact}</strong></div>
                    <div><span>SAP evidence</span><strong>{selectedPerformanceDriver.sapEvidence}</strong></div>
                    <div><span>Affected modules</span><strong>{selectedPerformanceDriver.modules.join(" / ")}</strong></div>
                  </div>
                  <div className="analytics-action">
                    <Sparkles size={18} /><div><strong>Management action</strong><p>{selectedPerformanceDriver.managementAction}</p></div>
                    <button onClick={() => {
                      const event = enterpriseEvents.find((item) => selectedPerformanceDriver.eventIds.includes(item.id));
                      if (event) {
                        setSelectedYear(event.fiscalYear);
                        setEventCategory("All");
                        setSelectedEventId(event.id);
                        setView("history");
                      }
                    }}>Open source event <ArrowRight size={15} /></button>
                  </div>
                </article>
              )}

              <div className="profitability-heading">
                <div><span className="section-kicker">Margin analysis</span><h2>Profitability by business dimension</h2></div>
                <div className="filter-tabs">
                  {(["Product", "Customer", "Channel"] as const).map((dimension) => <button className={profitabilityDimension === dimension ? "active" : ""} onClick={() => setProfitabilityDimension(dimension)} key={dimension}>{dimension}</button>)}
                </div>
              </div>
              <div className="profitability-table panel">
                <div className="profitability-head"><span>{profitabilityDimension}</span><span>Revenue</span><span>Contribution</span><span>Margin</span><span>Volume share</span><span>Primary driver</span></div>
                {visibleProfitability.map((segment) => (
                  <div className="profitability-row" key={segment.id}>
                    <strong>{segment.name}</strong><span>GBP {segment.revenueM.toFixed(1)}M</span><span>GBP {segment.contributionM.toFixed(1)}M</span><strong className={segment.marginPercent >= 25 ? "healthy" : "attention-margin"}>{segment.marginPercent.toFixed(1)}%</strong><span>{segment.volumeShare}%</span><p>{segment.primaryDriver}</p>
                  </div>
                ))}
                {!visibleProfitability.length && <p className="profitability-empty">Detailed {profitabilityDimension.toLowerCase()} profitability is available for the current optimization year.</p>}
              </div>
            </section>
          )}

          {view === "workflows" && (
            <section className="workflow-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">SAP controls and delegated authority</p><h1>Approval inbox and audit trail</h1><p>Inspect business evidence, follow the approval route, and practise controlled SAP decisions.</p></div>
                <span className="api-badge">API /api/workflows</span>
              </div>
              <div className="workflow-summary">
                <article className="panel"><ClipboardCheck size={18} /><div><span>Total cases</span><strong>{workflows.length}</strong></div></article>
                <article className="panel"><Clock3 size={18} /><div><span>Pending</span><strong>{workflows.filter((workflow) => workflow.status === "Pending").length}</strong></div></article>
                <article className="panel"><TriangleAlert size={18} /><div><span>Overdue</span><strong>{workflowOverdue}</strong></div></article>
                <article className="panel"><Check size={18} /><div><span>Approved</span><strong>{workflows.filter((workflow) => workflow.status === "Approved").length}</strong></div></article>
              </div>
              <div className="workflow-toolbar">
                <div><span className="section-kicker">Learner workspace</span><h2>Delegated approval cases</h2></div>
                <div className="filter-tabs">
                  {(["All", "Pending", "Approved", "Rejected", "Information required"] as const).map((filter) => (
                    <button className={workflowFilter === filter ? "active" : ""} onClick={() => setWorkflowFilter(filter)} key={filter}>{filter}</button>
                  ))}
                </div>
              </div>
              {workflowError && <p className="workflow-error">{workflowError}</p>}
              <div className="workflow-layout">
                <aside className="workflow-list panel">
                  {visibleWorkflows.map((workflow) => (
                    <button className={selectedWorkflow?.id === workflow.id ? "selected" : ""} onClick={() => {
                      setSelectedWorkflowId(workflow.id);
                      setWorkflowComment("");
                      setWorkflowError("");
                    }} key={workflow.id}>
                      <span className={`workflow-priority ${workflow.priority.toLowerCase()}`}>{workflow.priority}</span>
                      <div><strong>{workflow.title}</strong><code>{workflow.documentType} {workflow.documentNumber}</code><small>{workflow.module}</small></div>
                      <span className={`workflow-list-status ${workflow.status.toLowerCase().replaceAll(" ", "-")}`}>{workflow.status}</span>
                    </button>
                  ))}
                  {!visibleWorkflows.length && <p className="workflow-empty">No cases match this filter.</p>}
                </aside>
                {selectedWorkflow && (
                  <div className="workflow-workspace">
                    <article className="workflow-brief panel">
                      <div className="workflow-brief-header">
                        <div><span className="section-kicker">{selectedWorkflow.id}</span><h2>{selectedWorkflow.title}</h2><code>{selectedWorkflow.documentType} {selectedWorkflow.documentNumber}</code></div>
                        <span className={`workflow-decision-status ${selectedWorkflow.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedWorkflow.status}</span>
                      </div>
                      <div className="workflow-facts">
                        <div><span>Requested by</span><strong>{selectedWorkflow.requestedBy}</strong></div>
                        <div><span>Requested</span><strong>{new Date(selectedWorkflow.requestedAt).toLocaleString("en-GB")}</strong></div>
                        <div><span>Due</span><strong>{new Date(selectedWorkflow.dueAt).toLocaleString("en-GB")}</strong></div>
                        <div><span>Value / exposure</span><strong>{selectedWorkflow.amount}</strong></div>
                      </div>
                      <div className="workflow-reason"><strong>Business reason</strong><p>{selectedWorkflow.businessReason}</p></div>
                      <div className="workflow-risk-grid">
                        <div><span>Policy rule</span><p>{selectedWorkflow.policyRule}</p></div>
                        <div><span>Decision risk</span><p>{selectedWorkflow.risk}</p></div>
                        <div><span>Blocked outcome</span><p>{selectedWorkflow.blockingImpact}</p></div>
                      </div>
                    </article>
                    <div className="workflow-detail-grid">
                      <article className="workflow-control panel">
                        <div className="panel-header"><div><span className="section-kicker">Control evidence</span><h2>What should be checked?</h2></div></div>
                        <div className="workflow-evidence">
                          {selectedWorkflow.controlEvidence.map((evidence) => <div key={evidence}><Check size={15} /><span>{evidence}</span></div>)}
                        </div>
                      </article>
                      <article className="workflow-route panel">
                        <div className="panel-header"><div><span className="section-kicker">Approval route</span><h2>Who acts next?</h2></div></div>
                        {selectedWorkflow.steps.map((step) => (
                          <div className={`workflow-step ${step.status.toLowerCase()}`} key={step.sequence}>
                            <span>{step.sequence}</span>
                            <div><strong>{step.role}</strong><small>{step.assignee}</small>{step.comment && <p>{step.comment}</p>}</div>
                            <b>{step.decision ?? step.status}</b>
                          </div>
                        ))}
                      </article>
                    </div>
                    {selectedWorkflow.allowedActions.length > 0 && (
                      <article className="workflow-decision panel">
                        <div><span className="section-kicker">Simulation decision</span><h2>Act as {selectedWorkflow.steps.find((step) => step.status === "Current")?.role}</h2><p>Record a clear rationale. Approval advances to the next required approver; rejection or an information request stops the workflow.</p></div>
                        <textarea value={workflowComment} onChange={(event) => setWorkflowComment(event.target.value)} maxLength={500} placeholder="Explain the evidence reviewed and the reason for your decision..." />
                        <div>
                          <small>{workflowComment.trim().length}/500 characters</small>
                          {selectedWorkflow.allowedActions.includes("request-information") && <button disabled={workflowLoading || workflowComment.trim().length < 5} onClick={() => submitWorkflowDecision("request-information")}>Request information</button>}
                          {selectedWorkflow.allowedActions.includes("reject") && <button className="reject" disabled={workflowLoading || workflowComment.trim().length < 5} onClick={() => submitWorkflowDecision("reject")}>Reject</button>}
                          {selectedWorkflow.allowedActions.includes("approve") && <button className="approve" disabled={workflowLoading || workflowComment.trim().length < 5} onClick={() => submitWorkflowDecision("approve")}>{workflowLoading ? "Saving..." : "Approve"}</button>}
                        </div>
                      </article>
                    )}
                    <article className="workflow-audit panel">
                      <div className="panel-header"><div><span className="section-kicker">Immutable evidence</span><h2>Workflow audit trail</h2></div><strong>{selectedWorkflow.auditTrail.length} events</strong></div>
                      {selectedWorkflow.auditTrail.map((entry) => (
                        <div key={entry.id}><span>{new Date(entry.at).toLocaleString("en-GB")}</span><div><strong>{entry.action}</strong><small>{entry.actor} / {entry.actorRole}</small><p>{entry.comment}</p></div></div>
                      ))}
                    </article>
                  </div>
                )}
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
                <div className="document-flow-summary">
                  <div><span>Flow ID</span><strong>{activeDocumentFlow.id}</strong></div>
                  <div><span>Connected documents</span><strong>{activeDocumentFlow.nodes.length}</strong></div>
                  <div><span>Integrated modules</span><strong>{activeDocumentFlow.modules.join(" / ")}</strong></div>
                  <div><span>Active exception</span><strong>{activeDocumentFlow.exceptionReference}</strong></div>
                </div>
                <div className="document-flow-chain">
                  {activeDocumentFlow.nodes.map((node, index) => (
                    <button
                      className={`document-flow-node ${node.status} ${selectedDocument.id === node.id ? "selected" : ""}`}
                      onClick={() =>
                        setSelectedDocumentIds((current) => ({
                          ...current,
                          [activeScenarioId]: node.id,
                        }))
                      }
                      key={node.id}
                    >
                      <span className="document-sequence">{node.status === "complete" ? <Check size={14} /> : node.sequence}</span>
                      <span>{node.module}</span>
                      <strong>{node.label}</strong>
                      <code>{node.document}</code>
                      {index < activeDocumentFlow.nodes.length - 1 && <ArrowRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <article className="document-inspector panel">
                <header>
                  <div>
                    <span className="section-kicker">{selectedDocument.objectType}</span>
                    <h2>{selectedDocument.label}</h2>
                    <code>{selectedDocument.document}</code>
                  </div>
                  <span className={`status-chip ${selectedDocument.status}`}>{selectedDocument.workflowStatus}</span>
                </header>
                <div className="document-purpose">
                  <FileText size={19} />
                  <div><strong>Why this document exists</strong><p>{selectedDocument.purpose}</p></div>
                </div>
                <div className="document-facts">
                  <div><span>Created by</span><strong>{selectedDocument.createdBy}</strong></div>
                  <div><span>Posting time</span><strong>{selectedDocument.postedAt}</strong></div>
                  <div><span>Approval control</span><strong>{selectedDocument.approval}</strong></div>
                  <div><span>SAP module</span><strong>{selectedDocument.module}</strong></div>
                </div>
                <div className="document-links">
                  <div><span>Upstream document</span><strong>{selectedDocument.upstreamDocument ?? "Business demand / trigger"}</strong></div>
                  <ArrowRight size={18} />
                  <div><span>Current document</span><strong>{selectedDocument.document}</strong></div>
                  <ArrowRight size={18} />
                  <div><span>Downstream document</span><strong>{selectedDocument.downstreamDocument ?? "Process complete"}</strong></div>
                </div>
                <div className="document-impact-grid">
                  <div><span className="impact-icon inventory"><Package size={16} /></span><p><strong>Inventory impact</strong>{selectedDocument.inventoryImpact}</p></div>
                  <div><span className="impact-icon financial"><TrendingUp size={16} /></span><p><strong>Accounting impact</strong>{selectedDocument.accountingImpact}</p></div>
                </div>
                <div className="journal-panel">
                  <div><span className="section-kicker">Accounting evidence</span><strong>{selectedDocument.accountingEntries.length ? `${selectedDocument.accountingEntries.length} journal ${selectedDocument.accountingEntries.length === 1 ? "entry" : "entries"}` : "No FI document at this milestone"}</strong></div>
                  {selectedDocument.accountingEntries.map((posting, index) => (
                    <div className="journal-entry" key={`${posting.debit}-${posting.credit}-${index}`}>
                      <span>Dr</span><strong>{posting.debit}</strong>
                      <span>Cr</span><strong>{posting.credit}</strong>
                      <code>{posting.amount}</code>
                      <p>{posting.explanation}</p>
                    </div>
                  ))}
                  {!selectedDocument.accountingEntries.length && <p className="no-journal">This document changes process or inventory status without creating a general-ledger posting.</p>}
                </div>
              </article>
              <article className="process-master-data panel">
                <div className="panel-header">
                  <div><span className="section-kicker">Master-data dependencies</span><h2>What controls this process?</h2></div>
                  <button onClick={() => setView("masterdata")}>Open master data <ArrowRight size={15} /></button>
                </div>
                <div className="dependency-grid">
                  <div><span>Materials</span><strong>{scenarioMasterData.materials.length}</strong><p>{scenarioMasterData.materials.map((item) => item.id).join(" / ") || "No material dependency"}</p></div>
                  <div><span>BOMs / routings</span><strong>{scenarioMasterData.billsOfMaterial.length + scenarioMasterData.routings.length}</strong><p>{[...scenarioMasterData.billsOfMaterial.map((item) => item.id), ...scenarioMasterData.routings.map((item) => item.id)].join(" / ") || "Not applicable"}</p></div>
                  <div><span>Batches / specifications</span><strong>{scenarioMasterData.batches.length + scenarioMasterData.qualitySpecifications.length}</strong><p>{[...scenarioMasterData.batches.map((item) => item.id), ...scenarioMasterData.qualitySpecifications.map((item) => item.id)].join(" / ") || "Not applicable"}</p></div>
                  <div><span>Work centres / sources</span><strong>{scenarioMasterData.workCenters.length + scenarioMasterData.sourceRecords.length}</strong><p>{[...scenarioMasterData.workCenters.map((item) => item.id), ...scenarioMasterData.sourceRecords.map((item) => item.id)].join(" / ") || "Not applicable"}</p></div>
                </div>
              </article>
              {activeScenarioWorkflow && (
                <article className="process-workflow panel">
                  <div>
                    <span className={`workflow-priority ${activeScenarioWorkflow.priority.toLowerCase()}`}>{activeScenarioWorkflow.priority}</span>
                    <div><span className="section-kicker">Connected approval</span><h2>{activeScenarioWorkflow.title}</h2><p>{activeScenarioWorkflow.blockingImpact}</p></div>
                  </div>
                  <div><span>Status</span><strong>{activeScenarioWorkflow.status}</strong></div>
                  <div><span>Current approver</span><strong>{activeScenarioWorkflow.steps.find((step) => step.status === "Current")?.role ?? "Workflow complete"}</strong></div>
                  <button onClick={() => {
                    setSelectedWorkflowId(activeScenarioWorkflow.id);
                    setView("workflows");
                  }}>Open workflow <ArrowRight size={15} /></button>
                </article>
              )}
              <div className="impact-grid">
                {activeScenario.impacts.map((impact) => <article className="panel" key={impact.label}><span className="section-kicker">{impact.label}</span><h3>{impact.title}</h3><p>{impact.description}</p></article>)}
              </div>
            </section>
          )}

          {view === "advanced" && (
            <section className="advanced-page">
              <div className="page-heading compact">
                <div>
                  <p className="eyebrow">Connected SAP practice lab</p>
                  <h1>Advanced lifecycle transactions</h1>
                  <p>
                    Execute realistic cross-module transactions step by step,
                    understand each posting, and retain your own evidence trail.
                  </p>
                </div>
                <span className="api-badge">API /api/advanced-transactions</span>
              </div>

              <div className="advanced-summary">
                <article className="panel">
                  <Repeat2 size={18} />
                  <div><span>Practice cases</span><strong>{advancedTransactions.length}</strong></div>
                </article>
                <article className="panel">
                  <PlayCircle size={18} />
                  <div><span>In progress</span><strong>{advancedTransactions.filter((item) => item.status === "In progress").length}</strong></div>
                </article>
                <article className="panel">
                  <Check size={18} />
                  <div><span>Completed</span><strong>{advancedTransactions.filter((item) => item.status === "Completed").length}</strong></div>
                </article>
                <article className="panel">
                  <Boxes size={18} />
                  <div><span>Modules covered</span><strong>{new Set(advancedTransactions.flatMap((item) => item.modules)).size}</strong></div>
                </article>
              </div>

              <div className="advanced-toolbar">
                <div><span className="section-kicker">Transaction portfolio</span><h2>Choose a business lifecycle</h2></div>
                <div className="category-filters">
                  {([
                    "All",
                    "Stock Transfer",
                    "Customer Return",
                    "Asset Accounting",
                    "Tax Adjustment",
                    "Year-End Close",
                  ] as const).map((type) => (
                    <button
                      className={advancedTypeFilter === type ? "active" : ""}
                      onClick={() => setAdvancedTypeFilter(type)}
                      key={type}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {advancedError && <div className="workflow-error" role="alert">{advancedError}</div>}
              <div className="advanced-layout">
                <aside className="advanced-list panel">
                  {visibleAdvancedTransactions.map((transaction) => (
                    <button
                      className={selectedAdvancedTransaction?.id === transaction.id ? "selected" : ""}
                      onClick={() => setSelectedAdvancedId(transaction.id)}
                      key={transaction.id}
                    >
                      <span>{transaction.type}</span>
                      <strong>{transaction.title}</strong>
                      <code>{transaction.id}</code>
                      <small>{transaction.completedSteps.length} of {transaction.steps.length} steps</small>
                      <b className={transaction.status.toLowerCase().replaceAll(" ", "-")}>{transaction.status}</b>
                    </button>
                  ))}
                  {!advancedLoading && visibleAdvancedTransactions.length === 0 && <div className="workflow-empty">No cases match this filter.</div>}
                </aside>

                {selectedAdvancedTransaction && (
                  <div className="advanced-workspace">
                    <article className="advanced-brief panel">
                      <header>
                        <div>
                          <span className="section-kicker">{selectedAdvancedTransaction.id} / {selectedAdvancedTransaction.type}</span>
                          <h2>{selectedAdvancedTransaction.title}</h2>
                          <p>{selectedAdvancedTransaction.scenario}</p>
                        </div>
                        <span className={`advanced-status ${selectedAdvancedTransaction.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedAdvancedTransaction.status}</span>
                      </header>
                      <div className="advanced-facts">
                        <div><span>Business trigger</span><strong>{selectedAdvancedTransaction.businessTrigger}</strong></div>
                        <div><span>Value</span><strong>{selectedAdvancedTransaction.value}</strong></div>
                        <div><span>Integrated modules</span><strong>{selectedAdvancedTransaction.modules.join(" / ")}</strong></div>
                        <div><span>Priority</span><strong>{selectedAdvancedTransaction.priority}</strong></div>
                      </div>
                      <div className="advanced-references">
                        {selectedAdvancedTransaction.objectReferences.map((reference) => <span key={reference}><FileText size={13} />{reference}</span>)}
                      </div>
                    </article>

                    <article className="advanced-timeline panel">
                      <div className="panel-header">
                        <div><span className="section-kicker">Document sequence</span><h2>End-to-end process</h2></div>
                        <strong>{selectedAdvancedTransaction.completedSteps.length}/{selectedAdvancedTransaction.steps.length}</strong>
                      </div>
                      <div>
                        {selectedAdvancedTransaction.steps.map((step) => {
                          const complete = selectedAdvancedTransaction.completedSteps.includes(step.sequence);
                          const current = step.sequence === selectedAdvancedTransaction.currentStep;
                          return (
                            <div className={`advanced-step ${complete ? "complete" : current ? "current" : ""}`} key={step.sequence}>
                              <span>{complete ? <Check size={14} /> : step.sequence}</span>
                              <div><strong>{step.title}</strong><small>{step.role} / {step.app}</small></div>
                              <code>{step.transactionCode}</code>
                              <b>{step.documentNumber}</b>
                            </div>
                          );
                        })}
                      </div>
                    </article>

                    {currentAdvancedStep ? (
                      <article className="advanced-current panel">
                        <div className="advanced-current-heading">
                          <div><span className="step-label">STEP {currentAdvancedStep.sequence}</span><h2>{currentAdvancedStep.title}</h2><p>{currentAdvancedStep.role}</p></div>
                          <div><span>{currentAdvancedStep.app}</span><code>{currentAdvancedStep.transactionCode}</code></div>
                        </div>
                        <p className="advanced-instruction">{currentAdvancedStep.instruction}</p>
                        <div className="advanced-explanations">
                          <div><Sparkles size={18} /><p><strong>Why this matters</strong>{currentAdvancedStep.why}</p></div>
                          <div><Check size={18} /><p><strong>Expected result</strong>{currentAdvancedStep.result}</p></div>
                        </div>
                        <div className="advanced-impact-grid">
                          <div><Package size={17} /><p><strong>Inventory impact</strong>{currentAdvancedStep.inventoryImpact}</p></div>
                          <div><FileText size={17} /><p><strong>Document output</strong>{currentAdvancedStep.documentType}<code>{currentAdvancedStep.documentNumber}</code></p></div>
                        </div>
                        <div className="advanced-postings">
                          <div className="panel-header"><div><span className="section-kicker">Accounting impact</span><h3>Journal evidence</h3></div></div>
                          {currentAdvancedStep.accountingEntries.length ? currentAdvancedStep.accountingEntries.map((entry, index) => (
                            <div key={`${entry.debit}-${index}`}><span>Dr</span><strong>{entry.debit}</strong><span>Cr</span><strong>{entry.credit}</strong><code>{entry.amount}</code><p>{entry.explanation}</p></div>
                          )) : <p>No general-ledger posting is expected at this step.</p>}
                        </div>
                        <div className="advanced-controls">
                          <span className="section-kicker">Before you post</span>
                          {currentAdvancedStep.controlChecks.map((check) => <p key={check}><ShieldCheck size={15} />{check}</p>)}
                        </div>
                        <div className="advanced-action">
                          <label htmlFor="advanced-note">Evidence note</label>
                          <textarea id="advanced-note" maxLength={500} value={advancedNote} onChange={(event) => setAdvancedNote(event.target.value)} placeholder="Record what you checked and the document evidence created..." />
                          <div><small>{advancedNote.trim().length}/500 characters</small><button className="primary-button" disabled={advancedLoading || advancedNote.trim().length < 5} onClick={() => void completeAdvancedStep()}>Complete step <ArrowRight size={15} /></button></div>
                        </div>
                      </article>
                    ) : (
                      <article className="completion-banner panel"><Award size={22} /><div><strong>Transaction completed</strong><span>Every step and evidence note is saved to your learner account.</span></div></article>
                    )}

                    <article className="advanced-audit panel">
                      <div className="panel-header"><div><span className="section-kicker">Learner evidence</span><h2>Practice audit trail</h2></div><strong>{selectedAdvancedTransaction.auditTrail.length} entries</strong></div>
                      {selectedAdvancedTransaction.auditTrail.map((entry) => (
                        <div key={`${entry.step}-${entry.completedAt}`}><span>{new Date(entry.completedAt).toLocaleString("en-GB")}</span><div><strong>Step {entry.step}: {entry.title}</strong><p>{entry.note}</p></div></div>
                      ))}
                      {!selectedAdvancedTransaction.auditTrail.length && <p className="no-journal">Complete the first step to create your evidence trail.</p>}
                    </article>
                  </div>
                )}
              </div>
            </section>
          )}

          {view === "tutor" && (
            <section className="tutor-page">
              <div className="page-heading compact">
                <div><p className="eyebrow">{tutorHeading} · {activeScenario.module}</p><h1>{tutorTitle}</h1><p>{tutorDescription}</p></div>
                <span className="lesson-count">{tutorBadge}</span>
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
                <button className={tutorMode === "implementation" ? "active" : ""} onClick={() => setTutorMode("implementation")}><Settings size={16} /><span><strong>Implementation blueprint</strong><small>Understand configuration and dependencies</small></span></button>
                <button className={tutorMode === "capstone" ? "active" : ""} onClick={() => setTutorMode("capstone")}><ClipboardCheck size={16} /><span><strong>Capstone assessment</strong><small>Prove readiness with evidence and impact</small></span></button>
              </div>
              <div className="tutor-readiness panel">
                <div className="tutor-readiness-summary">
                  <span className="section-kicker">Tutor readiness review</span>
                  <h2>
                    {tutorReadiness
                      ? `${tutorReadiness.overall.score}% · ${tutorReadiness.overall.level}`
                      : "Review loading"}
                  </h2>
                  <p>
                    {activeReadinessProcess
                      ? activeReadinessProcess.nextAction
                      : tutorReadinessError ||
                        "Preparing your saved progress, diagnostics, and next SAP practice actions."}
                  </p>
                  {tutorReadiness && (
                    <small>
                      {tutorReadiness.overall.completedLessons}/
                      {tutorReadiness.overall.processes} guided lessons and{" "}
                      {tutorReadiness.overall.completedDiagnostics}/
                      {tutorReadiness.overall.processes} diagnostics completed.
                    </small>
                  )}
                </div>
                {activeReadinessProcess && (
                  <div className="tutor-readiness-active">
                    <div>
                      <span>Active process</span>
                      <strong>{activeReadinessProcess.score}%</strong>
                      <small>{activeReadinessProcess.level}</small>
                    </div>
                    <p>
                      {activeReadinessProcess.completedStages}/
                      {activeReadinessProcess.totalStages} SAP stages completed
                    </p>
                    <p>{activeReadinessProcess.evidence[1]}</p>
                  </div>
                )}
                <div className="tutor-readiness-actions">
                  {(priorityReadinessProcesses.length
                    ? priorityReadinessProcesses
                    : tutorReadiness?.processes.slice(0, 3) ?? []
                  ).map((process) => (
                    <button
                      key={process.scenarioId}
                      onClick={() => {
                        setActiveScenarioId(process.scenarioId);
                        setTutorMode(
                          process.guidedProgress < 100
                            ? "guided"
                            : process.diagnosticProgress < 100
                              ? "troubleshoot"
                              : "capstone",
                        );
                      }}
                    >
                      <span>{process.processCode}</span>
                      <strong>{process.score}%</strong>
                      <small>{process.weakAreas[0] ?? process.nextAction}</small>
                    </button>
                  ))}
                </div>
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
                  <div className="playbook-panel">
                    <div className="playbook-heading">
                      <div>
                        <span className="section-kicker">SAP processing playbook</span>
                        <h3>{activePlaybook.title}</h3>
                        <p>{activePlaybook.businessTrigger}</p>
                      </div>
                      <code>{activePlaybook.sapEntry.transactionCode}</code>
                    </div>
                    <div className="playbook-grid">
                      <div>
                        <strong>Before you start</strong>
                        {activePlaybook.prerequisites.slice(0, 3).map((item) => (
                          <p key={item}><Check size={13} />{item}</p>
                        ))}
                      </div>
                      <div>
                        <strong>Current SAP area</strong>
                        <p><MapPin size={13} />{currentPlaybookStage.screenArea}</p>
                        <p><FileText size={13} />{currentPlaybookStage.app}</p>
                        <p><ShieldCheck size={13} />{currentPlaybookStage.validations[0]}</p>
                      </div>
                    </div>
                    {currentPlaybookStage.keyFields.length > 0 && (
                      <div className="playbook-fields">
                        {currentPlaybookStage.keyFields.map((field) => (
                          <div key={field.label}><span>{field.label}</span><strong>{field.value}</strong></div>
                        ))}
                      </div>
                    )}
                    <div className="playbook-checks">
                      <div>
                        <strong>Validation checks</strong>
                        {currentPlaybookStage.validations.map((validation) => (
                          <p key={validation}>{validation}</p>
                        ))}
                      </div>
                      <div>
                        <strong>Completion evidence</strong>
                        {activePlaybook.completionEvidence.slice(0, 4).map((evidence) => (
                          <p key={evidence}>{evidence}</p>
                        ))}
                      </div>
                    </div>
                    <details className="playbook-details">
                      <summary>Show document chain and common mistakes</summary>
                      <div>
                        <section>
                          <strong>Document chain</strong>
                          {activePlaybook.documentChain.map((document) => (
                            <p key={document}>{document}</p>
                          ))}
                        </section>
                        <section>
                          <strong>Common mistakes</strong>
                          {activePlaybook.commonErrors.map((error) => (
                            <p key={error.symptom}><b>{error.symptom}</b>{error.prevention} Correction: {error.correction}</p>
                          ))}
                        </section>
                      </div>
                    </details>
                  </div>
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
              ) : tutorMode === "troubleshoot" ? (
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
              ) : tutorMode === "implementation" ? (
                <div className="implementation-workspace">
                  <section className="implementation-summary panel">
                    <div className="implementation-role">
                      <span className="implementation-icon"><Settings size={20} /></span>
                      <div><span className="section-kicker">Consulting responsibility</span><h2>{implementationBlueprint.consultantRole}</h2><p>{implementationBlueprint.objective}</p></div>
                    </div>
                    <div className="implementation-counts">
                      <div><strong>{implementationBlueprint.organizationalUnits.length}</strong><span>Org dependencies</span></div>
                      <div><strong>{implementationBlueprint.masterData.length}</strong><span>Master-data groups</span></div>
                      <div><strong>{implementationBlueprint.configuration.length}</strong><span>Configuration controls</span></div>
                      <div><strong>{implementationBlueprint.validationTests.length}</strong><span>Validation tests</span></div>
                    </div>
                  </section>

                  <div className="implementation-foundation">
                    <article className="panel implementation-card">
                      <div className="diagnostic-heading"><Building2 size={19} /><div><span>Foundation 1</span><h2>Organizational structure</h2></div></div>
                      <p>These assignments determine legal ownership, process responsibility, and where transactions are executed.</p>
                      <div className="implementation-items">
                        {implementationBlueprint.organizationalUnits.map((item) => (
                          <div key={item.name}><span>{item.name}</span><strong>{item.example}</strong><p>{item.purpose}</p></div>
                        ))}
                      </div>
                    </article>

                    <article className="panel implementation-card">
                      <div className="diagnostic-heading"><Boxes size={19} /><div><span>Foundation 2</span><h2>Master-data dependencies</h2></div></div>
                      <p>Transactions work only when reusable enterprise records contain the required views, assignments, and control values.</p>
                      <div className="implementation-items">
                        {implementationBlueprint.masterData.map((item) => (
                          <div key={item.name}><span>{item.name}</span><strong>{item.example}</strong><p>{item.purpose}</p></div>
                        ))}
                      </div>
                    </article>
                  </div>

                  <article className="panel configuration-panel">
                    <div className="diagnostic-heading"><Settings size={19} /><div><span>Design decisions</span><h2>Configuration controls</h2></div></div>
                    <div className="configuration-table">
                      <div className="configuration-head"><span>Area</span><span>Implementation decision</span><span>Business effect</span><span>Owner</span></div>
                      {implementationBlueprint.configuration.map((control) => (
                        <div className="configuration-row" key={control.area}>
                          <strong>{control.area}</strong><p>{control.decision}</p><p>{control.businessEffect}</p><span>{control.owner}</span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel integration-panel">
                    <div className="diagnostic-heading"><ArrowRight size={19} /><div><span>Cross-module design</span><h2>Integration triggers</h2></div></div>
                    <div className="integration-flow">
                      {implementationBlueprint.integrations.map((integration) => (
                        <div key={`${integration.from}-${integration.to}`}>
                          <span className="integration-system">{integration.from}</span>
                          <div><small>{integration.trigger}</small><ArrowRight size={17} /></div>
                          <span className="integration-system">{integration.to}</span>
                          <p>{integration.result}</p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel validation-panel">
                    <div className="diagnostic-heading"><BookOpenCheck size={19} /><div><span>Prove the design</span><h2>Integration test evidence</h2></div></div>
                    <div className="validation-tests">
                      {implementationBlueprint.validationTests.map((test) => (
                        <div key={test.id}>
                          <code>{test.id}</code>
                          <div><strong>{test.test}</strong><p><span>Expected:</span> {test.expected}</p><small>Evidence: {test.evidence}</small></div>
                        </div>
                      ))}
                    </div>
                    <div className="go-live-controls">
                      <span className="section-kicker">Go-live controls</span>
                      <div>{implementationBlueprint.goLiveControls.map((control) => <span key={control}><Check size={13} />{control}</span>)}</div>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="capstone-workspace">
                  {activeCapstoneChallenge ? (
                    <>
                      <section className="capstone-brief panel">
                        <div>
                          <span className="section-kicker">SAP capstone challenge</span>
                          <h2>{activeCapstoneChallenge.title}</h2>
                          <p>{activeCapstoneChallenge.prompt}</p>
                        </div>
                        <div className="capstone-score">
                          <span>{activeCapstoneChallenge.status}</span>
                          <strong>{activeCapstoneChallenge.readinessScore}%</strong>
                          <small>Readiness evidence</small>
                        </div>
                      </section>
                      {tutorCapstone && (
                        <div className="capstone-portfolio panel">
                          <div><span>Portfolio submissions</span><strong>{tutorCapstone.submissions.total}</strong></div>
                          <div><span>Review-ready answers</span><strong>{tutorCapstone.submissions.reviewReady}</strong></div>
                          <div><span>Latest submission</span><strong>{tutorCapstone.submissions.latestSubmittedAt ? new Date(tutorCapstone.submissions.latestSubmittedAt).toLocaleDateString("en-GB") : "None"}</strong></div>
                        </div>
                      )}

                      <div className="capstone-grid">
                        <article className="panel capstone-card">
                          <div className="diagnostic-heading"><FileText size={19} /><div><span>Evidence pack</span><h2>What you must reference</h2></div></div>
                          {activeCapstoneChallenge.requiredEvidence.map((evidence) => (
                            <p key={evidence}><Check size={14} />{evidence}</p>
                          ))}
                        </article>

                        <article className="panel capstone-card">
                          <div className="diagnostic-heading"><ClipboardCheck size={19} /><div><span>Assessment tasks</span><h2>What you must explain</h2></div></div>
                          {activeCapstoneChallenge.tasks.map((task, index) => (
                            <p key={task}><span>{index + 1}</span>{task}</p>
                          ))}
                        </article>
                      </div>

                      <article className="panel capstone-rubric">
                        <div className="panel-header"><div><span className="section-kicker">Scoring guide</span><h2>Mentor review rubric</h2></div><strong>100 pts</strong></div>
                        {activeCapstoneChallenge.rubric.map((item) => (
                          <div key={item.area}>
                            <span>{item.points} pts</span>
                            <div><strong>{item.area}</strong><p>{item.expectation}</p></div>
                          </div>
                        ))}
                      </article>

                      <article className="panel capstone-remediation">
                        <div className="diagnostic-heading"><Sparkles size={19} /><div><span>Before submission</span><h2>Recommended preparation</h2></div></div>
                        {activeCapstoneChallenge.remediation.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </article>

                      <article className="panel capstone-submission">
                        <div className="diagnostic-heading"><Award size={19} /><div><span>Submit evidence</span><h2>Learner capstone response</h2></div></div>
                        {activeCapstoneChallenge.latestSubmission && (
                          <div className="capstone-latest">
                            <div><span>Latest score</span><strong>{activeCapstoneChallenge.latestSubmission.score}/100</strong><small>{activeCapstoneChallenge.latestSubmission.status}</small></div>
                            <p>Submitted {new Date(activeCapstoneChallenge.latestSubmission.submittedAt).toLocaleString("en-GB")}</p>
                            {activeCapstoneChallenge.latestSubmission.feedback.map((item) => <p key={item}>{item}</p>)}
                            <div className="capstone-rubric-scores">
                              {activeCapstoneChallenge.latestSubmission.rubricScores.map((score) => (
                                <div key={score.area}><span>{score.area}</span><strong>{score.awarded}/{score.points}</strong><small>{score.feedback}</small></div>
                              ))}
                            </div>
                          </div>
                        )}
                        <textarea
                          value={capstoneResponse}
                          onChange={(event) => setCapstoneResponse(event.target.value)}
                          maxLength={2000}
                          placeholder="Explain the SAP processing sequence, document evidence, inventory/accounting impact, and exception recovery..."
                        />
                        <div className="capstone-submit-row">
                          <small>{capstoneResponse.trim().length}/2,000 characters · minimum 80</small>
                          <button
                            className="primary-button"
                            disabled={
                              capstoneSubmitting ||
                              activeCapstoneChallenge.status === "Locked" ||
                              capstoneResponse.trim().length < 80
                            }
                            onClick={() => void submitCapstoneEvidence()}
                          >
                            Submit capstone evidence <ArrowRight size={15} />
                          </button>
                        </div>
                        {tutorCapstoneError && <p className="mentor-error">{tutorCapstoneError}</p>}
                      </article>
                    </>
                  ) : (
                    <article className="panel capstone-empty">
                      <ClipboardCheck size={24} />
                      <div><strong>Capstone assessment loading</strong><p>{tutorCapstoneError || "Preparing assessment evidence from your saved progress."}</p></div>
                    </article>
                  )}
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
            <div className="search-input-row"><Search size={20} /><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search code, material, plant, supplier, customer, or SAP document..." /><button onClick={() => setSearchOpen(false)}><X size={18} /></button></div>
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
                  if (result.target === "masterdata") {
                    setSelectedMaterialId(result.id);
                  }
                  if (
                    result.target === "workflows" &&
                    "workflowId" in result &&
                    typeof result.workflowId === "string"
                  ) {
                    setSelectedWorkflowId(result.workflowId);
                  }
                  if (
                    result.target === "analytics" &&
                    "driverId" in result &&
                    typeof result.driverId === "string" &&
                    "fiscalYear" in result &&
                    typeof result.fiscalYear === "string"
                  ) {
                    setSelectedDriverId(result.driverId);
                    setAnalyticsYear(result.fiscalYear as FiscalYear);
                  }
                  if (
                    result.target === "governance" &&
                    "governanceId" in result &&
                    typeof result.governanceId === "string"
                  ) {
                    setSelectedGovernanceId(result.governanceId);
                  }
                  if (
                    result.target === "advanced" &&
                    "advancedId" in result &&
                    typeof result.advancedId === "string"
                  ) {
                    setSelectedAdvancedId(result.advancedId);
                  }
                  if (
                    result.target === "industries" &&
                    "industryId" in result &&
                    typeof result.industryId === "string"
                  ) {
                    setSelectedIndustryBlueprintId(result.industryId as IndustryId);
                  }
                  if (
                    result.target === "studio" &&
                    "simulationId" in result &&
                    typeof result.simulationId === "string"
                  ) {
                    setSelectedSimulationId(result.simulationId);
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
            <div><strong>SAP Mentor</strong><span><i /> Grounded in simulation data</span></div>
            <button onClick={() => setMentorOpen(false)}><X size={19} /></button>
          </div>
          <div className="mentor-context"><Factory size={16} /> {activeEnterprise.enterprise} · {activeScenario.code}</div>
          <div className="mentor-body">
            <div className={mentorLoading ? "mentor-message loading" : "mentor-message"}>
              {mentorLoading ? "Reviewing the connected SAP records..." : answer}
            </div>
            {mentorError && <div className="mentor-error" role="alert">{mentorError}</div>}
            {mentorSources.length > 0 && (
              <div className="mentor-sources">
                <span>Evidence used</span>
                {mentorSources.map((source) => (
                  <div key={source.id}>
                    <span>{source.type}</span>
                    <strong>{source.title}</strong>
                    <code>{source.reference}</code>
                  </div>
                ))}
              </div>
            )}
            <p>Suggested questions</p>
            {mentorSuggestions[activeScenarioId].map((prompt) => <button disabled={mentorLoading} key={prompt} onClick={() => void askMentor(prompt)}>{prompt}<ChevronRight size={14} /></button>)}
          </div>
          <form className="mentor-input" onSubmit={(event) => { event.preventDefault(); void askMentor(question); }}>
            <input maxLength={500} disabled={mentorLoading} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this transaction..." />
            <button disabled={mentorLoading || question.trim().length < 3} type="submit" aria-label="Send question"><Send size={17} /></button>
          </form>
        </aside>
      )}
    </div>
  );
}
