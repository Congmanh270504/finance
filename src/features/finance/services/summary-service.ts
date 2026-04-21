import type { BalancesSummaryResponseV1 } from "@/features/finance/type";

export async function getBalancesSummaryV1(_params: {
  groupId: string;
}): Promise<BalancesSummaryResponseV1> {
  throw new Error("Service not implemented");
}
