import { NextRequest, NextResponse } from "next/server";
import { industryBlueprints } from "@/data/industry-blueprints";
import {
  industryPracticeCoverage,
  industryPracticePack,
} from "@/data/industry-practice-data";
import {
  industryEnterprises,
  isIndustryId,
} from "@/data/industries";

export function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const moduleFilter = request.nextUrl.searchParams.get("module");
  const industries = industryEnterprises
    .filter((industry) => !id || (isIndustryId(id) && industry.id === id))
    .filter(
      (industry) =>
        !moduleFilter ||
        industry.modules.some(
          (module) => module.toLowerCase() === moduleFilter.toLowerCase(),
        ),
    )
    .map((industry) => ({
      ...industry,
      blueprint: industryBlueprints.find(
        (blueprint) => blueprint.id === industry.id,
      ),
      practiceCoverage: industryPracticeCoverage.find(
        (coverage) => coverage.industryId === industry.id,
      ),
      practicePack: id && isIndustryId(id)
        ? industryPracticePack(industry.id)
        : undefined,
    }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      total: industries.length,
      live: industries.filter((enterprise) => enterprise.status === "live").length,
      planned: industries.filter((enterprise) => enterprise.status === "planned").length,
      blueprintCoverage: industries.filter((enterprise) => enterprise.blueprint)
        .length,
      practiceDataCoverage: industries.filter(
        (enterprise) => enterprise.practiceCoverage?.monthlyRecords === 36,
      ).length,
    },
    industries,
  });
}
