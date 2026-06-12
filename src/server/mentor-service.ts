import "server-only";

import {
  businessPartners,
  employees,
  enterpriseUnits,
  plants,
} from "@/data/enterprise";
import { documentFlows } from "@/data/document-flows";
import {
  batches,
  billsOfMaterial,
  materials,
  qualitySpecifications,
  routings,
  sourceRecords,
  workCenters,
} from "@/data/master-data";
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
  "account", "accrual", "batch", "billing", "bom", "cost", "credit", "customer",
  "delivery", "dispatch", "freight", "goods", "gr", "grir", "handling",
  "inspection", "inventory", "invoice",
  "maintenance", "material", "mrp", "operation", "order", "payroll", "plant", "posting",
  "production", "purchase", "quality", "receipt", "sales", "settlement",
  "packing", "picking", "routing", "shipment", "specification", "stock",
  "supplier", "usage", "valuation", "vendor", "warehouse", "wave", "workcenter",
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
  ...documentFlows.flatMap((flow) =>
    flow.nodes.map((node) => ({
      id: `document-${flow.processId}-${node.id}`,
      type: "Process" as const,
      title: `${node.objectType}: ${node.label}`,
      reference: node.document,
      scenarioId: flow.processId,
      content: [
        node.purpose,
        `created by ${node.createdBy}`,
        `approval ${node.approval}`,
        `workflow ${node.workflowStatus}`,
        `upstream ${node.upstreamDocument ?? "business trigger"}`,
        `downstream ${node.downstreamDocument ?? "process complete"}`,
        `inventory ${node.inventoryImpact}`,
        `accounting ${node.accountingImpact}`,
        ...node.accountingEntries.map(
          (posting) =>
            `debit ${posting.debit} credit ${posting.credit} amount ${posting.amount} ${posting.explanation}`,
        ),
      ].join(" "),
    })),
  ),
  ...materials.map((material) => ({
    id: `material-${material.id}`,
    type: "Master Data" as const,
    title: material.description,
    reference: `Material ${material.id}`,
    content: `${material.type} base unit ${material.baseUnit} material group ${material.materialGroup} plant ${material.plant} storage location ${material.storageLocation} procurement ${material.procurementType} MRP ${material.mrpType} lot size ${material.lotSize} lead time ${material.leadTimeDays} days batch managed ${material.batchManaged} quality inspection ${material.qualityInspection} valuation class ${material.valuationClass} standard price ${material.standardPrice} profit centre ${material.profitCenter} suppliers ${material.supplierIds.join(" ")}`,
  })),
  ...billsOfMaterial.map((bom) => ({
    id: `bom-${bom.id}`,
    type: "Master Data" as const,
    title: `Bill of material ${bom.id}`,
    reference: `${bom.headerMaterialId} ${bom.baseQuantity}`,
    content: `${bom.plant} usage ${bom.usage} alternative ${bom.alternative} valid ${bom.validFrom} ${bom.components.map((component) => `${component.materialId} ${component.quantity} ${component.unit} scrap ${component.scrapPercent} operation ${component.operation} ${component.purpose}`).join(" ")}`,
  })),
  ...routings.map((routing) => ({
    id: `routing-${routing.id}`,
    type: "Master Data" as const,
    title: `Routing ${routing.id}`,
    reference: `${routing.materialId} ${routing.productionVersion}`,
    content: `${routing.plant} valid ${routing.validFrom} ${routing.operations.map((operation) => `${operation.number} ${operation.title} work centre ${operation.workCenterId} control key ${operation.controlKey} duration ${operation.duration} activity ${operation.activityType} ${operation.purpose}`).join(" ")}`,
  })),
  ...workCenters.map((workCenter) => ({
    id: `work-center-${workCenter.id}`,
    type: "Master Data" as const,
    title: workCenter.name,
    reference: `Work centre ${workCenter.id}`,
    content: `${workCenter.plant} ${workCenter.category} capacity ${workCenter.capacity} cost centre ${workCenter.costCenter} activities ${workCenter.activityTypes.join(" ")} scheduling ${workCenter.schedulingFormula}`,
  })),
  ...batches.map((batch) => ({
    id: `batch-${batch.id}`,
    type: "Master Data" as const,
    title: `Batch ${batch.id}`,
    reference: `Batch ${batch.id} / ${batch.materialId}`,
    content: `${batch.plant} ${batch.storageLocation} ${batch.stockType} quantity ${batch.quantity} manufacture ${batch.manufactureDate} expiry ${batch.expiryDate} supplier batch ${batch.supplierBatch ?? ""} status ${batch.status}`,
  })),
  ...qualitySpecifications.map((specification) => ({
    id: `specification-${specification.id}`,
    type: "Master Data" as const,
    title: `${specification.characteristic} specification`,
    reference: `${specification.materialId} ${specification.id}`,
    content: `inspection type ${specification.inspectionType} method ${specification.method} lower ${specification.lowerLimit ?? ""} upper ${specification.upperLimit ?? ""} target ${specification.target ?? ""} unit ${specification.unit} critical ${specification.critical}`,
  })),
  ...sourceRecords.map((source) => ({
    id: `source-${source.id}`,
    type: "Master Data" as const,
    title: `Purchasing source ${source.id}`,
    reference: `${source.materialId} supplier ${source.supplierId}`,
    content: `${source.purchasingOrg} plant ${source.plant} price ${source.price} delivery ${source.plannedDeliveryDays} days minimum ${source.minimumOrder} quality score ${source.qualityScore} status ${source.status}`,
  })),
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
  const referencedMaterial = materials.find(
    (material) =>
      normalizedQuestion.includes(material.id.toLowerCase()) ||
      normalizedQuestion.includes(material.description.toLowerCase()),
  );
  const referencedBom = billsOfMaterial.find((bom) =>
    normalizedQuestion.includes(bom.id.toLowerCase()),
  );
  const referencedRouting = routings.find((routing) =>
    normalizedQuestion.includes(routing.id.toLowerCase()),
  );
  const referencedBatch = batches.find((batch) =>
    normalizedQuestion.includes(batch.id.toLowerCase()),
  );
  const referencedWorkCenter = workCenters.find(
    (workCenter) =>
      normalizedQuestion.includes(workCenter.id.toLowerCase()) ||
      normalizedQuestion.includes(workCenter.name.toLowerCase()),
  );
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
  } else if (referencedMaterial) {
    answer = `${referencedMaterial.id} is ${referencedMaterial.description}, a ${referencedMaterial.type} material at ${referencedMaterial.plant}/${referencedMaterial.storageLocation}. It uses MRP type ${referencedMaterial.mrpType}, ${referencedMaterial.lotSize.toLowerCase()}, a ${referencedMaterial.leadTimeDays}-day lead time, valuation class ${referencedMaterial.valuationClass}, and standard price ${referencedMaterial.standardPrice}. Batch management is ${referencedMaterial.batchManaged ? "active" : "not active"} and quality inspection is ${referencedMaterial.qualityInspection ? "required" : "not required"}.`;
  } else if (referencedBom) {
    answer = `${referencedBom.id} is the released production BOM for ${referencedBom.headerMaterialId} at plant ${referencedBom.plant}, based on ${referencedBom.baseQuantity}. It contains ${referencedBom.components.map((component) => `${component.quantity.toLocaleString()} ${component.unit} of ${component.materialId} at operation ${component.operation}`).join("; ")}.`;
  } else if (referencedRouting) {
    answer = `${referencedRouting.id} is production version ${referencedRouting.productionVersion} for ${referencedRouting.materialId}. Its sequence is ${referencedRouting.operations.map((operation) => `${operation.number} ${operation.title} at ${operation.workCenterId} (${operation.duration})`).join("; ")}.`;
  } else if (referencedBatch) {
    answer = `${referencedBatch.id} is a batch of ${referencedBatch.materialId} holding ${referencedBatch.quantity} in ${referencedBatch.stockType.toLowerCase()} at ${referencedBatch.plant}/${referencedBatch.storageLocation}. Its status is ${referencedBatch.status.toLowerCase()}, with manufacture date ${referencedBatch.manufactureDate} and expiry date ${referencedBatch.expiryDate}.`;
  } else if (referencedWorkCenter) {
    answer = `${referencedWorkCenter.id} is ${referencedWorkCenter.name} at plant ${referencedWorkCenter.plant}. Capacity is ${referencedWorkCenter.capacity}, cost posts to ${referencedWorkCenter.costCenter}, and its activity types are ${referencedWorkCenter.activityTypes.join(", ")}. Scheduling uses ${referencedWorkCenter.schedulingFormula.toLowerCase()}.`;
  } else if (
    includesAny(normalizedQuestion, [
      "bom", "bill of material", "routing", "production version", "work centre",
      "work center", "valuation class", "standard price", "source record",
      "quality specification", "master data", "lead time", "lot size",
    ]) &&
    retrieved[0]?.type === "Master Data"
  ) {
    const best = retrieved[0];
    answer = `${best.title}: ${best.content}`;
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
  const directReferenceIds = [
    referencedMaterial ? `material-${referencedMaterial.id}` : null,
    referencedBom ? `bom-${referencedBom.id}` : null,
    referencedRouting ? `routing-${referencedRouting.id}` : null,
    referencedBatch ? `batch-${referencedBatch.id}` : null,
    referencedWorkCenter ? `work-center-${referencedWorkCenter.id}` : null,
  ].filter((id): id is string => Boolean(id));
  const directReferences = mentorDocuments.filter((document) =>
    directReferenceIds.includes(document.id),
  );
  const sources = [...directReferences, ...retrieved, ...fallbackSources]
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
