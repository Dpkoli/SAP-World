import { NextResponse } from "next/server";

import { getStorageHealth } from "@/server/durable-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const storage = await getStorageHealth();
    return NextResponse.json({
      status: "ok",
      service: "sap-world",
      storage,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "sap-world",
        storage: {
          backend: "postgresql",
          durable: true,
          configured: true,
          reachable: false,
        },
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
