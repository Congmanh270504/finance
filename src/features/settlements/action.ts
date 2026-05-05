"use server";

import {
    BalanceLedgerHistoryType,
    type Prisma,
    type Settlement,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
    settlementCreateSchema,
    settlementDeleteSchema,
    settlementListQuerySchema,
    settlementUpdateSchema,
} from "@/features/settlements/schema";
import type {
    SettlementActionResponse,
    SettlementDebtOption,
    SettlementFormData,
    SettlementFormGroup,
    SettlementFormMember,
    SettlementListResult,
    SettlementRow,
} from "@/features/settlements/types";
import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";

const settlementInclude = {
    group: {
        select: {
            name: true,
            currency: true,
        },
    },
    fromMember: {
        select: {
            name: true,
            imgUrl: true,
        },
    },
    toMember: {
        select: {
            name: true,
            imgUrl: true,
        },
    },
} satisfies Prisma.SettlementInclude;

type SettlementWithRelations = Prisma.SettlementGetPayload<{
    include: typeof settlementInclude;
}>;

type LedgerSnapshotEntry = {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
};

function getAvatarFallback(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

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

function revalidateSettlementPaths() {
    revalidatePath("/");
    revalidatePath("/settlements");
    revalidatePath("/my-ledger-history");
    revalidatePath("/groups");
    revalidatePath("/insights");
    revalidatePath("/", "layout");
}

function mapSettlementRow(
    settlement: SettlementWithRelations,
    currentMemberId: string,
): SettlementRow {
    const direction: "outgoing" | "incoming" =
        settlement.fromMemberId === currentMemberId ? "outgoing" : "incoming";

    return {
        ...settlement,
        groupName: settlement.group.name,
        groupCurrency: settlement.group.currency,
        fromMemberName: settlement.fromMember.name,
        toMemberName: settlement.toMember.name,
        fromMemberAvatarUrl: settlement.fromMember.imgUrl,
        toMemberAvatarUrl: settlement.toMember.imgUrl,
        direction,
        signedAmount:
            direction === "outgoing"
                ? -Math.abs(settlement.amount)
                : settlement.amount,
    };
}

function buildEmptyResult(currentMemberId = ""): SettlementListResult {
    return {
        items: [],
        groups: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 20,
        },
        filters: {
            query: "",
            groupId: "",
        },
        summary: {
            totalOutgoing: 0,
            totalIncoming: 0,
            netAmount: 0,
            settlementCount: 0,
        },
        currentMemberId,
    };
}

function buildGroupOptions(
    memberships: Array<{ groupId: string; name: string; currency: string }>,
): SettlementFormGroup[] {
    return memberships.map((membership) => ({
        id: membership.groupId,
        name: membership.name,
        currency: membership.currency,
    }));
}

async function assertPayableDebt({
    groupId,
    fromMemberId,
    toMemberId,
    amount,
    existingSettlementAmount = 0,
}: {
    groupId: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    existingSettlementAmount?: number;
}) {
    if (fromMemberId === toMemberId) {
        throw new Error("You cannot pay yourself.");
    }

    const [groupMemberships, debt, toMember] = await Promise.all([
        prisma.user_Groups.findMany({
            where: {
                groupId,
                userId: {
                    in: [fromMemberId, toMemberId],
                },
            },
            select: {
                userId: true,
            },
        }),
        prisma.balanceLedger.findFirst({
            where: {
                groupId,
                fromMemberId,
                toMemberId,
            },
            include: {
                toMember: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma.user.findUnique({
            where: {
                id: toMemberId,
            },
            select: {
                name: true,
            },
        }),
    ]);

    if (groupMemberships.length !== 2) {
        throw new Error("Both members must belong to the selected group.");
    }

    const availableAmount = (debt?.amount ?? 0) + existingSettlementAmount;
    const toMemberName = debt?.toMember.name ?? toMember?.name ?? "this member";

    if (availableAmount <= 0) {
        throw new Error("There is no active debt to this member.");
    }

    if (amount > availableAmount) {
        throw new Error(
            `Payment cannot exceed the current debt to ${toMemberName}.`,
        );
    }

    return {
        toMemberName,
    };
}

async function writeSettlementHistory(
    tx: Prisma.TransactionClient,
    settlement: Settlement,
    fromMemberName: string,
    toMemberName: string,
    now: Date,
) {
    await tx.balanceLedgerHistory.create({
        data: {
            groupId: settlement.groupId,
            fromMemberId: settlement.fromMemberId,
            toMemberId: settlement.toMemberId,
            deltaAmount: -Math.abs(settlement.amount),
            type: BalanceLedgerHistoryType.SETTLEMENT_PAYMENT,
            note: settlement.note,
            sourceSettlementId: settlement.id,
            fromMemberNameSnapshot: fromMemberName,
            toMemberNameSnapshot: toMemberName,
            occurredAt: settlement.settledAt,
            createdAt: now,
        },
    });
}

export async function getSettlements(
    rawParams: unknown,
): Promise<SettlementListResult> {
    const context = await getCurrentUserContext();

    if (!context) {
        return buildEmptyResult();
    }

    const parsed = settlementListQuerySchema.parse(rawParams);
    const currentMemberId = context.user.id;
    const groupIds = context.memberships.map((membership) => membership.groupId);
    const query = parsed.query?.trim() ?? "";
    const groupId = parsed.groupId?.trim() ?? "";
    const skip = (parsed.page - 1) * parsed.limit;

    if (groupIds.length === 0) {
        return {
            ...buildEmptyResult(currentMemberId),
            groups: buildGroupOptions(context.memberships),
            pagination: {
                total: 0,
                page: parsed.page,
                limit: parsed.limit,
            },
        };
    }

    if (groupId && !groupIds.includes(groupId)) {
        return {
            ...buildEmptyResult(currentMemberId),
            groups: buildGroupOptions(context.memberships),
            pagination: {
                total: 0,
                page: parsed.page,
                limit: parsed.limit,
            },
            filters: {
                query,
                groupId,
            },
        };
    }

    const where: Prisma.SettlementWhereInput = {
        groupId: groupId ? groupId : { in: groupIds },
        OR: [{ fromMemberId: currentMemberId }, { toMemberId: currentMemberId }],
        ...(query
            ? {
                  AND: [
                      {
                          OR: [
                              {
                                  note: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  group: {
                                      name: {
                                          contains: query,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                              {
                                  fromMember: {
                                      name: {
                                          contains: query,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                              {
                                  toMember: {
                                      name: {
                                          contains: query,
                                          mode: "insensitive",
                                      },
                                  },
                              },
                          ],
                      },
                  ],
              }
            : {}),
    };

    const [rows, total, summaryRows] = await Promise.all([
        prisma.settlement.findMany({
            where,
            include: settlementInclude,
            orderBy: [{ settledAt: "desc" }, { createdAt: "desc" }],
            skip,
            take: parsed.limit,
        }),
        prisma.settlement.count({ where }),
        prisma.settlement.findMany({
            where,
            select: {
                fromMemberId: true,
                toMemberId: true,
                amount: true,
            },
        }),
    ]);

    const summary = summaryRows.reduce(
        (accumulator, settlement) => {
            if (settlement.fromMemberId === currentMemberId) {
                accumulator.totalOutgoing += settlement.amount;
            }

            if (settlement.toMemberId === currentMemberId) {
                accumulator.totalIncoming += settlement.amount;
            }

            accumulator.netAmount =
                accumulator.totalIncoming - accumulator.totalOutgoing;
            accumulator.settlementCount += 1;

            return accumulator;
        },
        {
            totalOutgoing: 0,
            totalIncoming: 0,
            netAmount: 0,
            settlementCount: 0,
        },
    );

    return {
        items: rows.map((row) => mapSettlementRow(row, currentMemberId)),
        groups: buildGroupOptions(context.memberships),
        pagination: {
            total,
            page: parsed.page,
            limit: parsed.limit,
        },
        filters: {
            query,
            groupId,
        },
        summary,
        currentMemberId,
    };
}

export async function getSettlementFormData(
    groupId: string,
): Promise<SettlementFormData> {
    const context = await getCurrentUserContext();

    if (!context) {
        return {
            members: [],
            debts: [],
            currency: "VND",
        };
    }

    const membership = context.memberships.find(
        (item) => item.groupId === groupId,
    );

    if (!membership) {
        return {
            members: [],
            debts: [],
            currency: "VND",
        };
    }

    const [memberLinks, debtRows] = await Promise.all([
        prisma.user_Groups.findMany({
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
        }),
        prisma.balanceLedger.findMany({
            where: {
                groupId,
                fromMemberId: context.user.id,
                amount: {
                    gt: 0,
                },
            },
            include: {
                toMember: {
                    select: {
                        name: true,
                        imgUrl: true,
                    },
                },
            },
            orderBy: [{ amount: "desc" }, { updatedAt: "desc" }],
        }),
    ]);

    const members: SettlementFormMember[] = memberLinks.map((member) => ({
        id: member.userId,
        name: member.User.name,
        avatarUrl: member.User.imgUrl ?? undefined,
        avatarFallback: getAvatarFallback(member.User.name),
    }));

    const debts: SettlementDebtOption[] = debtRows.map((debt) => ({
        toMemberId: debt.toMemberId,
        toMemberName: debt.toMember.name,
        toMemberAvatarUrl: debt.toMember.imgUrl,
        amount: debt.amount,
        currency: membership.currency,
    }));

    return {
        members,
        debts,
        currency: membership.currency,
    };
}

export async function createSettlementAction(
    rawInput: unknown,
): Promise<SettlementActionResponse<{ id: string }>> {
    const parsed = settlementCreateSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Payment data is invalid.",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "You need to sign in before saving a payment.",
        };
    }

    const currentMemberId = context.user.id;
    const hasGroup = context.memberships.some(
        (membership) => membership.groupId === parsed.data.groupId,
    );

    if (!hasGroup) {
        return {
            success: false,
            error: "Selected group is not available for your account.",
        };
    }

    try {
        const debt = await assertPayableDebt({
            groupId: parsed.data.groupId,
            fromMemberId: currentMemberId,
            toMemberId: parsed.data.toMemberId,
            amount: parsed.data.amount,
        });

        const now = new Date();
        const settlement = await prisma.$transaction(async (tx) => {
            const row = await tx.settlement.create({
                data: {
                    groupId: parsed.data.groupId,
                    fromMemberId: currentMemberId,
                    toMemberId: parsed.data.toMemberId,
                    amount: parsed.data.amount,
                    note: parsed.data.note,
                    settledAt: parsed.data.settledAt,
                },
            });

            await writeSettlementHistory(
                tx,
                row,
                context.user.name,
                debt.toMemberName,
                now,
            );
            await rebuildGroupBalanceLedger(tx, row.groupId, now);

            return row;
        });

        revalidateSettlementPaths();

        return {
            success: true,
            data: {
                id: settlement.id,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to save payment.",
        };
    }
}

export async function updateSettlementAction(
    rawInput: unknown,
): Promise<SettlementActionResponse<{ id: string }>> {
    const parsed = settlementUpdateSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Payment data is invalid.",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "You need to sign in before updating a payment.",
        };
    }

    try {
        const existing = await prisma.settlement.findUnique({
            where: {
                id: parsed.data.id,
            },
        });

        if (!existing || existing.fromMemberId !== context.user.id) {
            return {
                success: false,
                error: "Only outgoing payments from your account can be edited.",
            };
        }

        if (
            existing.groupId !== parsed.data.groupId ||
            existing.toMemberId !== parsed.data.toMemberId
        ) {
            return {
                success: false,
                error: "Payment group and counterparty cannot be changed.",
            };
        }

        const hasGroup = context.memberships.some(
            (membership) => membership.groupId === parsed.data.groupId,
        );

        if (!hasGroup) {
            return {
                success: false,
                error: "Selected group is not available for your account.",
            };
        }

        const debt = await assertPayableDebt({
            groupId: parsed.data.groupId,
            fromMemberId: context.user.id,
            toMemberId: parsed.data.toMemberId,
            amount: parsed.data.amount,
            existingSettlementAmount: existing.amount,
        });

        const now = new Date();
        const settlement = await prisma.$transaction(async (tx) => {
            await tx.balanceLedgerHistory.deleteMany({
                where: {
                    sourceSettlementId: existing.id,
                },
            });

            const row = await tx.settlement.update({
                where: {
                    id: existing.id,
                },
                data: {
                    groupId: parsed.data.groupId,
                    toMemberId: parsed.data.toMemberId,
                    amount: parsed.data.amount,
                    note: parsed.data.note,
                    settledAt: parsed.data.settledAt,
                },
            });

            await writeSettlementHistory(
                tx,
                row,
                context.user.name,
                debt.toMemberName,
                now,
            );
            await rebuildGroupBalanceLedger(tx, row.groupId, now);

            return row;
        });

        revalidateSettlementPaths();

        return {
            success: true,
            data: {
                id: settlement.id,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update payment.",
        };
    }
}

export async function deleteSettlementAction(
    rawInput: unknown,
): Promise<SettlementActionResponse<{ id: string }>> {
    const parsed = settlementDeleteSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Missing payment id.",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "You need to sign in before deleting a payment.",
        };
    }

    try {
        const existing = await prisma.settlement.findUnique({
            where: {
                id: parsed.data.id,
            },
        });

        if (!existing || existing.fromMemberId !== context.user.id) {
            return {
                success: false,
                error: "Only outgoing payments from your account can be deleted.",
            };
        }

        const now = new Date();

        await prisma.$transaction(async (tx) => {
            await tx.balanceLedgerHistory.deleteMany({
                where: {
                    sourceSettlementId: existing.id,
                },
            });

            await tx.settlement.delete({
                where: {
                    id: existing.id,
                },
            });

            await rebuildGroupBalanceLedger(tx, existing.groupId, now);
        });

        revalidateSettlementPaths();

        return {
            success: true,
            data: {
                id: existing.id,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete payment.",
        };
    }
}
