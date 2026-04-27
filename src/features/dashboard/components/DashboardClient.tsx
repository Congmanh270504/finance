"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowRightIcon,
    BarChart3Icon,
    LayoutGridIcon,
    ReceiptTextIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    WalletIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import UserAvatar from "@/components/user-avatar";
import { DashboardCashflowChart } from "@/features/dashboard/components/chart-mutiple";
import type {
    DashboardLedgerItem,
    DashboardOverviewData,
    DashboardQuickAccessItem,
} from "@/features/dashboard/types";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("vi-VN");
}

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function QuickAccessIcon({ item }: { item: DashboardQuickAccessItem }) {
    if (item.kind === "group") {
        return (
            <UserAvatar
                src={item.imgUrl ?? undefined}
                alt={item.title}
                fallback={getInitials(item.title)}
                className="size-8"
            />
        );
    }

    if (item.url.includes("expense")) {
        return <ReceiptTextIcon className="size-4" />;
    }

    if (item.url.includes("insights")) {
        return <BarChart3Icon className="size-4" />;
    }

    return <LayoutGridIcon className="size-4" />;
}

function LedgerList({
    title,
    items,
    emptyText,
    variant,
}: {
    title: string;
    items: DashboardLedgerItem[];
    emptyText: string;
    variant: "danger" | "success";
}) {
    const isDanger = variant === "danger";

    return (
        <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between">
                <Badge
                    variant="secondary"
                    className="gap-1.5 border-emerald-600/40 bg-emerald-600/10 text-emerald-500 shadow-none hover:bg-emerald-600/10 dark:bg-emerald-600/20"
                >
                    {title}
                </Badge>
                <Badge variant={isDanger ? "destructive" : "success"}>
                    {items.length}
                </Badge>
            </div>
            {items.length === 0 ? (
                <Card className="border border-primary/10 py-5 text-center text-sm text-muted-foreground glass">
                    {emptyText}
                </Card>
            ) : (
                <Card className="divide-y divide-border/50 border border-primary/10 py-2 glass hover-lift">
                    {items.map((entry) => (
                        <Link
                            key={entry.ledgerId}
                            href={`/groups/${entry.groupId}`}
                            className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/30"
                        >
                            {entry.counterpartyImgUrl && (
                                <UserAvatar
                                    src={entry.counterpartyImgUrl ?? undefined}
                                    alt={entry.counterpartyName}
                                    fallback={getInitials(
                                        entry.counterpartyName,
                                    )}
                                />
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {entry.counterpartyName}
                                </p>
                                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                    <UserAvatar
                                        src={entry.groupImgUrl ?? undefined}
                                        alt={entry.groupName}
                                        fallback={getInitials(entry.groupName)}
                                        className="size-4 text-[8px]"
                                    />
                                    <span className="truncate">
                                        {entry.groupName}
                                    </span>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p
                                    className={[
                                        "font-mono text-sm font-semibold tabular-nums",
                                        isDanger
                                            ? "text-red-500"
                                            : "text-emerald-600 dark:text-emerald-400",
                                    ].join(" ")}
                                >
                                    {formatVND(entry.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {entry.groupCurrency}
                                </p>
                            </div>
                        </Link>
                    ))}
                </Card>
            )}
        </div>
    );
}

export function DashboardClient({
    dashboard,
}: {
    dashboard: DashboardOverviewData;
}) {
    const iOweLedger = React.useMemo(
        () => dashboard.ledger.filter((entry) => entry.direction === "iOwe"),
        [dashboard.ledger],
    );
    const owedToMeLedger = React.useMemo(
        () =>
            dashboard.ledger.filter((entry) => entry.direction === "owedToMe"),
        [dashboard.ledger],
    );

    return (
        <div className="space-y-4 pb-4">
            <div className="px-4 pt-4 animate-fade-in-up">
                <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Your Balance
                                </p>
                                <p
                                    className={[
                                        "mt-1 break-words font-mono text-3xl font-bold tabular-nums",
                                        dashboard.netBalance >= 0
                                            ? "text-emerald-500 dark:text-emerald-400"
                                            : "text-red-500",
                                    ].join(" ")}
                                >
                                    {dashboard.netBalance >= 0 ? "+" : "-"}
                                    {formatVND(Math.abs(dashboard.netBalance))}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {dashboard.netBalance >= 0
                                        ? "Others owe you more than you owe."
                                        : "You owe more than others owe you."}
                                </p>
                            </div>
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/25 animate-pulse-glow">
                                <WalletIcon className="size-6 text-primary" />
                            </div>
                        </div>
                        <Separator className="my-3 opacity-30" />
                        <div className="grid grid-cols-2 gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex cursor-default items-center gap-2 rounded-lg border border-emerald-200/40 bg-emerald-50/80 px-3 py-2 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-400/50 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                                        <TrendingUpIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-muted-foreground">
                                                Owed to You
                                            </p>
                                            <p className="font-mono text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                                {formatVND(
                                                    dashboard.totalOwedToMe,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Total active debt others owe you</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex cursor-default items-center gap-2 rounded-lg border border-red-200/40 bg-red-50/80 px-3 py-2 transition-all duration-200 hover:scale-[1.02] hover:border-red-400/50 dark:border-red-800/30 dark:bg-red-950/20">
                                        <TrendingDownIcon className="size-4 shrink-0 text-red-500" />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-muted-foreground">
                                                You Owe
                                            </p>
                                            <p className="font-mono text-sm font-semibold tabular-nums text-red-500">
                                                {formatVND(dashboard.totalIOwe)}
                                            </p>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Total active debt you owe others</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 animate-fade-in-up stagger-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <div className="absolute inset-0 animate-shimmer" />
                            </div>
                            <CardHeader className="px-3 pb-0">
                                <CardTitle className="text-xs text-muted-foreground font-medium">
                                    Group Spending
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3">
                                <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                                    {formatVND(dashboard.totalGroupSpending)}
                                </p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Total spending across your groups</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-violet-200/30 bg-gradient-to-br from-violet-50/80 to-background dark:border-violet-800/20 dark:from-violet-950/20 dark:to-background">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <div className="absolute inset-0 animate-shimmer" />
                            </div>
                            <CardHeader className="px-3 pb-0">
                                <CardTitle className="text-xs text-muted-foreground font-medium">
                                    Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3">
                                <p className="font-mono text-lg font-bold tabular-nums text-violet-600 dark:text-violet-400">
                                    {dashboard.transactionCount}
                                </p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Total expenses recorded across your groups</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <div className="px-4 animate-fade-in-up stagger-3">
                <DashboardCashflowChart data={dashboard.monthlyCashflow} />
            </div>

            <div className="px-4 animate-fade-in-up stagger-4">
                <div className="mb-2 flex items-center justify-between">
                    <Badge
                        variant="secondary"
                        className="gap-1.5 border-emerald-600/40 bg-emerald-600/10 text-emerald-500 shadow-none hover:bg-emerald-600/10 dark:bg-emerald-600/20"
                    >
                        Quick Access
                    </Badge>

                    <Badge variant="secondary">
                        {dashboard.groupCount} groups
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {dashboard.quickAccess.map((item) => (
                        <Link
                            key={`${item.kind}-${item.url}`}
                            href={item.url}
                            className="group flex min-h-16 items-center gap-2 rounded-lg border border-primary/10 bg-background/70 px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                        >
                            <span
                                className={`${item.kind === "group" ? "border-none" : "border border-border/60"} flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/60 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary`}
                            >
                                <QuickAccessIcon item={item} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">
                                    {item.title}
                                </span>
                                <span className="block text-xs capitalize text-muted-foreground">
                                    {item.kind}
                                </span>
                            </span>
                            <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 px-4 animate-fade-in-up stagger-5 lg:grid-cols-2">
                <LedgerList
                    title="You Owe"
                    items={iOweLedger}
                    emptyText="No active debt from you."
                    variant="danger"
                />
                <LedgerList
                    title="Owed to You"
                    items={owedToMeLedger}
                    emptyText="No active debt owed to you."
                    variant="success"
                />
            </div>

            <div className="px-4 animate-fade-in-up stagger-6">
                <div className="mb-2 flex items-center justify-between">
                    <Badge
                        variant="secondary"
                        className="gap-1.5 border-emerald-600/40 bg-emerald-600/10 text-emerald-500 shadow-none hover:bg-emerald-600/10 dark:bg-emerald-600/20"
                    >
                        Recent Expenses
                    </Badge>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs underline-animate"
                        asChild
                    >
                        <Link href="/my-ledger-history">
                            View All <ArrowRightIcon className="size-3" />
                        </Link>
                    </Button>
                </div>
                {dashboard.recentExpenses.length === 0 ? (
                    <Card className="border border-primary/10 py-5 text-center text-sm text-muted-foreground glass">
                        No expenses yet
                    </Card>
                ) : (
                    <Card className="divide-y divide-border/50 border border-primary/10 py-2 glass hover-lift">
                        {dashboard.recentExpenses.map((expense) => (
                            <Link
                                key={expense.expenseId}
                                href={`/groups/${expense.groupId}`}
                                className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/30"
                            >
                                <div className="relative shrink-0">
                                    <UserAvatar
                                        src={expense.groupImgUrl ?? undefined}
                                        alt={expense.groupName}
                                        fallback={getInitials(
                                            expense.groupName,
                                        )}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {expense.title}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {expense.groupName} &middot;{" "}
                                        {expense.paidByMemberName} &middot;{" "}
                                        {formatDate(expense.occurredAt)}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="font-mono text-sm font-semibold tabular-nums">
                                        {formatVND(expense.amount)}
                                    </p>
                                    {expense.myShareAmount !== null ? (
                                        <p className="font-mono text-xs tabular-nums text-muted-foreground">
                                            You:{" "}
                                            {formatVND(expense.myShareAmount)}
                                        </p>
                                    ) : null}
                                </div>
                            </Link>
                        ))}
                    </Card>
                )}
            </div>
        </div>
    );
}
