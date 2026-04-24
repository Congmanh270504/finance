"use client";

import * as React from "react";
import Link from "next/link";
import {
    PlusIcon,
    ArrowRightIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    WalletIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import { ExpenseCategoryIcon } from "@/features/finance/components/shared/expense-icon";
import type {
    BalancesSummaryResponseV1,
    ExpenseHistoryResponseV1,
} from "@/features/finance/type";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function DashboardClient({
    summary,
    history,
    currentMemberId,
    isDemo,
}: {
    summary: BalancesSummaryResponseV1;
    history: ExpenseHistoryResponseV1;
    currentMemberId: string;
    isDemo?: boolean;
}) {
    const myBalance = summary.memberBalances.find(
        (m) => m.memberId === currentMemberId,
    );
    const netBalance = myBalance?.netAmount ?? 0;
    const totalOwedToMe = summary.ledger
        .filter((l) => l.toMemberId === currentMemberId)
        .reduce((s, l) => s + l.amount, 0);
    const totalIOwe = summary.ledger
        .filter((l) => l.fromMemberId === currentMemberId)
        .reduce((s, l) => s + l.amount, 0);
    const myLedger = summary.ledger.filter(
        (l) =>
            l.fromMemberId === currentMemberId ||
            l.toMemberId === currentMemberId,
    );
    const recentExpenses = history.items.slice(0, 5);
    const totalGroupSpending = history.items.reduce((s, e) => s + e.amount, 0);

    return (
        <div className="space-y-4 pb-4">
            {isDemo && (
                <div className="mx-4 mt-4 rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
                    Demo mode – sample data (DB not connected)
                </div>
            )}

            {/* Net balance hero */}
            <div className="px-4 pt-4 animate-fade-in-up">
                <Card className="overflow-hidden border border-primary/20 glass-strong py-0 shadow-lg hover-lift border-glow">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                    Your Balance
                                </p>
                                <p
                                    className={[
                                        "mt-1 text-3xl font-bold tabular-nums font-mono",
                                        netBalance >= 0
                                            ? "text-emerald-500 dark:text-emerald-400"
                                            : "text-red-500",
                                    ].join(" ")}
                                >
                                    {netBalance >= 0 ? "+" : ""}
                                    {formatVND(Math.abs(netBalance))}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {netBalance >= 0
                                        ? "You are owed"
                                        : "You owe"}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/25 animate-pulse-glow">
                                <WalletIcon className="size-6 text-primary" />
                            </div>
                        </div>
                        <Separator className="my-3 opacity-30" />
                        <div className="grid grid-cols-2 gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30 bg-emerald-50/80 dark:bg-emerald-950/20 px-3 py-2 cursor-default transition-all duration-200 hover:border-emerald-400/50 hover:scale-[1.02]">
                                        <TrendingUpIcon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-muted-foreground">
                                                Owed to You
                                            </p>
                                            <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                {formatVND(totalOwedToMe)}
                                            </p>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Total amount others owe you</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 rounded-lg border border-red-200/40 dark:border-red-800/30 bg-red-50/80 dark:bg-red-950/20 px-3 py-2 cursor-default transition-all duration-200 hover:border-red-400/50 hover:scale-[1.02]">
                                        <TrendingDownIcon className="size-4 text-red-500 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-muted-foreground">
                                                You Owe
                                            </p>
                                            <p className="text-sm font-semibold font-mono text-red-500 tabular-nums">
                                                {formatVND(totalIOwe)}
                                            </p>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Total amount you owe</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats row */}
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
                                    {formatVND(totalGroupSpending)}
                                </p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Total group spending recorded</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-violet-200/30 dark:border-violet-800/20 bg-gradient-to-br from-violet-50/80 to-background dark:from-violet-950/20 dark:to-background">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <div className="absolute inset-0 animate-shimmer" />
                            </div>
                            <CardHeader className="px-3 pb-0">
                                <CardTitle className="text-xs text-muted-foreground font-medium">
                                    Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3">
                                <p className="text-lg font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums">
                                    {history.totalCount}
                                </p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Total expenses recorded</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Settlement ledger */}
            {myLedger.length > 0 && (
                <div className="px-4 animate-fade-in-up stagger-3">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-gradient">
                            Settlement
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 underline-animate"
                            asChild
                        >
                            <Link href="/members">
                                View All <ArrowRightIcon className="size-3" />
                            </Link>
                        </Button>
                    </div>
                    <Card className="py-2 divide-y divide-border/50 border border-primary/10 glass hover-lift">
                        {myLedger.map((entry) => {
                            const iOwe = entry.fromMemberId === currentMemberId;
                            const other = iOwe
                                ? {
                                      id: entry.toMemberId,
                                      name: entry.toMemberName,
                                  }
                                : {
                                      id: entry.fromMemberId,
                                      name: entry.fromMemberName,
                                  };
                            return (
                                <div
                                    key={entry.ledgerId}
                                    className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/30"
                                >
                                    <MemberAvatar name={other.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {other.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {iOwe ? "You owe" : "Owes you"}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            iOwe ? "destructive" : "success"
                                        }
                                        className="tabular-nums shrink-0 font-mono"
                                    >
                                        {iOwe ? "-" : "+"}
                                        {formatVND(entry.amount)}
                                    </Badge>
                                </div>
                            );
                        })}
                    </Card>
                </div>
            )}

            {/* Recent expenses */}
            <div className="px-4 animate-fade-in-up stagger-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gradient">
                        Recent Expenses
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 underline-animate"
                        asChild
                    >
                        <Link href="/history">
                            View All <ArrowRightIcon className="size-3" />
                        </Link>
                    </Button>
                </div>
                {recentExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        No expenses yet
                    </p>
                ) : (
                    <Card className="py-2 divide-y divide-border/50 border border-primary/10 glass hover-lift">
                        {recentExpenses.map((expense) => {
                            const myShare = expense.shares.find(
                                (s) => s.memberId === currentMemberId,
                            );
                            return (
                                <div
                                    key={expense.expenseId}
                                    className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/30"
                                >
                                    <ExpenseCategoryIcon
                                        title={expense.title}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {expense.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {expense.paidByMemberName} &middot;{" "}
                                            {new Date(
                                                expense.occurredAt,
                                            ).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold font-mono tabular-nums">
                                            {formatVND(expense.amount)}
                                        </p>
                                        {myShare && (
                                            <p className="text-xs text-muted-foreground tabular-nums font-mono">
                                                You: {formatVND(myShare.amount)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Card>
                )}
            </div>

            {/* Add CTA */}
            <div className="px-4 animate-fade-in-up stagger-5">
                <Button
                    asChild
                    className="w-full gap-2 shadow-lg animate-pulse-glow"
                    size="lg"
                >
                    <Link href="/expense">
                        <PlusIcon className="size-5" />
                        Add New Expense
                    </Link>
                </Button>
            </div>
        </div>
    );
}
