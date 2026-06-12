import { NextRequest, NextResponse } from "next/server";
import {
  batches,
  billsOfMaterial,
  materials,
  qualitySpecifications,
  routings,
  sourceRecords,
  workCenters,
} from "@/data/master-data";

export function GET(request: NextRequest) {
  const materialId = request.nextUrl.searchParams.get("material");
  const plant = request.nextUrl.searchParams.get("plant");
  const type = request.nextUrl.searchParams.get("type");

  const selectedMaterials = materials.filter(
    (material) =>
      (!materialId ||
        material.id.toLowerCase().includes(materialId.toLowerCase())) &&
      (!plant || material.plant === plant) &&
      (!type || material.type === type),
  );
  const selectedIds = new Set(selectedMaterials.map((material) => material.id));

  return NextResponse.json({
    filters: {
      material: materialId ?? "all",
      plant: plant ?? "all",
      type: type ?? "all",
    },
    totals: {
      materials: selectedMaterials.length,
      boms: billsOfMaterial.filter((bom) => selectedIds.has(bom.headerMaterialId)).length,
      routings: routings.filter((routing) => selectedIds.has(routing.materialId)).length,
      batches: batches.filter((batch) => selectedIds.has(batch.materialId)).length,
      specifications: qualitySpecifications.filter((specification) =>
        selectedIds.has(specification.materialId),
      ).length,
      sources: sourceRecords.filter((source) => selectedIds.has(source.materialId)).length,
    },
    materials: selectedMaterials,
    billsOfMaterial: billsOfMaterial.filter((bom) =>
      selectedIds.has(bom.headerMaterialId),
    ),
    routings: routings.filter((routing) => selectedIds.has(routing.materialId)),
    workCenters,
    batches: batches.filter((batch) => selectedIds.has(batch.materialId)),
    qualitySpecifications: qualitySpecifications.filter((specification) =>
      selectedIds.has(specification.materialId),
    ),
    sourceRecords: sourceRecords.filter((source) =>
      selectedIds.has(source.materialId),
    ),
  });
}
