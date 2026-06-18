import { NextResponse } from "next/server";

import { getMentorProviderStatus } from "@/server/mentor-provider";
import { getStorageHealth } from "@/server/durable-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const storage = await getStorageHealth();
    return NextResponse.json({
      status: "ok",
      service: "sap-world",
      storage,
      mentor: getMentorProviderStatus(),
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
        mentor: getMentorProviderStatus(),
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
