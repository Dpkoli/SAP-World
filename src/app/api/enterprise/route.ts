import { NextResponse } from "next/server";
import { getEnterpriseSnapshot } from "@/server/simulation-service";

export function GET() {
  return NextResponse.json(getEnterpriseSnapshot(), {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
