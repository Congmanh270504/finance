"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import { EmptyState } from "@/features/finance/components/shared/EmptyState";
import { ExpenseCategoryIcon } from "@/features/finance/components/shared/expense-icon";
import type { ExpenseHistoryResponseV1 } from "@/features/finance/type";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function ExpenseHistoryClient({
    history,
    currentMemberId,
    isDemo,
}: {
    history: ExpenseHistoryResponseV1;
    currentMemberId: string;
    isDemo?: boolean;
}) {
    const [search, setSearch] = React.useState("");

    const filtered = history.items.filter(
        (e) =>
            search === "" ||
            e.title.toLowerCase().includes(search.toLowerCase()),
    );
    const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

    const grouped = React.useMemo(() => {
        const map = new Map<string, typeof filtered>();
        for (const e of filtered) {
            const key = e.occurredAt.slice(0, 10);
            const list = map.get(key) ?? [];
            list.push(e);
            map.set(key, list);
        }
        return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
    }, [filtered]);

    return (
        <div className="flex flex-col gap-3 pb-4">
            {isDemo && (
                <div className="mx-4 mt-3 rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
                    Demo mode – sample data
                </div>
            )}
            <div className="px-4 pt-3 animate-fade-in-down">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 glass border-primary/15 focus:border-primary/40"
                    />
                </div>
            </div>
            {filtered.length > 0 && (
                <div className="px-4 flex items-center justify-between animate-fade-in">
                    <p className="text-xs text-muted-foreground">
                        {filtered.length} khoản chi
                    </p>
                    <p className="text-xs font-semibold font-mono tabular-nums text-gradient">
                        {formatVND(totalFiltered)}
                    </p>
                </div>
            )}
            {grouped.length === 0 ? (
                <EmptyState
                    icon="📊"
                    title="Not Found"
                    description="Try a different keyword"
                    className="mt-6"
                />
            ) : (
                <div className="space-y-4 px-4">
                    {grouped.map(([dateKey, dayExpenses], groupIdx) => (
                        <div
                            key={dateKey}
                            className={`animate-fade-in-up stagger-${Math.min(groupIdx + 1, 8)}`}
                        >
                            <p className="text-xs text-muted-foreground mb-2 font-mono font-medium uppercase tracking-wide">
                                {formatDate(dayExpenses[0].occurredAt)}
                            </p>
                            <Card className="py-0 divide-y divide-border/50 border border-primary/10 glass hover-lift">
                                {dayExpenses.map((expense) => {
                                    const myShare = expense.shares.find(
                                        (s) => s.memberId === currentMemberId,
                                    );
                                    const iPaid =
                                        expense.paidByMemberId ===
                                        currentMemberId;
                                    return (
                                        <div
                                            key={expense.expenseId}
                                            className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/30"
                                        >
                                            <ExpenseCategoryIcon
                                                title={expense.title}
                                                size="size-10"
                                                iconSize="size-5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {expense.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <MemberAvatar
                                                        name={
                                                            expense.paidByMemberName
                                                        }
                                                        size="sm"
                                                        className="size-4 text-[8px]"
                                                    />
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {iPaid
                                                            ? "You paid"
                                                            : `${expense.paidByMemberName} paid`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-semibold font-mono tabular-nums">
                                                    {formatVND(expense.amount)}
                                                </p>
                                                {myShare && !iPaid && (
                                                    <Badge
                                                        variant="warning"
                                                        className="text-[10px] mt-0.5 tabular-nums font-mono"
                                                    >
                                                        -
                                                        {formatVND(
                                                            myShare.amount,
                                                        )}
                                                    </Badge>
                                                )}
                                                {iPaid && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] mt-0.5"
                                                    >
                                                        You paid
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
