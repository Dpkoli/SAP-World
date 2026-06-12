import { NextRequest, NextResponse } from "next/server";
import {
  enterpriseEvents,
  fiscalYearSummaries,
  getEventsForYear,
} from "@/data/history";

export function GET(request: NextRequest) {
  const year = request.nextUrl.searchParams.get("year") ?? undefined;
  const severity = request.nextUrl.searchParams.get("severity");
  const category = request.nextUrl.searchParams.get("category");

  let events = getEventsForYear(year);
  if (severity) {
    events = events.filter((event) => event.severity === severity);
  }
  if (category) {
    events = events.filter((event) => event.category === category);
  }

  return NextResponse.json({
    filters: { year: year ?? "all", severity: severity ?? "all", category: category ?? "all" },
    total: events.length,
    availableEvents: enterpriseEvents.length,
    fiscalYears: fiscalYearSummaries,
    events,
  });
}
