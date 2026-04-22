"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { financeV1Fixtures } from "@/features/finance/mock-fixtures";
import {
    expenseDeleteSchema,
    expenseListQuerySchema,
} from "@/features/expense/schema";
import type {
    ExpenseActionResponse,
    ExpenseListParams,
    ExpenseListResult,
    ExpenseParticipant,
    ExpenseRow,
} from "@/features/expense/types";
import prisma from "@/lib/prisma";

const expenseInclude = {
    paidBy: {
        select: {
            name: true,
        },
    },
    splitShares: {
        include: {
            member: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    },
} satisfies Prisma.ExpenseInclude;

type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
    include: typeof expenseInclude;
}>;

function mapExpenseRow(expense: ExpenseWithRelations): ExpenseRow {
    const shares: ExpenseParticipant[] = expense.splitShares.map((share) => ({
        memberId: share.memberId,
        memberName: share.member.name,
        shareAmount: share.shareAmount,
    }));

    return {
        ...expense,
        paidByName: expense.paidBy.name,
        shareCount: shares.length,
        participantNames: shares.map((share) => share.memberName),
        shares,
    };
}

function getDemoExpenses(params: Required<Pick<ExpenseListParams, "page" | "limit">> &
    Pick<ExpenseListParams, "query">): ExpenseListResult {
    const query = params.query?.trim().toLowerCase();
    const items = financeV1Fixtures.expenseHistory.items
        .filter((item) => {
            if (!query) return true;
            return (
                item.title.toLowerCase().includes(query) ||
                item.paidByMemberName.toLowerCase().includes(query)
            );
        })
        .map<ExpenseRow>((item) => ({
            id: item.expenseId,
            groupId: item.groupId,
            paidByMemberId: item.paidByMemberId,
            title: item.title,
            amount: item.amount,
            shareStrategy: item.shareStrategy,
            notes: item.notes ?? null,
            occurredAt: new Date(item.occurredAt),
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.createdAt),
            paidByName: item.paidByMemberName,
            shareCount: item.shares.length,
            participantNames: item.shares.map((share) => share.memberName),
            shares: item.shares.map((share) => ({
                memberId: share.memberId,
                memberName: share.memberName,
                shareAmount: share.amount,
            })),
        }));

    const total = items.length;
    const offset = (params.page - 1) * params.limit;

    return {
        items: items.slice(offset, offset + params.limit),
        pagination: {
            total,
            page: params.page,
            limit: params.limit,
        },
        query: params.query,
        source: "demo",
    };
}

export async function getExpenses(
    rawParams: ExpenseListParams,
): Promise<ExpenseListResult> {
    const params = expenseListQuerySchema.parse(rawParams);
    const query = params.query?.trim();
    const skip = (params.page - 1) * params.limit;

    try {
        const where: Prisma.ExpenseWhereInput = {
            groupId: params.groupId,
            ...(query
                ? {
                      OR: [
                          {
                              title: {
                                  contains: query,
                                  mode: "insensitive",
                              },
                          },
                          {
                              paidBy: {
                                  name: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                          },
                      ],
                  }
                : {}),
        };

        const [items, total] = await Promise.all([
            prisma.expense.findMany({
                where,
                include: expenseInclude,
                orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
                skip,
                take: params.limit,
            }),
            prisma.expense.count({ where }),
        ]);

        return {
            items: items.map(mapExpenseRow),
            pagination: {
                total,
                page: params.page,
                limit: params.limit,
            },
            query,
            source: "database",
        };
    } catch {
        return getDemoExpenses({
            page: params.page,
            limit: params.limit,
            query,
        });
    }
}

export async function deleteExpenseAction(
    rawInput: { id: string },
): Promise<ExpenseActionResponse> {
    const input = expenseDeleteSchema.parse(rawInput);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.balanceLedger.updateMany({
                where: {
                    sourceExpenseId: input.id,
                },
                data: {
                    sourceExpenseId: null,
                },
            });

            await tx.splitShare.deleteMany({
                where: {
                    expenseId: input.id,
                },
            });

            await tx.expense.delete({
                where: {
                    id: input.id,
                },
            });
        });

        revalidatePath("/expense");
        revalidatePath("/history");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Không thể xóa khoản chi",
        };
    }
}
