"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDaysIcon, ReceiptTextIcon, WalletIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChartLineMultiple } from "@/features/insights/components/chart-mutiple";
import type {
    InsightsMonthStat,
    InsightsYearlyStats,
} from "@/features/insights/types";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

function formatCompactVND(amount: number) {
    if (amount >= 1_000_000) {
        return `${new Intl.NumberFormat("vi-VN", {
            maximumFractionDigits: 1,
        }).format(amount / 1_000_000)}M`;
    }

    if (amount >= 1_000) {
        return `${new Intl.NumberFormat("vi-VN", {
            maximumFractionDigits: 0,
        }).format(amount / 1_000)}K`;
    }

    return new Intl.NumberFormat("vi-VN").format(amount);
}

const MONTH_LABELS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function getMonthLabel(month: number) {
    return MONTH_LABELS[month - 1] ?? `Month ${month}`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
}

function MonthStatCard({ month }: { month: InsightsMonthStat }) {
    const hasData = month.expenseCount > 0;

    return (
        <div
            className={[
                "relative min-h-[132px] overflow-hidden rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm",
                hasData
                    ? "border-primary/20 bg-background/80"
                    : "border-border/60 bg-muted/30",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {getMonthLabel(month.month)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {pluralize(month.expenseCount, "transaction")}
                    </p>
                </div>
                <Badge variant={hasData ? "secondary" : "outline"}>
                    {pluralize(month.groupCount, "group")}
                </Badge>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        My share
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-violet-600 dark:text-violet-400">
                        {formatCompactVND(month.myShareAmount)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        Paid back
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatCompactVND(month.paidByMeAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function InsightsClient({ data }: { data: InsightsYearlyStats }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function replaceYear(year: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("year", year);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const avg =
        data.summary.expenseCount > 0
            ? Math.round(data.summary.totalAmount / data.summary.expenseCount)
            : 0;

    return (
        <div className="space-y-4 px-4 pb-4 pt-4">
            <div className="flex flex-col gap-3 animate-fade-in-down md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-gradient">
                        Spending Statistics
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Analyze spending and debt payments across the year.
                    </p>
                </div>

                {data.yearOptions.length > 0 ? (
                    <Select
                        value={String(data.selectedYear)}
                        onValueChange={replaceYear}
                    >
                        <SelectTrigger className="w-full md:w-36">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {data.yearOptions.map((option) => (
                                <SelectItem
                                    key={option.year}
                                    value={String(option.year)}
                                >
                                    {option.year} ({option.activityCount})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        No years with data yet
                    </div>
                )}
            </div>

            <div className="grid gap-3 md:grid-cols-3 animate-fade-in-up stagger-1">
                <Card className="gap-1 py-3 hover-lift border-glow border border-violet-200/30 bg-gradient-to-br from-violet-50/80 to-background dark:border-violet-800/20 dark:from-violet-950/20 dark:to-background">
                    <CardHeader className="px-3 pb-0">
                        <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <ReceiptTextIcon className="size-3.5" />
                            Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3">
                        <p className="font-mono text-lg font-bold tabular-nums text-violet-600 dark:text-violet-400">
                            {data.summary.expenseCount}
                        </p>
                    </CardContent>
                </Card>
                <Card className="gap-1 py-3 hover-lift border-glow border border-emerald-200/30 bg-gradient-to-br from-emerald-50/80 to-background dark:border-emerald-800/20 dark:from-emerald-950/20 dark:to-background">
                    <CardHeader className="px-3 pb-0">
                        <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <CalendarDaysIcon className="size-3.5" />
                            Average
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3">
                        <p className="font-mono text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatVND(avg)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="animate-fade-in-up stagger-2">
                <ChartLineMultiple
                    data={data.months}
                    year={data.selectedYear}
                />
            </div>

            <div className="animate-fade-in-up stagger-3">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gradient">
                        12 months in {data.selectedYear}
                    </h2>
                    <Badge variant="secondary">
                        {pluralize(data.yearOptions.length, "year")} with data
                    </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.months.map((month) => (
                        <MonthStatCard key={month.month} month={month} />
                    ))}
                </div>
            </div>
        </div>
    );
}
