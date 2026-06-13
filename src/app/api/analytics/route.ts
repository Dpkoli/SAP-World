import { NextRequest, NextResponse } from "next/server";
import {
  analyticsMetrics,
  analyticsPeriods,
  driversForYear,
  periodsForYear,
  profitabilitySegments,
} from "@/data/analytics";
import { fiscalYearSummaries, type FiscalYear } from "@/data/history";

const fiscalYears = fiscalYearSummaries.map((summary) => summary.year);

export function GET(request: NextRequest) {
  const requestedYear = request.nextUrl.searchParams.get("year");
  const fiscalYear = fiscalYears.includes(requestedYear as FiscalYear)
    ? (requestedYear as FiscalYear)
    : null;

  return NextResponse.json(
    {
      fiscalYears,
      metrics: analyticsMetrics,
      periods: fiscalYear ? periodsForYear(fiscalYear) : analyticsPeriods,
      drivers: fiscalYear ? driversForYear(fiscalYear) : driversForYear("2025–2026"),
      profitability: profitabilitySegments.filter(
        (segment) => !fiscalYear || segment.fiscalYear === fiscalYear,
      ),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
