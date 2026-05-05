"use server";

import { dashboardQuickAccessLinks } from "@/components/desk-sidebar/nav-data";
import type {
    DashboardLedgerItem,
    DashboardMonthlyCashflowPoint,
    DashboardOverviewData,
    DashboardQuickAccessItem,
    DashboardRecentExpenseItem,
} from "@/features/dashboard/types";
import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";

const RECENT_EXPENSE_LIMIT = 5;
const CASHFLOW_MONTH_COUNT = 6;
const QUICK_ACCESS_GROUP_LIMIT = 5;

type DashboardMembership = {
    groupId: string;
    name: string;
    currency: string;
    imgUrl?: string | null;
};

function getMonthKey(date: Date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
        2,
        "0",
    )}`;
}

function getMonthLabel(date: Date) {
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(
        date.getUTCFullYear(),
    ).slice(-2)}`;
}

function buildCashflowBuckets(now = new Date()) {
    const buckets: Array<DashboardMonthlyCashflowPoint & { key: string }> = [];

    for (let offset = CASHFLOW_MONTH_COUNT - 1; offset >= 0; offset -= 1) {
        const start = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
        );

        buckets.push({
            key: getMonthKey(start),
            month: getMonthLabel(start),
            income: 0,
            expense: 0,
        });
    }

    return {
        startDate: new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
        ),
        buckets,
        bucketMap: new Map(buckets.map((bucket) => [bucket.key, bucket])),
    };
}

function buildQuickAccess(
    memberships: DashboardMembership[],
): DashboardQuickAccessItem[] {
    const groupLinks = memberships
        .slice(0, QUICK_ACCESS_GROUP_LIMIT)
        .map((membership) => ({
            title: membership.name,
            url: `/groups/${membership.groupId}`,
            kind: "group" as const,
            imgUrl: membership.imgUrl,
        }));

    return [...dashboardQuickAccessLinks, ...groupLinks];
}

function buildEmptyDashboard(
    currentMemberId: string,
    memberships: DashboardMembership[] = [],
): DashboardOverviewData {
    return {
        currentMemberId,
        generatedAt: new Date().toISOString(),
        netBalance: 0,
        totalOwedToMe: 0,
        totalIOwe: 0,
        totalGroupSpending: 0,
        transactionCount: 0,
        groupCount: memberships.length,
        monthlyCashflow: buildCashflowBuckets().buckets.map((bucket) => ({
            month: bucket.month,
            income: bucket.income,
            expense: bucket.expense,
        })),
        ledger: [],
        recentExpenses: [],
        quickAccess: buildQuickAccess(memberships),
    };
}

export async function getDashboardOverviewAction(): Promise<DashboardOverviewData | null> {
    const context = await getCurrentUserContext();

    if (!context) {
        return null;
    }

    const currentMemberId = context.user.id;
    const memberships = context.memberships;
    const groupIds = memberships.map((membership) => membership.groupId);

    if (groupIds.length === 0) {
        return buildEmptyDashboard(currentMemberId, memberships);
    }

    const { startDate, buckets, bucketMap } = buildCashflowBuckets();

    const [
        ledgerRows,
        historyRows,
        recentExpenseRows,
        expenseAggregate,
        transactionCount,
    ] = await Promise.all([
        prisma.balanceLedger.findMany({
            where: {
                groupId: {
                    in: groupIds,
                },
                OR: [
                    { fromMemberId: currentMemberId },
                    { toMemberId: currentMemberId },
                ],
            },
            include: {
                group: {
                    select: {
                        name: true,
                        currency: true,
                        imgUrl: true,
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
            },
            orderBy: [{ amount: "desc" }, { updatedAt: "desc" }],
        }),
        prisma.balanceLedgerHistory.findMany({
            where: {
                groupId: {
                    in: groupIds,
                },
                occurredAt: {
                    gte: startDate,
                },
                OR: [
                    { fromMemberId: currentMemberId },
                    { toMemberId: currentMemberId },
                ],
            },
            select: {
                fromMemberId: true,
                toMemberId: true,
                deltaAmount: true,
                occurredAt: true,
            },
        }),
        prisma.expense.findMany({
            where: {
                groupId: {
                    in: groupIds,
                },
            },
            include: {
                group: {
                    select: {
                        name: true,
                        imgUrl: true,
                    },
                },
                paidBy: {
                    select: {
                        name: true,
                    },
                },
                splitShares: {
                    where: {
                        memberId: currentMemberId,
                    },
                    select: {
                        shareAmount: true,
                    },
                },
            },
            orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
            take: RECENT_EXPENSE_LIMIT,
        }),
        prisma.expense.aggregate({
            where: {
                groupId: {
                    in: groupIds,
                },
            },
            _sum: {
                amount: true,
            },
        }),
        prisma.expense.count({
            where: {
                groupId: {
                    in: groupIds,
                },
            },
        }),
    ]);

    for (const entry of historyRows) {
        const bucket = bucketMap.get(getMonthKey(entry.occurredAt));

        if (!bucket) {
            continue;
        }

        if (entry.toMemberId === currentMemberId) {
            bucket.income += Math.abs(entry.deltaAmount);
        }

        if (entry.fromMemberId === currentMemberId) {
            bucket.expense += Math.abs(entry.deltaAmount);
        }
    }

    const monthlyCashflow = buckets.map((bucket) => ({
        month: bucket.month,
        income: Math.max(0, bucket.income),
        expense: Math.max(0, bucket.expense),
    }));

    const ledger: DashboardLedgerItem[] = ledgerRows.map((entry) => {
        const iOwe = entry.fromMemberId === currentMemberId;

        return {
            ledgerId: entry.id,
            groupId: entry.groupId,
            groupName: entry.group.name,
            groupImgUrl: entry.group.imgUrl,
            groupCurrency: entry.group.currency,
            counterpartyId: iOwe ? entry.toMemberId : entry.fromMemberId,
            counterpartyName: iOwe
                ? entry.toMember.name
                : entry.fromMember.name,
            counterpartyImgUrl: iOwe
                ? entry.toMember.imgUrl
                : entry.fromMember.imgUrl,
            amount: entry.amount,
            direction: iOwe ? "iOwe" : "owedToMe",
            updatedAt: entry.updatedAt.toISOString(),
        };
    });

    const totalOwedToMe = ledger
        .filter((entry) => entry.direction === "owedToMe")
        .reduce((total, entry) => total + entry.amount, 0);
    const totalIOwe = ledger
        .filter((entry) => entry.direction === "iOwe")
        .reduce((total, entry) => total + entry.amount, 0);

    const recentExpenses: DashboardRecentExpenseItem[] = recentExpenseRows.map(
        (expense) => ({
            expenseId: expense.id,
            groupId: expense.groupId,
            groupName: expense.group.name,
            groupImgUrl: expense.group.imgUrl,
            title: expense.title,
            amount: expense.amount,
            paidByMemberId: expense.paidByMemberId,
            paidByMemberName: expense.paidBy.name,
            myShareAmount: expense.splitShares[0]?.shareAmount ?? null,
            occurredAt: expense.occurredAt.toISOString(),
        }),
    );

    return {
        currentMemberId,
        generatedAt: new Date().toISOString(),
        netBalance: totalOwedToMe - totalIOwe,
        totalOwedToMe,
        totalIOwe,
        totalGroupSpending: expenseAggregate._sum.amount ?? 0,
        transactionCount,
        groupCount: memberships.length,
        monthlyCashflow,
        ledger,
        recentExpenses,
        quickAccess: buildQuickAccess(memberships),
    };
}
