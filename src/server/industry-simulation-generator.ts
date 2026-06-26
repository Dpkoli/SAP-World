import "server-only";

import { createHash } from "node:crypto";

import {
  simulationFiscalYears,
  simulationVolumeProfileFor,
  type GeneratedSimulation,
  type SimulationFiscalYear,
  type SimulationVolumeTier,
} from "@/data/generated-simulations";
import { industryBlueprintById } from "@/data/industry-blueprints";
import {
  industryById,
  type IndustryId,
} from "@/data/industries";

const industryCodes: Record<IndustryId, string> = {
  brewery: "BRW",
  pharmaceutical: "PHA",
  paint: "PNT",
  fmcg: "FMC",
  automotive: "AUT",
  retail: "RTL",
  logistics: "LOG",
  services: "SRV",
  hospital: "HSP",
  "oil-gas": "OAG",
};

const impactProfiles: Record<
  IndustryId,
  {
    baseExposure: number;
    operationalObject: string;
    inventoryImpact: string;
    debit: string;
    credit: string;
  }
> = {
  brewery: {
    baseExposure: 28400,
    operationalObject: "batch, process order, and customer allocation",
    inventoryImpact:
      "Affected batches are separated from unrestricted stock until quality and supply decisions are complete.",
    debit: "Production disruption and quality loss",
    credit: "Inventory provision / accrued recovery cost",
  },
  pharmaceutical: {
    baseExposure: 186000,
    operationalObject: "regulated batch, release record, and market allocation",
    inventoryImpact:
      "The regulated batch remains in quarantine and cannot satisfy market demand before quality authorization.",
    debit: "Deviation investigation and supply recovery expense",
    credit: "Batch inventory provision / accrued services",
  },
  paint: {
    baseExposure: 47800,
    operationalObject: "formula batch, quality result, and dealer commitment",
    inventoryImpact:
      "The batch is blocked by quality status while correction, rework, or replacement supply is assessed.",
    debit: "Formula correction and quality loss",
    credit: "Inventory provision / recovery accrual",
  },
  fmcg: {
    baseExposure: 63400,
    operationalObject: "SKU campaign, promotion allocation, and retail order",
    inventoryImpact:
      "Available-to-promise and FEFO allocation are recalculated to protect usable shelf life and priority customers.",
    debit: "Service recovery, waste, and promotion variance",
    credit: "Inventory provision / logistics accrual",
  },
  automotive: {
    baseExposure: 21900,
    operationalObject: "VIN or workshop order, parts reservation, and customer promise",
    inventoryImpact:
      "Reserved vehicles or parts remain controlled by status while transfer, repair, or commercial disposition is approved.",
    debit: "Workshop recovery and customer support expense",
    credit: "Parts inventory / warranty or service accrual",
  },
  retail: {
    baseExposure: 88200,
    operationalObject: "article-site allocation, promotion, and channel demand",
    inventoryImpact:
      "Article availability is reallocated across sites and channels, with unsuitable stock moved to markdown or blocked status.",
    debit: "Markdown, shrink, or fulfilment recovery expense",
    credit: "Merchandise inventory provision / accrued fulfilment cost",
  },
  logistics: {
    baseExposure: 35600,
    operationalObject: "freight order, warehouse wave, and customer service commitment",
    inventoryImpact:
      "Customer-owned stock remains traceable by handling unit while staging, custody, or route status is corrected.",
    debit: "Service failure and claims expense",
    credit: "Carrier settlement / claims provision",
  },
  services: {
    baseExposure: 52400,
    operationalObject: "project, resource assignment, and billing milestone",
    inventoryImpact:
      "There is no physical inventory movement; project capacity, work in progress, and unbilled value are reforecast.",
    debit: "Project recovery and margin variance",
    credit: "Accrued subcontract cost / WIP adjustment",
  },
  hospital: {
    baseExposure: 97200,
    operationalObject: "patient pathway, clinical schedule, and critical supply",
    inventoryImpact:
      "Clinical stock is allocated by patient-safety priority and affected batches or devices are blocked from use.",
    debit: "Clinical service recovery and emergency supply expense",
    credit: "Medical inventory / accrued clinical services",
  },
  "oil-gas": {
    baseExposure: 428000,
    operationalObject: "technical object, maintenance order, and production allocation",
    inventoryImpact:
      "Critical spares and hydrocarbon or project stock remain controlled by ownership, location, and operational status.",
    debit: "Production deferment and asset recovery expense",
    credit: "Maintenance accrual / inventory provision",
  },
};

function stableNumber(signature: string, offset: number, length = 8) {
  const numeric = Number.parseInt(signature.slice(offset, offset + 8), 16);
  return String(numeric % 10 ** length).padStart(length, "0");
}

function formatGbp(amount: number) {
  return `GBP ${amount.toLocaleString("en-GB")}`;
}

export function generateIndustrySimulation(input: {
  industryId: IndustryId;
  fiscalYear: SimulationFiscalYear;
  eventIndex: number;
  volumeTier?: SimulationVolumeTier;
  generatedAt?: string;
}): GeneratedSimulation {
  const industry = industryById(input.industryId);
  const blueprint = industryBlueprintById(input.industryId);
  const event = blueprint.commonProblems[input.eventIndex];

  if (!event) {
    throw new Error("Select a valid industry event.");
  }
  if (!simulationFiscalYears.includes(input.fiscalYear)) {
    throw new Error("Select a valid fiscal year.");
  }

  const volumeProfile = simulationVolumeProfileFor(input.volumeTier);
  const signature = createHash("sha256")
    .update(
      [
        "sap-world-v1",
        input.industryId,
        input.fiscalYear,
        input.eventIndex,
        event.issue,
        ...(volumeProfile.tier === "representative" ? [] : [volumeProfile.tier]),
      ].join("|"),
    )
    .digest("hex");
  const code = industryCodes[input.industryId];
  const yearCode = input.fiscalYear.replaceAll("-", "").slice(4);
  const scenarioId = [
    `SIM-${code}-${yearCode}-${String(input.eventIndex + 1).padStart(2, "0")}`,
    volumeProfile.tier === "representative"
      ? null
      : volumeProfile.tier.toUpperCase(),
  ]
    .filter(Boolean)
    .join("-");
  const profile = impactProfiles[input.industryId];
  const yearMultiplier =
    simulationFiscalYears.indexOf(input.fiscalYear) + 1;
  const exposure = Math.round(
    profile.baseExposure *
      yearMultiplier *
      (input.eventIndex + 1) *
      volumeProfile.exposureMultiplier,
  );
  const season =
    blueprint.seasonality[
      input.eventIndex % blueprint.seasonality.length
    ];
  const modules = Array.from(
    new Set([
      ...industry.modules.slice(0, 5),
      ...blueprint.valueChain.flatMap((stage) => stage.sap).slice(0, 4),
    ]),
  ).slice(0, 7);
  const dependency = blueprint.dependencies[
    input.eventIndex % blueprint.dependencies.length
  ];
  const kpis = blueprint.kpis.slice(0, 3).map((kpi, index) => ({
    name: kpi.name,
    target: kpi.target,
    scenarioEffect:
      index === 0
        ? `At risk because ${event.signal.toLowerCase()}.`
        : `Monitor during recovery against ${kpi.target}.`,
  }));

  return {
    id: scenarioId,
    signature,
    industryId: input.industryId,
    industry: industry.industry,
    enterprise: industry.enterprise,
    fiscalYear: input.fiscalYear,
    eventIndex: input.eventIndex,
    volumeTier: volumeProfile.tier,
    volumeProfile,
    title: event.issue,
    status: "Generated",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    operatingModel: industry.operatingModel,
    customerPromise: blueprint.customerPromise,
    businessContext: `${industry.enterprise} is operating its ${industry.operatingModel.toLowerCase()} model during ${input.fiscalYear}. ${season.behavior} The package uses the ${volumeProfile.label.toLowerCase()} volume profile with ${volumeProfile.processRunsPerYear} connected process run${volumeProfile.processRunsPerYear === 1 ? "" : "s"} per year.`,
    trigger: event.signal,
    rootCause: `${dependency.from} is no longer supporting ${dependency.to.toLowerCase()} as designed. ${dependency.logic}`,
    seasonality: season.period,
    planningResponse: season.planningResponse,
    modules,
    organization: blueprint.organizationalTemplate.slice(0, 5),
    masterData: blueprint.masterData.slice(0, 5),
    upstreamDependencies: [
      `${dependency.from} -> ${dependency.to}`,
      ...blueprint.dependencies
        .filter((item) => item !== dependency)
        .slice(0, 2)
        .map((item) => `${item.from} -> ${item.to}`),
    ],
    operationalImpact: `${event.signal}. The affected ${profile.operationalObject} must be controlled before normal execution resumes.`,
    inventoryImpact: profile.inventoryImpact,
    financialImpact: `${formatGbp(exposure)} of deterministic scenario exposure combines recovery work, service risk, and potential provision. It is a learning assumption derived from the industry profile, fiscal-year maturity, selected event severity, and ${volumeProfile.label.toLowerCase()} transaction scale.`,
    exposure: formatGbp(exposure),
    accountingEntries: [
      {
        debit: profile.debit,
        credit: profile.credit,
        amount: formatGbp(Math.round(exposure * 0.35)),
        explanation:
          "Illustrative controlled adjustment after evidence confirms the recoverable and non-recoverable portions.",
      },
    ],
    documents: [
      {
        sequence: 1,
        type: "Exception alert",
        number: `ALT-${code}-${stableNumber(signature, 0, 6)}`,
        module: "Analytics",
        purpose: "Records the operational signal and affected KPI.",
      },
      {
        sequence: 2,
        type: "Control case",
        number: `CTL-${code}-${stableNumber(signature, 4, 6)}`,
        module: modules.includes("QM") ? "QM" : "Workflow",
        purpose: "Freezes uncontrolled execution and assigns ownership.",
      },
      {
        sequence: 3,
        type: "Corrective order",
        number: `${code}-${stableNumber(signature, 8)}`,
        module: modules[0],
        purpose: "Authorizes the operational recovery plan.",
      },
      {
        sequence: 4,
        type: "Execution document",
        number: `EXE-${stableNumber(signature, 12)}`,
        module: modules[1] ?? modules[0],
        purpose: "Captures the actual corrective transaction and quantity.",
      },
      {
        sequence: 5,
        type: "Accounting document",
        number: `FI-${stableNumber(signature, 16, 10)}`,
        module: "FI/CO",
        purpose: "Records the approved financial consequence.",
      },
      {
        sequence: 6,
        type: "Closure evidence",
        number: `CLS-${code}-${stableNumber(signature, 20, 6)}`,
        module: "Analytics",
        purpose: "Confirms controls, KPI recovery, and learning feedback.",
      },
    ],
    steps: [
      {
        sequence: 1,
        title: "Validate the exception signal",
        role: "Process owner",
        app: "Situation Handling / Operational Analytics",
        instruction: `Review ${event.signal.toLowerCase()}, identify the affected ${profile.operationalObject}, and confirm the time and business scope.`,
        why: "A controlled response begins with evidence, not an assumed cause.",
        result: "The exception boundary and accountable owner are recorded.",
      },
      {
        sequence: 2,
        title: "Contain operational and compliance risk",
        role: "Control owner",
        app: "Manage Workflow and Object Status",
        instruction: `Apply the appropriate block, hold, reservation, or approval status while preserving traceability. Review ${blueprint.compliance[0].toLowerCase()}.`,
        why: "Containment prevents the exception from propagating into unsafe or incorrect downstream transactions.",
        result: "Affected execution is controlled without losing the audit trail.",
      },
      {
        sequence: 3,
        title: "Trace dependencies and root cause",
        role: "SAP functional analyst",
        app: "Document Flow and Master Data",
        instruction: `Trace ${dependency.from} through ${dependency.to.toLowerCase()}, then validate the relevant organizational assignments and master data.`,
        why: "The visible error often originates in an upstream planning, status, or master-data dependency.",
        result: `The scenario records the root-cause chain: ${dependency.from} -> ${dependency.to}.`,
      },
      {
        sequence: 4,
        title: "Execute the approved recovery",
        role: "Operations lead",
        app: "Manage Corrective Orders",
        instruction: event.sapResponse,
        why: "The recovery must update the real operational object rather than bypassing SAP controls.",
        result: "The corrective order and execution document restore a feasible process state.",
      },
      {
        sequence: 5,
        title: "Post inventory and financial consequences",
        role: "Financial controller",
        app: "Post General Journal Entries / Material Documents",
        instruction: `Review the inventory status and post only the evidenced portion of the ${formatGbp(exposure)} exposure.`,
        why: "Operational recovery and financial recognition must describe the same business event.",
        result: "Inventory, FI, and CO evidence reconcile to the recovery decision.",
      },
      {
        sequence: 6,
        title: "Close, monitor, and learn",
        role: "Process excellence lead",
        app: "Manage KPIs and Improvement Actions",
        instruction: `Confirm ${kpis.map((kpi) => kpi.name).join(", ")} are stable, close the control case, and feed the cause into planning and governance.`,
        why: "Closure is complete only when recurrence risk and performance recovery are visible.",
        result: "The event is auditable and its learning updates future enterprise behavior.",
      },
    ],
    controls: [
      `Protect the customer promise: ${blueprint.customerPromise}`,
      `Preserve the dependency chain ${dependency.from} -> ${dependency.to}.`,
      `Reconcile all six generated documents to signature ${signature.slice(0, 12)}.`,
      `Use the ${volumeProfile.label.toLowerCase()} volume profile to review ${volumeProfile.processRunsPerYear} process run${volumeProfile.processRunsPerYear === 1 ? "" : "s"} per year without randomizing transaction logic.`,
      `Review compliance evidence for ${blueprint.compliance.slice(0, 2).join(" and ")}.`,
      "Do not post the illustrative financial entry until operational evidence supports it.",
    ],
    kpis,
    history: simulationFiscalYears.map((fiscalYear, index) => ({
      fiscalYear,
      state:
        index < simulationFiscalYears.indexOf(input.fiscalYear)
          ? `The enterprise matured its ${blueprint.valueChain[index % blueprint.valueChain.length].stage.toLowerCase()} controls and increased process integration.`
          : index === simulationFiscalYears.indexOf(input.fiscalYear)
            ? `${event.issue} tests the current operating model and control design.`
            : `Future state uses the recovery evidence to improve ${season.planningResponse.toLowerCase()}`,
    })),
  };
}
