"use server";

import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { groupLedgerDetailQuerySchema } from "@/features/group-details/schema";
import type {
    GroupCurrentBalanceRow,
    GroupLedgerDetailResult,
    GroupLedgerHistoryRow,
    GroupLedgerMemberOption,
    GroupLedgerOverview,
} from "@/features/group-details/types";

function normalizeFilterText(value?: string) {
    return value?.trim() ?? "";
}

function buildHistorySourceLabel(entry: {
    sourceExpenseTitle?: string | null;
    note?: string | null;
    type: string;
}) {
    if (entry.sourceExpenseTitle?.trim()) {
        return entry.sourceExpenseTitle.trim();
    }

    if (entry.note?.trim()) {
        return entry.note.trim();
    }

    return entry.type
        .toLowerCase()
        .split("_")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ");
}

export async function getGroupLedgerDetail(
    rawParams: unknown,
): Promise<GroupLedgerDetailResult | null> {
    const parsed = groupLedgerDetailQuerySchema.parse(rawParams);
    const query = normalizeFilterText(parsed.query);
    const memberId = normalizeFilterText(parsed.memberId);
    const skip = (parsed.page - 1) * parsed.limit;

    const group = await prisma.group.findUnique({
        where: {
            id: parsed.groupId,
        },
    });

    if (!group) {
        return null;
    }

    const historyWhere: Prisma.BalanceLedgerHistoryWhereInput = {
        groupId: parsed.groupId,
        ...(memberId
            ? {
                  OR: [
                      { fromMemberId: memberId },
                      { toMemberId: memberId },
                  ],
              }
            : {}),
        ...(query
            ? {
                  AND: [
                      {
                          OR: [
                              {
                                  sourceExpenseTitle: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  fromMemberNameSnapshot: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  toMemberNameSnapshot: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  note: {
                                      contains: query,
                                      mode: "insensitive",
                                  },
                              },
                          ],
                      },
                  ],
              }
            : {}),
    };

    const [
        memberLinks,
        currentBalancesRaw,
        historyRaw,
        historyEventCount,
        expenseCount,
    ] = await Promise.all([
        prisma.user_Groups.findMany({
            where: {
                groupId: parsed.groupId,
            },
            select: {
                userId: true,
                User: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        }),
        prisma.balanceLedger.findMany({
            where: {
                groupId: parsed.groupId,
            },
            include: {
                fromMember: {
                    select: {
                        name: true,
                    },
                },
                toMember: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [{ amount: "desc" }, { updatedAt: "desc" }],
        }),
        prisma.balanceLedgerHistory.findMany({
            where: historyWhere,
            include: {
                fromMember: {
                    select: {
                        name: true,
                    },
                },
                toMember: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
            skip,
            take: parsed.limit,
        }),
        prisma.balanceLedgerHistory.count({
            where: historyWhere,
        }),
        prisma.expense.count({
            where: {
                groupId: parsed.groupId,
            },
        }),
    ]);

    const memberOptions: GroupLedgerMemberOption[] = memberLinks.map((link) => ({
        id: link.userId,
        name: link.User.name,
    }));

    const currentBalances: GroupCurrentBalanceRow[] = currentBalancesRaw.map(
        (item) => {
            const { fromMember, toMember, ...rest } = item;

            return {
                ...rest,
                fromMemberName: fromMember.name,
                toMemberName: toMember.name,
            };
        },
    );

    const history: GroupLedgerHistoryRow[] = historyRaw.map((entry) => {
        const { fromMember, toMember, ...rest } = entry;

        return {
            ...rest,
            fromMemberName: rest.fromMemberNameSnapshot || fromMember.name,
            toMemberName: rest.toMemberNameSnapshot || toMember.name,
            sourceLabel: buildHistorySourceLabel(rest),
        };
    });

    const overview: GroupLedgerOverview = {
        ...group,
        memberCount: memberLinks.length,
        expenseCount,
        currentLedgerCount: currentBalances.length,
        historyEventCount,
        totalOutstanding: currentBalances.reduce(
            (total, item) => total + item.amount,
            0,
        ),
    };

    return {
        group: overview,
        memberOptions,
        currentBalances,
        history,
        pagination: {
            total: historyEventCount,
            page: parsed.page,
            limit: parsed.limit,
        },
        filters: {
            query,
            memberId,
        },
    };
}
