import type { InsightsChartsResponseV1 } from "@/features/finance/type";

export async function getInsightsChartsV1(_params: {
  groupId: string;
}): Promise<InsightsChartsResponseV1> {
  throw new Error("Service not implemented");
}
