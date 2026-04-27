"use server";

import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type {
    InsightsMonthStat,
    InsightsYearOption,
    InsightsYearlyStats,
} from "@/features/insights/types";

const MONTH_LABELS = [
    "Thang 1",
    "Thang 2",
    "Thang 3",
    "Thang 4",
    "Thang 5",
    "Thang 6",
    "Thang 7",
    "Thang 8",
    "Thang 9",
    "Thang 10",
    "Thang 11",
    "Thang 12",
];

function buildEmptyMonths(): InsightsMonthStat[] {
    return MONTH_LABELS.map((monthLabel, index) => ({
        month: index + 1,
        monthLabel,
        totalAmount: 0,
        myShareAmount: 0,
        paidByMeAmount: 0,
        expenseCount: 0,
        groupCount: 0,
    }));
}

function resolveSelectedYear(rawYear: string | undefined, years: number[]) {
    const parsedYear = Number(rawYear);

    if (Number.isInteger(parsedYear) && years.includes(parsedYear)) {
        return parsedYear;
    }

    return years[0] ?? new Date().getFullYear();
}

function buildYearOptions(expenseDates: Date[]): InsightsYearOption[] {
    const countByYear = new Map<number, number>();

    for (const date of expenseDates) {
        const year = date.getUTCFullYear();
        countByYear.set(year, (countByYear.get(year) ?? 0) + 1);
    }

    return Array.from(countByYear.entries())
        .map(([year, expenseCount]) => ({ year, expenseCount }))
        .sort((left, right) => right.year - left.year);
}

export async function getInsightsYearlyStatsAction(params?: {
    year?: string;
}): Promise<InsightsYearlyStats | null> {
    const context = await getCurrentUserContext();

    if (!context) {
        return null;
    }

    const currentMemberId = context.user.id;
    const groupIds = context.memberships.map((membership) => membership.groupId);
    const emptyMonths = buildEmptyMonths();

    if (groupIds.length === 0) {
        return {
            selectedYear: new Date().getFullYear(),
            yearOptions: [],
            months: emptyMonths,
            summary: {
                totalAmount: 0,
                myShareAmount: 0,
                paidByMeAmount: 0,
                expenseCount: 0,
            },
        };
    }

    const expenseDates = await prisma.expense.findMany({
        where: {
            groupId: {
                in: groupIds,
            },
        },
        select: {
            occurredAt: true,
        },
        orderBy: {
            occurredAt: "desc",
        },
    });

    const yearOptions = buildYearOptions(
        expenseDates.map((expense) => expense.occurredAt),
    );
    const selectedYear = resolveSelectedYear(
        params?.year,
        yearOptions.map((option) => option.year),
    );
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1));
    const nextYearStart = new Date(Date.UTC(selectedYear + 1, 0, 1));

    const expenses = await prisma.expense.findMany({
        where: {
            groupId: {
                in: groupIds,
            },
            occurredAt: {
                gte: yearStart,
                lt: nextYearStart,
            },
        },
        select: {
            groupId: true,
            paidByMemberId: true,
            amount: true,
            occurredAt: true,
            splitShares: {
                where: {
                    memberId: currentMemberId,
                },
                select: {
                    shareAmount: true,
                },
            },
        },
        orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
    });

    const groupSetsByMonth = Array.from({ length: 12 }, () => new Set<string>());
    const months = buildEmptyMonths();

    for (const expense of expenses) {
        const monthIndex = expense.occurredAt.getUTCMonth();
        const month = months[monthIndex];

        month.totalAmount += expense.amount;
        month.myShareAmount += expense.splitShares[0]?.shareAmount ?? 0;
        month.paidByMeAmount +=
            expense.paidByMemberId === currentMemberId ? expense.amount : 0;
        month.expenseCount += 1;
        groupSetsByMonth[monthIndex].add(expense.groupId);
    }

    months.forEach((month, index) => {
        month.groupCount = groupSetsByMonth[index].size;
    });

    const summary = months.reduce(
        (accumulator, month) => ({
            totalAmount: accumulator.totalAmount + month.totalAmount,
            myShareAmount: accumulator.myShareAmount + month.myShareAmount,
            paidByMeAmount: accumulator.paidByMeAmount + month.paidByMeAmount,
            expenseCount: accumulator.expenseCount + month.expenseCount,
        }),
        {
            totalAmount: 0,
            myShareAmount: 0,
            paidByMeAmount: 0,
            expenseCount: 0,
        },
    );

    return {
        selectedYear,
        yearOptions,
        months,
        summary,
    };
}
