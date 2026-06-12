import type { ScenarioId } from "@/data/progress";

export type MaterialType = "ROH" | "HALB" | "FERT" | "VERP" | "ERSA";

export type MaterialMaster = {
  id: string;
  description: string;
  type: MaterialType;
  baseUnit: string;
  materialGroup: string;
  plant: string;
  storageLocation: string;
  procurementType: "External" | "In-house";
  mrpType: string;
  lotSize: string;
  leadTimeDays: number;
  batchManaged: boolean;
  qualityInspection: boolean;
  valuationClass: string;
  standardPrice: string;
  profitCenter: string;
  supplierIds: string[];
  bomId?: string;
  routingId?: string;
  status: "Active" | "Blocked";
};

export type BomComponent = {
  materialId: string;
  quantity: number;
  unit: string;
  scrapPercent: number;
  operation: string;
  purpose: string;
};

export type BillOfMaterial = {
  id: string;
  headerMaterialId: string;
  plant: string;
  usage: string;
  alternative: string;
  baseQuantity: string;
  validFrom: string;
  status: "Released";
  components: BomComponent[];
};

export type RoutingOperation = {
  number: string;
  title: string;
  workCenterId: string;
  controlKey: string;
  duration: string;
  activityType: string;
  purpose: string;
};

export type Routing = {
  id: string;
  materialId: string;
  plant: string;
  productionVersion: string;
  validFrom: string;
  status: "Released";
  operations: RoutingOperation[];
};

export type WorkCenter = {
  id: string;
  name: string;
  plant: string;
  category: string;
  capacity: string;
  costCenter: string;
  activityTypes: string[];
  schedulingFormula: string;
  status: "Active";
};

export type BatchMaster = {
  id: string;
  materialId: string;
  supplierBatch?: string;
  plant: string;
  storageLocation: string;
  stockType: "Unrestricted" | "Quality inspection" | "Blocked";
  quantity: string;
  manufactureDate: string;
  expiryDate: string;
  status: "Available" | "Inspection" | "Blocked";
};

export type QualitySpecification = {
  id: string;
  materialId: string;
  inspectionType: string;
  characteristic: string;
  method: string;
  lowerLimit?: string;
  upperLimit?: string;
  target?: string;
  unit: string;
  critical: boolean;
};

export type SourceRecord = {
  id: string;
  materialId: string;
  supplierId: string;
  purchasingOrg: string;
  plant: string;
  orderUnit: string;
  price: string;
  plannedDeliveryDays: number;
  minimumOrder: string;
  qualityScore: number;
  status: "Approved" | "Conditional";
};

export type ScenarioMasterData = {
  scenarioId: ScenarioId;
  materialIds: string[];
  bomIds: string[];
  routingIds: string[];
  workCenterIds: string[];
  batchIds: string[];
  specificationIds: string[];
  sourceRecordIds: string[];
};

export const materials: MaterialMaster[] = [
  { id: "RM-MALT-PALE-01", description: "Pale Ale Malt", type: "ROH", baseUnit: "KG", materialGroup: "BREW-MALT", plant: "BR01", storageLocation: "RM01", procurementType: "External", mrpType: "PD", lotSize: "20,000 KG fixed lot", leadTimeDays: 14, batchManaged: true, qualityInspection: true, valuationClass: "3000", standardPrice: "GBP 0.74 / KG", profitCenter: "PC-BREW", supplierIds: ["1000012"], status: "Active" },
  { id: "RM-HOPS-CITRA-01", description: "Citra Hop Pellets T90", type: "ROH", baseUnit: "KG", materialGroup: "BREW-HOPS", plant: "BR01", storageLocation: "RM01", procurementType: "External", mrpType: "PD", lotSize: "500 KG minimum lot", leadTimeDays: 28, batchManaged: true, qualityInspection: true, valuationClass: "3000", standardPrice: "GBP 18.40 / KG", profitCenter: "PC-BREW", supplierIds: ["1000048"], status: "Active" },
  { id: "RM-YEAST-ALE-01", description: "Top-Fermenting Ale Yeast", type: "ROH", baseUnit: "KG", materialGroup: "BREW-YEAST", plant: "BR01", storageLocation: "RM01", procurementType: "External", mrpType: "PD", lotSize: "50 KG minimum lot", leadTimeDays: 7, batchManaged: true, qualityInspection: true, valuationClass: "3000", standardPrice: "GBP 9.20 / KG", profitCenter: "PC-BREW", supplierIds: ["1000048"], status: "Active" },
  { id: "SFG-AMBER-BULK-01", description: "Amber Ale Bulk Beer", type: "HALB", baseUnit: "HL", materialGroup: "BULK-BEER", plant: "BR01", storageLocation: "FG01", procurementType: "In-house", mrpType: "PD", lotSize: "500 HL fixed lot", leadTimeDays: 12, batchManaged: true, qualityInspection: true, valuationClass: "7900", standardPrice: "GBP 51.60 / HL", profitCenter: "PC-BREW", supplierIds: [], bomId: "BOM-AMBER-500HL", routingId: "RTG-AMBER-BREW", status: "Active" },
  { id: "FG-AMBER-KEG-50", description: "Amber Ale 50 Litre Keg", type: "FERT", baseUnit: "EA", materialGroup: "FG-KEG", plant: "BR01", storageLocation: "FG01", procurementType: "In-house", mrpType: "PD", lotSize: "1,000 EA fixed lot", leadTimeDays: 2, batchManaged: true, qualityInspection: false, valuationClass: "7920", standardPrice: "GBP 68.00 / EA", profitCenter: "PC-UK-ONTRADE", supplierIds: [], bomId: "BOM-AMBER-KEG", routingId: "RTG-KEG-PACK", status: "Active" },
  { id: "FG-IPA-KEG-50", description: "Session IPA 50 Litre Keg", type: "FERT", baseUnit: "EA", materialGroup: "FG-KEG", plant: "BR01", storageLocation: "FG01", procurementType: "In-house", mrpType: "PD", lotSize: "1,000 EA fixed lot", leadTimeDays: 2, batchManaged: true, qualityInspection: false, valuationClass: "7920", standardPrice: "GBP 72.50 / EA", profitCenter: "PC-UK-ONTRADE", supplierIds: [], status: "Active" },
  { id: "PKG-KEG-50-SS", description: "50 Litre Stainless Steel Keg", type: "VERP", baseUnit: "EA", materialGroup: "PACK-RETURN", plant: "BR01", storageLocation: "RM01", procurementType: "External", mrpType: "VB", lotSize: "Reorder point 600 EA", leadTimeDays: 21, batchManaged: false, qualityInspection: false, valuationClass: "3030", standardPrice: "GBP 94.00 / EA", profitCenter: "PC-BREW", supplierIds: ["1000031"], status: "Active" },
  { id: "SP-BRG-6312", description: "Pump Bearing 6312", type: "ERSA", baseUnit: "EA", materialGroup: "CRITICAL-SPARES", plant: "BR01", storageLocation: "RM01", procurementType: "External", mrpType: "VB", lotSize: "Reorder point 2 EA", leadTimeDays: 10, batchManaged: true, qualityInspection: true, valuationClass: "3040", standardPrice: "GBP 1,480 / EA", profitCenter: "PC-BREW", supplierIds: ["1000031"], status: "Active" },
];

export const billsOfMaterial: BillOfMaterial[] = [
  {
    id: "BOM-AMBER-500HL",
    headerMaterialId: "SFG-AMBER-BULK-01",
    plant: "BR01",
    usage: "Production",
    alternative: "01",
    baseQuantity: "500 HL",
    validFrom: "2025-07-01",
    status: "Released",
    components: [
      { materialId: "RM-MALT-PALE-01", quantity: 9250, unit: "KG", scrapPercent: 1.5, operation: "0020", purpose: "Fermentable extract and colour base" },
      { materialId: "RM-HOPS-CITRA-01", quantity: 185, unit: "KG", scrapPercent: 2, operation: "0030", purpose: "Bitterness and aroma addition" },
      { materialId: "RM-YEAST-ALE-01", quantity: 42, unit: "KG", scrapPercent: 0, operation: "0040", purpose: "Controlled fermentation culture" },
    ],
  },
  {
    id: "BOM-AMBER-KEG",
    headerMaterialId: "FG-AMBER-KEG-50",
    plant: "BR01",
    usage: "Production",
    alternative: "01",
    baseQuantity: "1,000 EA",
    validFrom: "2025-07-01",
    status: "Released",
    components: [
      { materialId: "SFG-AMBER-BULK-01", quantity: 500, unit: "HL", scrapPercent: 0.8, operation: "0010", purpose: "Bulk beer filling quantity" },
      { materialId: "PKG-KEG-50-SS", quantity: 1000, unit: "EA", scrapPercent: 0.2, operation: "0020", purpose: "Returnable customer packaging" },
    ],
  },
];

export const workCenters: WorkCenter[] = [
  { id: "BR01-MASH", name: "Mash House 2", plant: "BR01", category: "Machine", capacity: "20 hours/day", costCenter: "BR01-BREW", activityTypes: ["MACH", "ENERGY"], schedulingFormula: "Setup + machine time", status: "Active" },
  { id: "BR01-KETTLE", name: "Brew Kettle 2", plant: "BR01", category: "Machine", capacity: "18 hours/day", costCenter: "BR01-BREW", activityTypes: ["MACH", "STEAM"], schedulingFormula: "Machine time / base quantity", status: "Active" },
  { id: "BR01-FERM", name: "Fermentation Cellar A", plant: "BR01", category: "Process unit", capacity: "4,800 HL", costCenter: "BR01-BREW", activityTypes: ["TANK", "COOL"], schedulingFormula: "Calendar duration", status: "Active" },
  { id: "BR01-KEG", name: "Keg Line 1", plant: "BR01", category: "Production line", capacity: "420 kegs/hour", costCenter: "BR01-PACK", activityTypes: ["MACH", "LABR"], schedulingFormula: "Quantity / rate + setup", status: "Active" },
  { id: "BR01-LAB", name: "Quality Laboratory", plant: "BR01", category: "Labour", capacity: "24 tests/shift", costCenter: "BR01-QA", activityTypes: ["QLAB"], schedulingFormula: "Standard test time", status: "Active" },
  { id: "BR01-MECH", name: "Mechanical Workshop", plant: "BR01", category: "Maintenance labour", capacity: "64 hours/day", costCenter: "BR01-MAINT", activityTypes: ["MECH"], schedulingFormula: "Planned labour hours", status: "Active" },
];

export const routings: Routing[] = [
  {
    id: "RTG-AMBER-BREW",
    materialId: "SFG-AMBER-BULK-01",
    plant: "BR01",
    productionVersion: "PV01",
    validFrom: "2025-07-01",
    status: "Released",
    operations: [
      { number: "0010", title: "Mill malt", workCenterId: "BR01-MASH", controlKey: "PP01", duration: "2.0 HR", activityType: "MACH", purpose: "Prepare consistent grist for extraction" },
      { number: "0020", title: "Mash and lautering", workCenterId: "BR01-MASH", controlKey: "PP01", duration: "6.0 HR", activityType: "MACH", purpose: "Convert malt starch and separate wort" },
      { number: "0030", title: "Boil and hop addition", workCenterId: "BR01-KETTLE", controlKey: "PP01", duration: "3.5 HR", activityType: "STEAM", purpose: "Sterilize wort and establish bitterness and aroma" },
      { number: "0040", title: "Ferment and condition", workCenterId: "BR01-FERM", controlKey: "PP01", duration: "10 DAYS", activityType: "TANK", purpose: "Convert sugars and mature flavour profile" },
    ],
  },
  {
    id: "RTG-KEG-PACK",
    materialId: "FG-AMBER-KEG-50",
    plant: "BR01",
    productionVersion: "PV02",
    validFrom: "2025-07-01",
    status: "Released",
    operations: [
      { number: "0010", title: "Prepare and filter beer", workCenterId: "BR01-KEG", controlKey: "PP01", duration: "1.5 HR", activityType: "LABR", purpose: "Release conditioned beer to packaging" },
      { number: "0020", title: "Wash, fill, and seal kegs", workCenterId: "BR01-KEG", controlKey: "PP01", duration: "3.2 HR", activityType: "MACH", purpose: "Create saleable, traceable finished units" },
      { number: "0030", title: "Final packaging inspection", workCenterId: "BR01-LAB", controlKey: "QM01", duration: "0.8 HR", activityType: "QLAB", purpose: "Verify fill, seal, label, and release status" },
    ],
  },
];

export const batches: BatchMaster[] = [
  { id: "MALT-260611-A", materialId: "RM-MALT-PALE-01", supplierBatch: "HM-PA-061126", plant: "BR01", storageLocation: "QI01", stockType: "Quality inspection", quantity: "20,000 KG", manufactureDate: "2026-06-02", expiryDate: "2027-06-01", status: "Inspection" },
  { id: "MALT-260524-B", materialId: "RM-MALT-PALE-01", supplierBatch: "HM-PA-052426", plant: "BR01", storageLocation: "RM01", stockType: "Unrestricted", quantity: "31,600 KG", manufactureDate: "2026-05-15", expiryDate: "2027-05-14", status: "Available" },
  { id: "HOPS-260410-C", materialId: "RM-HOPS-CITRA-01", supplierBatch: "BC-CITRA-0410", plant: "BR01", storageLocation: "RM01", stockType: "Blocked", quantity: "210 KG", manufactureDate: "2026-04-10", expiryDate: "2028-04-09", status: "Blocked" },
  { id: "AMB-260601-07", materialId: "FG-AMBER-KEG-50", plant: "DC01", storageLocation: "FG01", stockType: "Unrestricted", quantity: "1,840 EA", manufactureDate: "2026-06-01", expiryDate: "2026-12-01", status: "Available" },
];

export const qualitySpecifications: QualitySpecification[] = [
  { id: "MIC-MALT-MOIST", materialId: "RM-MALT-PALE-01", inspectionType: "01", characteristic: "Moisture", method: "Oven dry method QP-014", upperLimit: "5.5", target: "4.8", unit: "%", critical: true },
  { id: "MIC-MALT-PROT", materialId: "RM-MALT-PALE-01", inspectionType: "01", characteristic: "Protein", method: "NIR method QP-021", lowerLimit: "9.5", upperLimit: "11.5", target: "10.5", unit: "%", critical: false },
  { id: "MIC-MALT-EXTR", materialId: "RM-MALT-PALE-01", inspectionType: "01", characteristic: "Extract", method: "Congress mash QP-033", lowerLimit: "80.5", target: "81.5", unit: "%", critical: true },
  { id: "MIC-KEG-FILL", materialId: "FG-AMBER-KEG-50", inspectionType: "04", characteristic: "Net fill volume", method: "Inline mass balance", lowerLimit: "49.85", upperLimit: "50.15", target: "50.00", unit: "L", critical: true },
  { id: "MIC-BRG-DIM", materialId: "SP-BRG-6312", inspectionType: "01", characteristic: "Bearing dimensional conformity", method: "Incoming dimensional check", target: "Drawing BRG-6312-R4", unit: "Pass/Fail", critical: true },
];

export const sourceRecords: SourceRecord[] = [
  { id: "PIR-1000012-MALT", materialId: "RM-MALT-PALE-01", supplierId: "1000012", purchasingOrg: "P100", plant: "BR01", orderUnit: "KG", price: "GBP 0.74 / KG", plannedDeliveryDays: 14, minimumOrder: "20,000 KG", qualityScore: 94, status: "Approved" },
  { id: "PIR-1000048-HOPS", materialId: "RM-HOPS-CITRA-01", supplierId: "1000048", purchasingOrg: "P100", plant: "BR01", orderUnit: "KG", price: "GBP 18.40 / KG", plannedDeliveryDays: 28, minimumOrder: "500 KG", qualityScore: 88, status: "Conditional" },
  { id: "PIR-1000048-YEAST", materialId: "RM-YEAST-ALE-01", supplierId: "1000048", purchasingOrg: "P100", plant: "BR01", orderUnit: "KG", price: "GBP 9.20 / KG", plannedDeliveryDays: 7, minimumOrder: "50 KG", qualityScore: 92, status: "Approved" },
  { id: "PIR-1000031-KEG", materialId: "PKG-KEG-50-SS", supplierId: "1000031", purchasingOrg: "P100", plant: "BR01", orderUnit: "EA", price: "GBP 94.00 / EA", plannedDeliveryDays: 21, minimumOrder: "200 EA", qualityScore: 91, status: "Approved" },
  { id: "PIR-1000031-BRG", materialId: "SP-BRG-6312", supplierId: "1000031", purchasingOrg: "P100", plant: "BR01", orderUnit: "EA", price: "GBP 1,480 / EA", plannedDeliveryDays: 10, minimumOrder: "1 EA", qualityScore: 90, status: "Approved" },
];

export const scenarioMasterData: ScenarioMasterData[] = [
  { scenarioId: "p2p", materialIds: ["RM-MALT-PALE-01"], bomIds: [], routingIds: [], workCenterIds: ["BR01-LAB"], batchIds: ["MALT-260611-A"], specificationIds: ["MIC-MALT-MOIST", "MIC-MALT-PROT", "MIC-MALT-EXTR"], sourceRecordIds: ["PIR-1000012-MALT"] },
  { scenarioId: "o2c", materialIds: ["FG-AMBER-KEG-50", "FG-IPA-KEG-50"], bomIds: ["BOM-AMBER-KEG"], routingIds: ["RTG-KEG-PACK"], workCenterIds: ["BR01-KEG"], batchIds: ["AMB-260601-07"], specificationIds: ["MIC-KEG-FILL"], sourceRecordIds: [] },
  { scenarioId: "ptp", materialIds: ["SFG-AMBER-BULK-01", "FG-AMBER-KEG-50", "RM-MALT-PALE-01", "RM-HOPS-CITRA-01", "RM-YEAST-ALE-01", "PKG-KEG-50-SS"], bomIds: ["BOM-AMBER-500HL", "BOM-AMBER-KEG"], routingIds: ["RTG-AMBER-BREW", "RTG-KEG-PACK"], workCenterIds: ["BR01-MASH", "BR01-KETTLE", "BR01-FERM", "BR01-KEG"], batchIds: ["MALT-260524-B", "HOPS-260410-C"], specificationIds: [], sourceRecordIds: ["PIR-1000012-MALT", "PIR-1000048-HOPS", "PIR-1000048-YEAST", "PIR-1000031-KEG"] },
  { scenarioId: "r2r", materialIds: ["RM-MALT-PALE-01", "SFG-AMBER-BULK-01", "FG-AMBER-KEG-50"], bomIds: [], routingIds: [], workCenterIds: ["BR01-MASH", "BR01-KEG"], batchIds: [], specificationIds: [], sourceRecordIds: [] },
  { scenarioId: "qm", materialIds: ["RM-MALT-PALE-01"], bomIds: [], routingIds: [], workCenterIds: ["BR01-LAB"], batchIds: ["MALT-260611-A"], specificationIds: ["MIC-MALT-MOIST", "MIC-MALT-PROT", "MIC-MALT-EXTR"], sourceRecordIds: ["PIR-1000012-MALT"] },
  { scenarioId: "pm", materialIds: ["SP-BRG-6312"], bomIds: [], routingIds: [], workCenterIds: ["BR01-MECH"], batchIds: [], specificationIds: ["MIC-BRG-DIM"], sourceRecordIds: ["PIR-1000031-BRG"] },
  { scenarioId: "h2r", materialIds: [], bomIds: [], routingIds: [], workCenterIds: ["BR01-LAB"], batchIds: [], specificationIds: [], sourceRecordIds: [] },
  { scenarioId: "w2d", materialIds: ["FG-AMBER-KEG-50", "FG-IPA-KEG-50"], bomIds: ["BOM-AMBER-KEG"], routingIds: [], workCenterIds: ["BR01-KEG"], batchIds: ["AMB-260601-07"], specificationIds: ["MIC-KEG-FILL"], sourceRecordIds: [] },
];

export function materialById(id: string) {
  return materials.find((material) => material.id === id);
}

export function masterDataForScenario(scenarioId: ScenarioId) {
  const links = scenarioMasterData.find((item) => item.scenarioId === scenarioId)!;
  return {
    links,
    materials: materials.filter((item) => links.materialIds.includes(item.id)),
    billsOfMaterial: billsOfMaterial.filter((item) => links.bomIds.includes(item.id)),
    routings: routings.filter((item) => links.routingIds.includes(item.id)),
    workCenters: workCenters.filter((item) => links.workCenterIds.includes(item.id)),
    batches: batches.filter((item) => links.batchIds.includes(item.id)),
    qualitySpecifications: qualitySpecifications.filter((item) =>
      links.specificationIds.includes(item.id),
    ),
    sourceRecords: sourceRecords.filter((item) =>
      links.sourceRecordIds.includes(item.id),
    ),
  };
}

function validateMasterData() {
  const materialIds = new Set(materials.map((item) => item.id));
  const workCenterIds = new Set(workCenters.map((item) => item.id));
  const objectGroups = [
    ["material", materials.map((item) => item.id)],
    ["BOM", billsOfMaterial.map((item) => item.id)],
    ["routing", routings.map((item) => item.id)],
    ["work centre", workCenters.map((item) => item.id)],
    ["batch", batches.map((item) => item.id)],
    ["specification", qualitySpecifications.map((item) => item.id)],
    ["source record", sourceRecords.map((item) => item.id)],
  ] as const;

  for (const [label, ids] of objectGroups) {
    if (new Set(ids).size !== ids.length) {
      throw new Error(`Duplicate ${label} ID in master data`);
    }
  }

  for (const bom of billsOfMaterial) {
    if (!materialIds.has(bom.headerMaterialId)) {
      throw new Error(`BOM ${bom.id} has unknown header ${bom.headerMaterialId}`);
    }
    for (const component of bom.components) {
      if (!materialIds.has(component.materialId)) {
        throw new Error(`BOM ${bom.id} has unknown component ${component.materialId}`);
      }
    }
  }

  for (const routing of routings) {
    if (!materialIds.has(routing.materialId)) {
      throw new Error(`Routing ${routing.id} has unknown material ${routing.materialId}`);
    }
    for (const operation of routing.operations) {
      if (!workCenterIds.has(operation.workCenterId)) {
        throw new Error(
          `Routing ${routing.id} has unknown work centre ${operation.workCenterId}`,
        );
      }
    }
  }

  for (const batch of batches) {
    if (!materialIds.has(batch.materialId)) {
      throw new Error(`Batch ${batch.id} has unknown material ${batch.materialId}`);
    }
  }
  for (const specification of qualitySpecifications) {
    if (!materialIds.has(specification.materialId)) {
      throw new Error(
        `Specification ${specification.id} has unknown material ${specification.materialId}`,
      );
    }
  }
  for (const source of sourceRecords) {
    if (!materialIds.has(source.materialId)) {
      throw new Error(
        `Source record ${source.id} has unknown material ${source.materialId}`,
      );
    }
  }
}

validateMasterData();
