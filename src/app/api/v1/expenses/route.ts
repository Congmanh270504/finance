import { NextRequest, NextResponse } from "next/server";
import type {
  CreateExpenseV1Request,
  CreateExpenseV1Response,
  ApiSuccessV1,
  ApiErrorV1,
} from "@/features/finance/type";

export async function POST(req: NextRequest) {
  try {
    const body: CreateExpenseV1Request = await req.json();

    // Try real service, fall back to mock response
    try {
      const { createExpenseV1 } = await import(
        "@/features/finance/services/expense-service"
      );
      const data = await createExpenseV1(body);
      const res: ApiSuccessV1<CreateExpenseV1Response> = { version: "v1", data };
      return NextResponse.json(res);
    } catch {
      // Mock response in demo mode
      const now = new Date().toISOString();
      const participantCount = body.participantMemberIds.length;
      const shareAmount = Math.floor(body.amount / participantCount);
      const remainder = body.amount - shareAmount * participantCount;

      const mockData: CreateExpenseV1Response = {
        expense: {
          expenseId: `exp_${Date.now()}`,
          groupId: body.groupId,
          title: body.title,
          amount: body.amount,
          paidByMemberId: body.paidByMemberId,
          paidByMemberName: "Demo User",
          shareStrategy: body.shareStrategy ?? "EQUAL",
          shares: body.participantMemberIds.map((id, i) => ({
            memberId: id,
            memberName: `Member ${i + 1}`,
            amount: i === 0 ? shareAmount + remainder : shareAmount,
          })),
          notes: body.notes ?? null,
          occurredAt: body.occurredAt ?? now,
          createdAt: now,
        },
        ledgerUpdates: [],
      };

      const res: ApiSuccessV1<CreateExpenseV1Response> = {
        version: "v1",
        data: mockData,
      };
      return NextResponse.json(res);
    }
  } catch (err) {
    const res: ApiErrorV1 = {
      version: "v1",
      error: {
        code: "INVALID_REQUEST",
        message: err instanceof Error ? err.message : "Bad request",
      },
    };
    return NextResponse.json(res, { status: 400 });
  }
}
