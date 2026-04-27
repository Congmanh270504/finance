"use server";

import {
    BalanceLedgerHistoryType,
    NotificationType,
    type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
    expenseCreateSchema,
    expenseDeleteSchema,
    expenseListQuerySchema,
} from "@/features/expense/schema";
import type {
    ExpenseActionResponse,
    ExpenseCreateResult,
    ExpenseFormGroup,
    ExpenseFormMember,
    ExpenseListParams,
    ExpenseListResult,
    ExpenseParticipant,
    ExpenseRow,
} from "@/features/expense/types";
import { sortGroupsByOrder } from "@/features/groups/utils";
import prisma from "@/lib/prisma";

const expenseInclude = {
    group: {
        select: {
            name: true,
        },
    },
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

function getAvatarFallback(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function mapExpenseRow(expense: ExpenseWithRelations): ExpenseRow {
    const shares: ExpenseParticipant[] = expense.splitShares.map((share) => ({
        memberId: share.memberId,
        memberName: share.member.name,
        shareAmount: share.shareAmount,
    }));

    return {
        ...expense,
        groupName: expense.group.name,
        paidByName: expense.paidBy.name,
        shareCount: shares.length,
        participantNames: shares.map((share) => share.memberName),
        shares,
    };
}

function formatNotificationAmount(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

function revalidateExpensePaths() {
    revalidatePath("/");
    revalidatePath("/expense");
    revalidatePath("/history");
    revalidatePath("/groups");
    revalidatePath("/members");
    revalidatePath("/", "layout");
}

type LedgerSnapshotEntry = {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
};

type LedgerHistoryWrite = Prisma.BalanceLedgerHistoryCreateManyInput;

function buildLedgerKey(fromMemberId: string, toMemberId: string) {
    return `${fromMemberId}:${toMemberId}`;
}

function applyDirectedLedgerDelta(
    snapshots: Map<string, LedgerSnapshotEntry>,
    fromMemberId: string,
    toMemberId: string,
    deltaAmount: number,
) {
    if (
        deltaAmount === 0 ||
        !Number.isFinite(deltaAmount) ||
        fromMemberId === toMemberId
    ) {
        return;
    }

    if (deltaAmount < 0) {
        applyDirectedLedgerDelta(
            snapshots,
            toMemberId,
            fromMemberId,
            Math.abs(deltaAmount),
        );
        return;
    }

    const reverseKey = buildLedgerKey(toMemberId, fromMemberId);
    const reverseEntry = snapshots.get(reverseKey);

    if (reverseEntry) {
        if (reverseEntry.amount > deltaAmount) {
            reverseEntry.amount -= deltaAmount;
            snapshots.set(reverseKey, reverseEntry);
            return;
        }

        snapshots.delete(reverseKey);
        const remainingAfterReverse = deltaAmount - reverseEntry.amount;
        if (remainingAfterReverse <= 0) {
            return;
        }

        const nextKey = buildLedgerKey(fromMemberId, toMemberId);
        const currentEntry = snapshots.get(nextKey);
        if (currentEntry) {
            currentEntry.amount += remainingAfterReverse;
            snapshots.set(nextKey, currentEntry);
            return;
        }

        snapshots.set(nextKey, {
            fromMemberId,
            toMemberId,
            amount: remainingAfterReverse,
        });
        return;
    }

    const key = buildLedgerKey(fromMemberId, toMemberId);
    const currentEntry = snapshots.get(key);
    if (currentEntry) {
        currentEntry.amount += deltaAmount;
        snapshots.set(key, currentEntry);
        return;
    }

    snapshots.set(key, {
        fromMemberId,
        toMemberId,
        amount: deltaAmount,
    });
}

async function appendLedgerHistory(
    tx: Prisma.TransactionClient,
    entries: LedgerHistoryWrite[],
) {
    if (entries.length === 0) {
        return 0;
    }

    await tx.balanceLedgerHistory.createMany({
        data: entries,
    });

    return entries.length;
}

async function createExpenseNotifications(
    tx: Prisma.TransactionClient,
    expense: ExpenseWithRelations,
) {
    const recipientIds = Array.from(
        new Set([
            expense.paidByMemberId,
            ...expense.splitShares.map((share) => share.memberId),
        ]),
    );

    if (recipientIds.length === 0) {
        return 0;
    }

    const result = await tx.notification.createMany({
        data: recipientIds.map((userId) => ({
            userId,
            groupId: expense.groupId,
            expenseId: expense.id,
            type: NotificationType.EXPENSE_CREATED,
            title: "Expense moi",
            message: `${expense.paidBy.name} da tra ${formatNotificationAmount(
                expense.amount,
            )} cho "${expense.title}" trong ${expense.group.name}.`,
            href: "/expense",
        })),
    });

    return result.count;
}

async function rebuildGroupBalanceLedger(
    tx: Prisma.TransactionClient,
    groupId: string,
    now: Date,
) {
    const historyEntries = await tx.balanceLedgerHistory.findMany({
        where: { groupId },
        select: {
            fromMemberId: true,
            toMemberId: true,
            deltaAmount: true,
        },
        orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
    });

    const snapshots = new Map<string, LedgerSnapshotEntry>();

    for (const entry of historyEntries) {
        applyDirectedLedgerDelta(
            snapshots,
            entry.fromMemberId,
            entry.toMemberId,
            entry.deltaAmount,
        );
    }

    await tx.balanceLedger.deleteMany({
        where: { groupId },
    });

    const nextEntries = Array.from(snapshots.values()).filter(
        (entry) => entry.amount > 0,
    );

    if (nextEntries.length === 0) {
        return 0;
    }

    await tx.balanceLedger.createMany({
        data: nextEntries.map((entry) => ({
            groupId,
            fromMemberId: entry.fromMemberId,
            toMemberId: entry.toMemberId,
            amount: entry.amount,
            sourceExpenseId: null,
            lastComputedAt: now,
        })),
    });

    return nextEntries.length;
}

export async function getExpenseFormMembers(groupId: string): Promise<{
    members: ExpenseFormMember[];
    source: "database" | "demo";
}> {
    try {
        const members = await prisma.user_Groups.findMany({
            where: {
                groupId,
            },
            select: {
                userId: true,
                User: {
                    select: {
                        name: true,
                        imgUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        if (members.length === 0) {
            return {
                members: [],
                source: "database",
            };
        }

        return {
            members: members.map((member) => ({
                id: member.userId,
                name: member.User.name,
                avatarUrl: member.User.imgUrl ?? undefined,
                avatarFallback: getAvatarFallback(member.User.name),
            })),
            source: "database",
        };
    } catch (error) {
        console.error("Failed to load expense form members", error);
        return {
            members: [],
            source: "database",
        };
    }
}

export async function getExpenseFormGroups(): Promise<{
    groups: ExpenseFormGroup[];
    source: "database" | "demo";
}> {
    try {
        const groups = await prisma.group.findMany({
            select: {
                id: true,
                name: true,
                currency: true,
                order: true,
                createdAt: true,
            },
        });

        return {
            groups: sortGroupsByOrder(groups).map((group) => ({
                id: group.id,
                name: group.name,
                currency: group.currency,
            })),
            source: "database",
        };
    } catch (error) {
        console.error("Failed to load expense form groups", error);
        return {
            groups: [],
            source: "database",
        };
    }
}

export async function getExpenses(
    rawParams: ExpenseListParams,
): Promise<ExpenseListResult> {
    const params = expenseListQuerySchema.parse(rawParams);
    const query = params.query?.trim();
    const skip = (params.page - 1) * params.limit;

    try {
        const where: Prisma.ExpenseWhereInput = {
            ...(params.groupId ? { groupId: params.groupId } : {}),
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
    } catch (error) {
        console.error("Failed to load expenses", error);
        return {
            items: [],
            pagination: {
                total: 0,
                page: params.page,
                limit: params.limit,
            },
            query,
            source: "database",
        };
    }
}

export async function createExpenseAction(
    rawInput: unknown,
): Promise<ExpenseActionResponse<ExpenseCreateResult>> {
    const parsed = expenseCreateSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ??
                "Expense data is invalid.",
        };
    }

    try {
        const now = new Date();
        const result = await prisma.$transaction(async (tx) => {
            const memberIds = Array.from(
                new Set([
                    parsed.data.paidByMemberId,
                    ...parsed.data.splitShares.map((share) => share.memberId),
                ]),
            );

            const groupMembers = await tx.user_Groups.findMany({
                where: {
                    groupId: parsed.data.groupId,
                    userId: {
                        in: memberIds,
                    },
                },
                select: {
                    userId: true,
                },
            });

            if (groupMembers.length !== memberIds.length) {
                throw new Error("One or more selected members do not belong to this group.");
            }

            const expense = await tx.expense.create({
                data: {
                    groupId: parsed.data.groupId,
                    paidByMemberId: parsed.data.paidByMemberId,
                    title: parsed.data.title,
                    amount: parsed.data.amount,
                    shareStrategy: parsed.data.shareStrategy,
                    notes: parsed.data.notes,
                    occurredAt: parsed.data.occurredAt,
                    splitShares: {
                        create: parsed.data.splitShares.map((share) => ({
                            memberId: share.memberId,
                            shareAmount: share.shareAmount,
                        })),
                    },
                },
                include: expenseInclude,
            });

            const ledgerHistoryEntries: LedgerHistoryWrite[] =
                expense.splitShares.flatMap((share) => {
                    if (
                        share.memberId === expense.paidByMemberId ||
                        share.shareAmount <= 0
                    ) {
                        return [];
                    }

                    return [
                        {
                            groupId: expense.groupId,
                            fromMemberId: share.memberId,
                            toMemberId: expense.paidByMemberId,
                            deltaAmount: share.shareAmount,
                            type: BalanceLedgerHistoryType.EXPENSE_SHARE,
                            sourceExpenseId: expense.id,
                            sourceSplitShareId: share.id,
                            sourceExpenseTitle: expense.title,
                            fromMemberNameSnapshot: share.member.name,
                            toMemberNameSnapshot: expense.paidBy.name,
                            occurredAt: expense.occurredAt,
                            createdAt: now,
                        },
                    ];
                });

            const historyCreatedCount = await appendLedgerHistory(
                tx,
                ledgerHistoryEntries,
            );
            await createExpenseNotifications(tx, expense);
            const ledgerUpdates = await rebuildGroupBalanceLedger(
                tx,
                expense.groupId,
                now,
            );

            return {
                expense: mapExpenseRow(expense),
                ledgerUpdates: historyCreatedCount > 0 ? ledgerUpdates : 0,
            };
        });

        revalidateExpensePaths();

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create expense.",
        };
    }
}

export async function deleteExpenseAction(
    rawInput: { id: string },
): Promise<ExpenseActionResponse> {
    const input = expenseDeleteSchema.parse(rawInput);

    try {
        await prisma.$transaction(async (tx) => {
            const expense = await tx.expense.findUnique({
                where: {
                    id: input.id,
                },
                include: expenseInclude,
            });

            if (!expense) {
                throw new Error("Expense not found.");
            }

            const now = new Date();
            const reversalEntries: LedgerHistoryWrite[] =
                expense.splitShares.flatMap((share) => {
                    if (
                        share.memberId === expense.paidByMemberId ||
                        share.shareAmount <= 0
                    ) {
                        return [];
                    }

                    return [
                        {
                            groupId: expense.groupId,
                            fromMemberId: share.memberId,
                            toMemberId: expense.paidByMemberId,
                            deltaAmount: -share.shareAmount,
                            type: BalanceLedgerHistoryType.EXPENSE_DELETION_REVERSAL,
                            note: "Expense deleted",
                            sourceExpenseId: expense.id,
                            sourceSplitShareId: share.id,
                            sourceExpenseTitle: expense.title,
                            fromMemberNameSnapshot: share.member.name,
                            toMemberNameSnapshot: expense.paidBy.name,
                            occurredAt: now,
                            createdAt: now,
                        },
                    ];
                });

            await appendLedgerHistory(tx, reversalEntries);

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

            await rebuildGroupBalanceLedger(tx, expense.groupId, now);
        });

        revalidateExpensePaths();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete expense.",
        };
    }
}
