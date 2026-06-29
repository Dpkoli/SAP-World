export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  console.log(
    JSON.stringify({
      level: "info",
      message: "SAP World server runtime initialized.",
      service: "sap-world",
      environment:
        process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    }),
  );
}
