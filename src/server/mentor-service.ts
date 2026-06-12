import "server-only";

import {
  businessPartners,
  employees,
  enterpriseUnits,
  plants,
} from "@/data/enterprise";
import { enterpriseEvents } from "@/data/history";
import {
  mentorSuggestions,
  type MentorResponse,
  type MentorSource,
} from "@/data/mentor";
import { isScenarioId, type ScenarioId } from "@/data/progress";
import {
  mentorAnswers,
  processScenarios,
  type ProcessScenario,
} from "@/data/simulation";
import { troubleshootingCaseFor } from "@/data/troubleshooting";

type MentorDocument = MentorSource & {
  content: string;
  scenarioId?: ScenarioId;
};

const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "did", "do", "does",
  "for", "from", "how", "i", "in", "is", "it", "of", "on", "or", "the",
  "this", "to", "was", "what", "when", "where", "why", "with", "would",
]);
const sapDomainTerms = new Set([
  "account", "accrual", "batch", "billing", "cost", "credit", "customer",
  "delivery", "dispatch", "freight", "goods", "gr", "grir", "handling",
  "inspection", "inventory", "invoice",
  "maintenance", "material", "mrp", "order", "payroll", "plant", "posting",
  "production", "purchase", "quality", "receipt", "sales", "settlement",
  "packing", "picking", "shipment", "stock", "supplier", "usage", "vendor",
  "warehouse", "wave",
]);

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function scenarioDocuments(scenario: ProcessScenario): MentorDocument[] {
  const exception = troubleshootingCaseFor(scenario.id);
  return [
    {
      id: `process-${scenario.id}`,
      type: "Process",
      title: scenario.title,
      reference: scenario.code,
      scenarioId: scenario.id,
      content: [
        scenario.scenario,
        scenario.party,
        scenario.value,
        ...scenario.steps.map(
          (step) =>
            `${step.label} ${step.document} ${step.module} ${step.status}`,
        ),
        ...scenario.impacts.map(
          (impact) => `${impact.label} ${impact.title} ${impact.description}`,
        ),
      ].join(" "),
    },
    ...scenario.tutorSteps.map((step) => ({
      id: `tutor-${scenario.id}-${step.number}`,
      type: "Tutor" as const,
      title: step.title,
      reference: `${scenario.transactionCode} step ${step.number}`,
      scenarioId: scenario.id,
      content: `${step.instruction} ${step.why} ${step.result} ${(step.fields ?? []).map((field) => `${field.label} ${field.value}`).join(" ")}`,
    })),
    {
      id: `exception-${exception.id}`,
      type: "Exception",
      title: exception.title,
      reference: exception.id,
      scenarioId: scenario.id,
      content: [
        exception.symptom,
        exception.businessContext,
        exception.explanation,
        ...exception.evidence.map(
          (evidence) => `${evidence.source} ${evidence.finding}`,
        ),
        ...exception.recoverySteps.map(
          (step) => `${step.action} ${step.sap} ${step.why}`,
        ),
        exception.impact.operational,
        exception.impact.inventory,
        exception.impact.financial,
        exception.prevention,
      ].join(" "),
    },
  ];
}

const mentorDocuments: MentorDocument[] = [
  ...processScenarios.flatMap(scenarioDocuments),
  ...enterpriseEvents.map((event) => ({
    id: event.id,
    type: "History" as const,
    title: event.title,
    reference: `${event.date} · ${event.id}`,
    content: [
      event.summary,
      event.businessCause,
      event.operationalImpact,
      event.inventoryImpact,
      event.financialImpact,
      event.resolution,
      event.modules.join(" "),
      event.documents.map((document) => `${document.type} ${document.number}`).join(" "),
    ].join(" "),
  })),
  ...businessPartners.map((partner) => ({
    id: `partner-${partner.id}`,
    type: "Enterprise" as const,
    title: partner.name,
    reference: `${partner.category} ${partner.id}`,
    content: `${partner.role} ${partner.country} ${partner.city} annual value ${partner.annualValue} open items ${partner.openItems} risk ${partner.risk} status ${partner.status}`,
  })),
  ...plants.map((plant) => ({
    id: `plant-${plant.code}`,
    type: "Enterprise" as const,
    title: plant.name,
    reference: `Plant ${plant.code}`,
    content: `${plant.location} ${plant.role} capacity ${plant.capacity} utilization ${plant.utilization} employees ${plant.employees} active orders ${plant.activeOrders} ${plant.status}`,
  })),
  ...employees.map((employee) => ({
    id: `employee-${employee.id}`,
    type: "Enterprise" as const,
    title: employee.name,
    reference: `Employee ${employee.id}`,
    content: `${employee.position} ${employee.department} plant ${employee.plant} cost centre ${employee.costCenter} manager ${employee.manager} hire date ${employee.hireDate} ${employee.employmentStatus}`,
  })),
  ...enterpriseUnits.map((unit) => ({
    id: `unit-${unit.code}`,
    type: "Enterprise" as const,
    title: unit.name,
    reference: `${unit.type} ${unit.code}`,
    content: `${unit.parent ?? ""} ${unit.location ?? ""} ${unit.currency ?? ""} ${unit.status}`,
  })),
];

function retrieve(question: string, scenarioId: ScenarioId) {
  const queryTokens = tokens(question);
  const questionLower = question.toLowerCase();
  return mentorDocuments
    .map((document) => {
      const haystack = tokens(
        `${document.title} ${document.reference} ${document.content}`,
      );
      const haystackSet = new Set(haystack);
      const matches = queryTokens.reduce(
        (score, token) => score + (haystackSet.has(token) ? 3 : 0),
        0,
      );
      const referenceTokens = tokens(document.reference).filter(
        (token) => token.length >= 4,
      );
      const identifierMatch = referenceTokens.some((token) =>
        questionLower.includes(token),
      );
      const titleTerms = tokens(document.title);
      const titleMatch =
        titleTerms.length > 0 &&
        titleTerms.filter((term) => questionLower.includes(term)).length >=
          Math.min(2, titleTerms.length);
      const exactEntityBoost =
        titleMatch || identifierMatch
          ? 12
          : 0;
      const phraseBoost =
        document.content.toLowerCase().includes(questionLower) ? 8 : 0;
      const scenarioBoost = document.scenarioId === scenarioId ? 4 : 0;
      const domainMatch = queryTokens.some((token) => sapDomainTerms.has(token));
      return {
        document,
        matched:
          exactEntityBoost > 0 ||
          phraseBoost > 0 ||
          matches >= 6 ||
          (matches >= 3 && domainMatch),
        score:
          matches + exactEntityBoost + phraseBoost + scenarioBoost,
      };
    })
    .filter((result) => result.matched)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((result) => result.document);
}

function includesAny(question: string, terms: string[]) {
  return terms.some((term) => question.includes(term));
}

function source(document: MentorDocument): MentorSource {
  return {
    id: document.id,
    type: document.type,
    title: document.title,
    reference: document.reference,
  };
}

export function answerMentorQuestion(input: {
  question: string;
  scenarioId: unknown;
  step?: unknown;
}): MentorResponse {
  const scenarioId = isScenarioId(input.scenarioId) ? input.scenarioId : "p2p";
  const scenario = processScenarios.find((item) => item.id === scenarioId)!;
  const exception = troubleshootingCaseFor(scenarioId);
  const question = input.question.trim();
  const normalizedQuestion = question.toLowerCase();
  const exactAnswer = Object.entries(mentorAnswers).find(
    ([prompt]) => prompt.toLowerCase() === normalizedQuestion,
  )?.[1];
  const retrieved = retrieve(question, scenarioId);
  const step =
    typeof input.step === "number" && Number.isFinite(input.step)
      ? Math.min(
          Math.max(Math.trunc(input.step), 0),
          scenario.tutorSteps.length - 1,
        )
      : 0;

  let answer: string;
  if (exactAnswer) {
    answer = exactAnswer;
  } else if (
    includesAny(normalizedQuestion, [
      "error", "fail", "blocked", "problem", "issue", "shortage", "fix",
      "troubleshoot", "root cause",
    ])
  ) {
    answer = `${exception.explanation} First verify ${exception.evidence[0].source.toLowerCase()}: ${exception.evidence[0].finding} Then ${exception.recoverySteps[0].action.toLowerCase()} in ${exception.recoverySteps[0].sap}. ${exception.recoverySteps[0].why}`;
  } else if (
    includesAny(normalizedQuestion, [
      "account", "financial", "finance", "debit", "credit", "cost", "value",
      "posting", "profit",
    ])
  ) {
    const financialImpact =
      scenario.impacts.find((impact) =>
        impact.label.toLowerCase().includes("account"),
      ) ?? scenario.impacts.find((impact) =>
        impact.label.toLowerCase().includes("financial"),
      );
    answer = financialImpact
      ? `${financialImpact.title}. ${financialImpact.description}`
      : `${scenario.title} connects operational documents to FI and CO according to the posting point in the process. ${scenario.tutorSteps[step].result}`;
  } else if (
    includesAny(normalizedQuestion, [
      "inventory", "stock", "quantity", "material", "warehouse",
    ])
  ) {
    const inventoryImpact = scenario.impacts.find((impact) =>
      impact.label.toLowerCase().includes("inventory"),
    );
    answer = inventoryImpact
      ? `${inventoryImpact.title}. ${inventoryImpact.description}`
      : scenario.tutorSteps[step].result;
  } else if (
    includesAny(normalizedQuestion, ["next", "after", "then"])
  ) {
    const nextStep =
      scenario.tutorSteps[Math.min(step + 1, scenario.tutorSteps.length - 1)];
    answer =
      nextStep.number === scenario.tutorSteps[step].number
        ? `This is the final guided step. ${scenario.knowledgeCheck.explanation}`
        : `Next, ${nextStep.title.toLowerCase()}. ${nextStep.instruction} This matters because ${nextStep.why.toLowerCase()}`;
  } else if (retrieved.length > 0) {
    const best = retrieved[0];
    answer = `${best.title}: ${best.content.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}`;
  } else {
    answer = `I could not find enough simulation evidence to answer that precisely. Ask about ${scenario.title}, document ${scenario.code}, its inventory or accounting impact, or the active troubleshooting case ${exception.id}.`;
  }

  const fallbackSources = mentorDocuments.filter(
    (document) =>
      document.scenarioId === scenarioId &&
      (document.type === "Process" || document.type === "Exception"),
  );
  const sources = [...retrieved, ...fallbackSources]
    .filter(
      (document, index, all) =>
        all.findIndex((candidate) => candidate.id === document.id) === index,
    )
    .slice(0, 3)
    .map(source);

  return {
    answer,
    sources,
    suggestions: mentorSuggestions[scenarioId],
    grounded: true,
  };
}
