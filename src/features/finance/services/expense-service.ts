import type {
  ExpenseHistoryResponseV1,
  CreateExpenseV1Request,
  CreateExpenseV1Response,
} from "@/features/finance/type";

export async function listExpenseHistoryV1(_params: {
  groupId: string;
  limit?: number;
}): Promise<ExpenseHistoryResponseV1> {
  throw new Error("Service not implemented");
}

export async function createExpenseV1(
  _body: CreateExpenseV1Request,
): Promise<CreateExpenseV1Response> {
  throw new Error("Service not implemented");
}
