import "server-only";

import {
  businessPartners,
  employees,
  enterpriseUnits,
  plants,
} from "@/data/enterprise";
import {
  analyticsPeriods,
  performanceDrivers,
  profitabilitySegments,
} from "@/data/analytics";
import { documentFlows } from "@/data/document-flows";
import { advancedTransactionDefinitions } from "@/data/advanced-transactions";
import { industryBlueprints } from "@/data/industry-blueprints";
import { industryEnterprises } from "@/data/industries";
import { simulationFiscalYears } from "@/data/generated-simulations";
import { generateIndustrySimulation } from "@/server/industry-simulation-generator";
import {
  governanceAuditTrail,
  governanceDefinitions,
} from "@/data/governance";
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
import { workflowAuditTrail, workflowDefinitions } from "@/data/workflows";
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
import { transactionPlaybooks } from "@/data/transaction-playbooks";
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
  "approval", "approver", "authority", "audit", "release", "workflow",
  "analytics", "downtime", "margin", "performance", "profitability", "revenue",
  "service", "waste", "workingcapital",
  "change", "governance", "steward", "validation", "effective", "dependency",
  "asset", "capitalization", "depreciation", "return", "transfer", "tax", "vat",
  "yearend", "close", "transport", "scrap",
  "industry", "seasonality", "compliance", "supplychain", "operatingmodel",
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
  ...transactionPlaybooks.flatMap((playbook) => [
    {
      id: `playbook-${playbook.scenarioId}`,
      type: "Tutor" as const,
      title: `${playbook.title} transaction playbook`,
      reference: `${playbook.processCode} / ${playbook.sapEntry.transactionCode}`,
      scenarioId: playbook.scenarioId,
      content: [
        playbook.businessTrigger,
        playbook.sapEntry.fioriApp,
        ...playbook.prerequisites,
        ...playbook.processingRules,
        ...playbook.documentChain,
        ...playbook.completionEvidence,
        ...playbook.commonErrors.map(
          (error) =>
            `${error.symptom} ${error.prevention} ${error.correction}`,
        ),
      ].join(" "),
    },
    ...playbook.stages.map((stage) => ({
      id: `playbook-${playbook.scenarioId}-${stage.sequence}`,
      type: "Tutor" as const,
      title: `${playbook.title}: ${stage.title}`,
      reference: `${stage.transactionCode} stage ${stage.sequence}`,
      scenarioId: playbook.scenarioId,
      content: [
        stage.app,
        stage.screenArea,
        stage.action,
        stage.why,
        stage.expectedResult,
        ...stage.validations,
        ...stage.keyFields.map((field) => `${field.label} ${field.value}`),
      ].join(" "),
    })),
  ]),
  ...industryEnterprises.flatMap((industry) => {
    const blueprint = industryBlueprints.find(
      (item) => item.id === industry.id,
    )!;
    return simulationFiscalYears.flatMap((fiscalYear) =>
      blueprint.commonProblems.map((_, eventIndex) => {
        const simulation = generateIndustrySimulation({
          industryId: industry.id,
          fiscalYear,
          eventIndex,
          generatedAt: "2026-06-13T00:00:00.000Z",
        });
        return {
          id: `generated-${simulation.id}`,
          type: "Generated Simulation" as const,
          title: `${simulation.id}: ${simulation.title}`,
          reference: `${simulation.id} / ${simulation.signature.slice(0, 12)}`,
          content: [
            simulation.businessContext,
            simulation.trigger,
            simulation.rootCause,
            simulation.operationalImpact,
            simulation.inventoryImpact,
            simulation.financialImpact,
            simulation.exposure,
            ...simulation.documents.map(
              (document) =>
                `${document.type} ${document.number} ${document.module} ${document.purpose}`,
            ),
            ...simulation.steps.map(
              (step) =>
                `${step.sequence} ${step.title} ${step.role} ${step.app} ${step.instruction} ${step.why} ${step.result}`,
            ),
            ...simulation.controls,
          ].join(" "),
        };
      }),
    );
  }),
  ...industryBlueprints.map((blueprint) => {
    const industry = industryEnterprises.find(
      (item) => item.id === blueprint.id,
    )!;
    return {
      id: `industry-${blueprint.id}`,
      type: "Industry Blueprint" as const,
      title: `${industry.industry} operating blueprint`,
      reference: `${blueprint.id} / ${industry.enterprise}`,
      content: [
        industry.description,
        industry.operatingModel,
        industry.modules.join(" "),
        blueprint.customerPromise,
        blueprint.supplyChain,
        ...blueprint.procurementLifecycle,
        ...blueprint.productionLifecycle,
        ...blueprint.inventoryLifecycle,
        ...blueprint.financialStructure,
        ...blueprint.organizationalTemplate,
        ...blueprint.masterData,
        ...blueprint.valueChain.map(
          (stage) =>
            `${stage.stage} ${stage.activities} ${stage.sap.join(" ")}`,
        ),
        ...blueprint.kpis.map(
          (kpi) => `${kpi.name} target ${kpi.target} ${kpi.purpose}`,
        ),
        ...blueprint.compliance,
        ...blueprint.reporting,
        ...blueprint.dependencies.map(
          (dependency) =>
            `${dependency.from} to ${dependency.to} ${dependency.logic}`,
        ),
        ...blueprint.commonProblems.map(
          (problem) =>
            `${problem.issue} ${problem.signal} ${problem.sapResponse}`,
        ),
        ...blueprint.seasonality.map(
          (season) =>
            `${season.period} ${season.behavior} ${season.planningResponse}`,
        ),
      ].join(" "),
    };
  }),
  ...advancedTransactionDefinitions.flatMap((transaction) => [
    {
      id: `advanced-${transaction.id}`,
      type: "Advanced Transaction" as const,
      title: transaction.title,
      reference: `${transaction.id} / ${transaction.type}`,
      content: [
        transaction.scenario,
        transaction.businessTrigger,
        transaction.value,
        ...transaction.objectReferences,
        ...transaction.validations,
        ...transaction.steps.map(
          (step) =>
            `${step.sequence} ${step.title} ${step.role} ${step.app} ${step.transactionCode} ${step.instruction} ${step.why} ${step.result} ${step.documentType} ${step.documentNumber} ${step.inventoryImpact} ${step.controlChecks.join(" ")} ${step.accountingEntries.map((entry) => `${entry.debit} ${entry.credit} ${entry.amount} ${entry.explanation}`).join(" ")}`,
        ),
      ].join(" "),
    },
    ...transaction.steps.map((step) => ({
      id: `advanced-${transaction.id}-${step.sequence}`,
      type: "Advanced Transaction" as const,
      title: `${transaction.title}: ${step.title}`,
      reference: `${transaction.id} / ${step.transactionCode} / ${step.documentNumber}`,
      content: `${step.instruction} ${step.why} ${step.result} ${step.inventoryImpact} ${step.controlChecks.join(" ")} ${step.accountingEntries.map((entry) => `${entry.debit} ${entry.credit} ${entry.amount} ${entry.explanation}`).join(" ")}`,
    })),
  ]),
  ...analyticsPeriods.map((period) => ({
    id: `analytics-period-${period.id}`,
    type: "Analytics" as const,
    title: `${period.fiscalYear} ${period.quarter} performance`,
    reference: period.id,
    content: `revenue GBP ${period.revenueM} million volume ${period.volumeKhl} thousand hectolitres operating margin ${period.operatingMargin} percent service level ${period.serviceLevel} percent inventory ${period.inventoryDays} days downtime ${period.downtimeHours} hours waste ${period.wastePercent} percent working capital GBP ${period.workingCapitalM} million`,
  })),
  ...performanceDrivers.map((driver) => ({
    id: `analytics-driver-${driver.id}`,
    type: "Analytics" as const,
    title: driver.title,
    reference: `${driver.fiscalYear} / ${driver.id}`,
    content: `${driver.category} ${driver.direction} ${driver.financialImpact} ${driver.metricImpact} ${driver.explanation} ${driver.sapEvidence} ${driver.modules.join(" ")} ${driver.managementAction}`,
  })),
  ...profitabilitySegments.map((segment) => ({
    id: `analytics-profitability-${segment.id}`,
    type: "Analytics" as const,
    title: `${segment.name} profitability`,
    reference: `${segment.fiscalYear} / ${segment.dimension}`,
    content: `revenue GBP ${segment.revenueM} million contribution GBP ${segment.contributionM} million margin ${segment.marginPercent} percent volume share ${segment.volumeShare} percent ${segment.primaryDriver}`,
  })),
  ...governanceDefinitions.map((request) => ({
    id: `governance-${request.id}`,
    type: "Governance" as const,
    title: request.title,
    reference: `${request.id} / ${request.domain} ${request.objectId}`,
    content: [
      `status ${request.status}`,
      `effective ${request.effectiveDate}`,
      request.businessReason,
      request.governancePolicy,
      request.risk,
      ...request.fieldChanges.map(
        (change) =>
          `${change.field} changes from ${change.before} to ${change.after} ${change.rationale}`,
      ),
      ...request.validations.map(
        (validation) =>
          `${validation.status} ${validation.label} ${validation.evidence}`,
      ),
      ...request.dependencies.map(
        (dependency) =>
          `${dependency.object} ${dependency.relationship} ${dependency.impact}`,
      ),
      ...request.steps.map(
        (step) => `${step.role} ${step.assignee} ${step.status}`,
      ),
    ].join(" "),
  })),
  ...governanceAuditTrail.map((entry) => ({
    id: `governance-audit-${entry.id}`,
    type: "Governance" as const,
    title: `${entry.action}: ${entry.requestId}`,
    reference: `${entry.requestId} / ${entry.at}`,
    content: `${entry.actor} ${entry.actorRole} ${entry.action} ${entry.comment}`,
  })),
  ...workflowDefinitions.map((workflow) => ({
    id: `workflow-${workflow.id}`,
    type: "Workflow" as const,
    title: workflow.title,
    reference: `${workflow.id} / ${workflow.documentType} ${workflow.documentNumber}`,
    scenarioId: workflow.scenarioId,
    content: [
      `status ${workflow.status}`,
      `current approver ${workflow.steps.find((step) => step.status === "Current")?.role ?? "complete"}`,
      workflow.businessReason,
      workflow.policyRule,
      workflow.risk,
      workflow.blockingImpact,
      ...workflow.controlEvidence,
      ...workflow.steps.map((step) => `${step.sequence} ${step.role} ${step.assignee} ${step.status} ${step.decision ?? ""}`),
    ].join(" "),
  })),
  ...workflowAuditTrail.map((entry) => ({
    id: `workflow-audit-${entry.id}`,
    type: "Workflow" as const,
    title: `${entry.action}: ${entry.workflowId}`,
    reference: `${entry.workflowId} / ${entry.at}`,
    scenarioId: workflowDefinitions.find((workflow) => workflow.id === entry.workflowId)?.scenarioId,
    content: `${entry.actor} ${entry.actorRole} ${entry.action} ${entry.comment}`,
  })),
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
  const referencedWorkflow = workflowDefinitions.find(
    (workflow) =>
      normalizedQuestion.includes(workflow.id.toLowerCase()) ||
      normalizedQuestion.includes(workflow.documentNumber.toLowerCase()),
  );
  const referencedAdvancedTransaction = advancedTransactionDefinitions.find(
    (transaction) =>
      normalizedQuestion.includes(transaction.id.toLowerCase()) ||
      transaction.steps.some((transactionStep) =>
        normalizedQuestion.includes(
          transactionStep.documentNumber.toLowerCase(),
        ),
      ) ||
      tokens(transaction.title).filter((token) =>
        normalizedQuestion.includes(token),
      ).length >= 3,
  );
  const referencedIndustry = industryEnterprises.find(
    (industry) =>
      normalizedQuestion.includes(industry.id.toLowerCase()) ||
      normalizedQuestion.includes(industry.industry.toLowerCase()) ||
      normalizedQuestion.includes(industry.enterprise.toLowerCase()) ||
      tokens(industry.industry).filter((token) =>
        normalizedQuestion.includes(token),
      ).length >= Math.min(2, tokens(industry.industry).length),
  );
  const referencedGeneratedSimulation = industryEnterprises
    .flatMap((industry) =>
      simulationFiscalYears.flatMap((fiscalYear) =>
        industryBlueprints
          .find((blueprint) => blueprint.id === industry.id)!
          .commonProblems.map((_, eventIndex) =>
            generateIndustrySimulation({
              industryId: industry.id,
              fiscalYear,
              eventIndex,
              generatedAt: "2026-06-13T00:00:00.000Z",
            }),
          ),
        ),
    )
    .find(
      (simulation) =>
        normalizedQuestion.includes(simulation.id.toLowerCase()) ||
        normalizedQuestion.includes(simulation.signature.slice(0, 12)),
    );
  const referencedDriver = performanceDrivers.find(
    (driver) =>
      normalizedQuestion.includes(driver.id.toLowerCase()) ||
      tokens(driver.title).filter((token) => normalizedQuestion.includes(token))
        .length >= 3,
  );
  const referencedProfitability = profitabilitySegments.find(
    (segment) => normalizedQuestion.includes(segment.name.toLowerCase()),
  );
  const referencedGovernance = governanceDefinitions.find(
    (request) =>
      normalizedQuestion.includes(request.id.toLowerCase()) ||
      normalizedQuestion.includes(request.objectId.toLowerCase()) ||
      tokens(request.title).filter((token) => normalizedQuestion.includes(token))
        .length >= 3,
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
  } else if (referencedGeneratedSimulation) {
    answer = `${referencedGeneratedSimulation.id} simulates ${referencedGeneratedSimulation.title.toLowerCase()} at ${referencedGeneratedSimulation.enterprise}. ${referencedGeneratedSimulation.trigger} ${referencedGeneratedSimulation.rootCause} The deterministic exposure is ${referencedGeneratedSimulation.exposure}. Start by ${referencedGeneratedSimulation.steps[0].instruction.charAt(0).toLowerCase()}${referencedGeneratedSimulation.steps[0].instruction.slice(1)} The next controlled action is ${referencedGeneratedSimulation.steps[1].title.toLowerCase()}.`;
  } else if (referencedIndustry) {
    const blueprint = industryBlueprints.find(
      (item) => item.id === referencedIndustry.id,
    )!;
    const topKpis = blueprint.kpis
      .slice(0, 3)
      .map((kpi) => `${kpi.name} (${kpi.target})`)
      .join(", ");
    answer = `${referencedIndustry.enterprise} uses a ${referencedIndustry.operatingModel.toLowerCase()} model. ${blueprint.supplyChain} Its customer promise is to ${blueprint.customerPromise.charAt(0).toLowerCase()}${blueprint.customerPromise.slice(1)} Core SAP coverage is ${referencedIndustry.modules.join(", ")}, and leading KPIs include ${topKpis}.`;
  } else if (referencedAdvancedTransaction) {
    const requestedStep =
      referencedAdvancedTransaction.steps.find(
        (transactionStep) =>
          normalizedQuestion.includes(
            transactionStep.documentNumber.toLowerCase(),
          ) ||
          normalizedQuestion.includes(
            transactionStep.transactionCode.toLowerCase(),
          ),
      ) ?? referencedAdvancedTransaction.steps[0];
    const accounting = requestedStep.accountingEntries.length
      ? `The illustrative posting is ${requestedStep.accountingEntries.map((entry) => `debit ${entry.debit} and credit ${entry.credit} for ${entry.amount}`).join("; ")}.`
      : "No general-ledger posting is expected at this step.";
    answer = `${referencedAdvancedTransaction.id} teaches ${referencedAdvancedTransaction.title.toLowerCase()}. At step ${requestedStep.sequence}, use ${requestedStep.app} (${requestedStep.transactionCode}) to ${requestedStep.instruction.charAt(0).toLowerCase()}${requestedStep.instruction.slice(1)} ${requestedStep.result} ${requestedStep.inventoryImpact} ${accounting}`;
  } else if (referencedGovernance) {
    const failed = referencedGovernance.validations.filter(
      (validation) => validation.status === "Fail",
    );
    const currentOwner = referencedGovernance.steps.find(
      (governanceStep) => governanceStep.status === "Current",
    );
    answer = `${referencedGovernance.id} controls ${referencedGovernance.title.toLowerCase()} for ${referencedGovernance.objectId}. It is ${referencedGovernance.status.toLowerCase()}${currentOwner ? ` with ${currentOwner.role} (${currentOwner.assignee}) responsible for the current stage` : ""}. ${failed.length ? `It must not be approved because ${failed.map((validation) => validation.evidence).join(" ")}` : `The validation gate has no failed checks, but warnings and downstream dependencies still require review.`} ${referencedGovernance.risk}`;
  } else if (referencedDriver) {
    answer = `${referencedDriver.title}. ${referencedDriver.explanation} The measured effect was ${referencedDriver.metricImpact.toLowerCase()}, with ${referencedDriver.financialImpact.toLowerCase()}. In SAP, review ${referencedDriver.sapEvidence}.`;
  } else if (referencedProfitability) {
    answer = `${referencedProfitability.name} generated GBP ${referencedProfitability.revenueM.toFixed(1)}M revenue and GBP ${referencedProfitability.contributionM.toFixed(1)}M contribution in ${referencedProfitability.fiscalYear}, a ${referencedProfitability.marginPercent.toFixed(1)}% margin. The primary driver was ${referencedProfitability.primaryDriver.toLowerCase()}.`;
  } else if (referencedWorkflow) {
    const currentApprover = referencedWorkflow.steps.find(
      (workflowStep) => workflowStep.status === "Current",
    );
    answer = `${referencedWorkflow.documentType} ${referencedWorkflow.documentNumber} is ${referencedWorkflow.status.toLowerCase()} in ${referencedWorkflow.id}. ${currentApprover ? `${currentApprover.role} (${currentApprover.assignee}) must act next. ` : "The approval route is complete. "}${referencedWorkflow.policyRule} ${referencedWorkflow.blockingImpact}`;
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
      "profitability", "margin decreased", "margin decrease", "performance",
      "service level", "inventory days", "downtime", "working capital",
    ])
  ) {
    const negativeDriver = performanceDrivers.find(
      (driver) =>
        driver.fiscalYear === "2025–2026" && driver.direction === "Negative",
    )!;
    answer = `${negativeDriver.title}. ${negativeDriver.explanation} ${negativeDriver.metricImpact}. The connected SAP evidence is ${negativeDriver.sapEvidence}.`;
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
    referencedWorkflow ? `workflow-${referencedWorkflow.id}` : null,
    referencedDriver ? `analytics-driver-${referencedDriver.id}` : null,
    referencedProfitability
      ? `analytics-profitability-${referencedProfitability.id}`
      : null,
    referencedGovernance
      ? `governance-${referencedGovernance.id}`
      : null,
    referencedAdvancedTransaction
      ? `advanced-${referencedAdvancedTransaction.id}`
      : null,
    referencedIndustry ? `industry-${referencedIndustry.id}` : null,
    referencedGeneratedSimulation
      ? `generated-${referencedGeneratedSimulation.id}`
      : null,
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
