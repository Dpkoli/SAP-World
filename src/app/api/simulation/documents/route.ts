import { NextRequest, NextResponse } from "next/server";
import { documentFlows } from "@/data/document-flows";
import { isScenarioId } from "@/data/progress";

export function GET(request: NextRequest) {
  const processId = request.nextUrl.searchParams.get("process");
  const documentNumber = request.nextUrl.searchParams.get("document");
  const moduleName = request.nextUrl.searchParams.get("module");

  const flows = documentFlows
    .filter((flow) => !processId || (isScenarioId(processId) && flow.processId === processId))
    .map((flow) => ({
      ...flow,
      nodes: flow.nodes.filter(
        (node) =>
          (!documentNumber ||
            node.document.toLowerCase().includes(documentNumber.toLowerCase())) &&
          (!moduleName ||
            node.module.toLowerCase().includes(moduleName.toLowerCase())),
      ),
    }))
    .filter((flow) => flow.nodes.length > 0);

  return NextResponse.json({
    filters: {
      process: processId ?? "all",
      document: documentNumber ?? "all",
      module: moduleName ?? "all",
    },
    totalFlows: flows.length,
    totalDocuments: flows.reduce((sum, flow) => sum + flow.nodes.length, 0),
    availableProcesses: documentFlows.map((flow) => flow.processId),
    flows,
  });
}
