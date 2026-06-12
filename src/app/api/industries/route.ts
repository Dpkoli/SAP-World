import { NextResponse } from "next/server";
import { industryEnterprises } from "@/data/industries";

export function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      total: industryEnterprises.length,
      live: industryEnterprises.filter((enterprise) => enterprise.status === "live").length,
      planned: industryEnterprises.filter((enterprise) => enterprise.status === "planned").length,
    },
    industries: industryEnterprises,
  });
}
