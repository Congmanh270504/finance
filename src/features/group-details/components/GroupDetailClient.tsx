"use client";

import Link from "next/link";
import {
    ArrowRightLeft,
    Clock3,
    LayoutGrid,
    LayoutList,
    Users,
    WalletCards,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    OverviewCard,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GroupLedgerHistoryDialog } from "@/features/group-details/components/GroupLedgerHistoryDialog";
import { getGroupLedgerHistoryColumns } from "@/features/group-details/components/columns";
import type {
    GroupLedgerDetailResult,
    GroupLedgerHistoryRow,
} from "@/features/group-details/types";

function formatCurrency(amount: number) {
    return `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;
}

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export function GroupDetailClient({
    detail,
}: {
    detail: GroupLedgerDetailResult;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = React.useState<"table" | "card">(
        isMobile ? "card" : "table",
    );
    const [selectedEntry, setSelectedEntry] =
        React.useState<GroupLedgerHistoryRow | null>(null);
    const resolvedViewMode = isMobile ? "card" : viewMode;

    const columns = React.useMemo(
        () =>
            getGroupLedgerHistoryColumns({
                onView: setSelectedEntry,
            }),
        [],
    );

    const updateParams = React.useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value && value.trim()) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });

            params.delete("page");

            const nextUrl = params.toString()
                ? `${pathname}?${params.toString()}`
                : pathname;

            router.replace(nextUrl);
        },
        [pathname, router, searchParams],
    );

    const overviewCards = React.useMemo(
        () => [
            {
                title: "Members",
                value: detail.group.memberCount,
                icon: Users,
                className:
                    "dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass",
            },
            {
                title: "Active Debts",
                value: detail.group.currentLedgerCount,
                icon: ArrowRightLeft,
                className:
                    "dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass",
            },
            {
                title: "Outstanding Total",
                value: formatCurrency(detail.group.totalOutstanding),
                icon: WalletCards,
                className:
                    "dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass",
            },
            {
                title: "History Events",
                value: detail.group.historyEventCount,
                icon: Clock3,
                className:
                    "dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass",
            },
        ],
        [detail.group],
    );

    return (
        <div className="space-y-5 px-4 pb-6 pt-4">
            <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-white via-primary/5 to-white shadow-sm dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur"
                                >
                                    {detail.group.currency}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur"
                                >
                                    {detail.group.historyEventCount} events
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight dark:text-slate-50">
                                    {detail.group.name}
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm text-muted-foreground dark:text-slate-300/90">
                                    Track current balances and review every debt
                                    increase or decrease recorded in this group.
                                </p>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur dark:hover:bg-white/15"
                        >
                            <Link href="/members">
                                Back to member management
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4  md:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card) => (
                    <OverviewCard
                        key={card.title}
                        data={card}
                        className={card.className}
                    />
                ))}
            </div>

            <Card className="border-primary/10 bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between gap-2 text-base">
                        Current Balances
                        <Badge
                            variant="outline"
                            className="dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur"
                        >
                            {detail.currentBalances.length} debt pairs
                        </Badge>
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300/90">
                        Snapshot showing who currently owes whom.
                    </p>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {detail.currentBalances.length > 0 ? (
                        detail.currentBalances.map((balance) => (
                            <Card
                                key={balance.id}
                                className="border-border/70 bg-gradient-to-br from-background to-muted/30 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_50px_-28px_rgba(0,0,0,0.9)] dark:backdrop-blur-xl dark-card-glass"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground dark:text-slate-300/80">
                                                Debtor
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {balance.fromMemberName}
                                            </p>
                                        </div>
                                        <ArrowRightLeft className="mt-1 size-4 text-muted-foreground dark:text-cyan-200/75" />
                                        <div className="text-right">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground dark:text-slate-300/80">
                                                Creditor
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {balance.toMemberName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-center dark:border dark:border-white/10 dark:bg-gradient-to-br dark:from-amber-400/15 dark:to-cyan-400/10 dark:backdrop-blur-md">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-primary">
                                            Outstanding
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-amber-800 tabular-nums dark:text-primary">
                                            {formatCurrency(balance.amount)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6 text-sm text-muted-foreground dark:border-white/15 dark:bg-white/8 dark:text-slate-300/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:col-span-2 xl:col-span-3">
                            This group currently has no outstanding balances.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-primary/10 bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-100 dark:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.85)] dark:backdrop-blur-2xl dark-card-glass">
                <CardHeader className="">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Balance Change History
                            </CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300/90">
                                Each event is stored separately to explain how
                                the current snapshot changed over time.
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="max-sm:hidden dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur"
                        >
                            {detail.pagination.total} results
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-2 md:hidden">
                        <div className="flex rounded-xl border border-border bg-muted/40 p-1 dark:border-white/10 dark:bg-white/10 dark:backdrop-blur">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={[
                                    "rounded-lg px-3",
                                    resolvedViewMode === "table"
                                        ? "bg-background shadow-sm dark:bg-white/12 dark:text-slate-100"
                                        : "text-muted-foreground dark:text-slate-300/70",
                                ].join(" ")}
                                onClick={() => setViewMode("table")}
                            >
                                <LayoutList className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={[
                                    "rounded-lg px-3",
                                    resolvedViewMode === "card"
                                        ? "bg-background shadow-sm dark:bg-white/12 dark:text-slate-100"
                                        : "text-muted-foreground dark:text-slate-300/70",
                                ].join(" ")}
                                onClick={() => setViewMode("card")}
                            >
                                <LayoutGrid className="size-4" />
                            </Button>
                        </div>

                        <Select
                            value={detail.filters.memberId || "all"}
                            onValueChange={(value) =>
                                updateParams({
                                    memberId: value === "all" ? null : value,
                                })
                            }
                        >
                            <SelectTrigger className="h-8 w-full md:w-[220px] dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur">
                                <SelectValue placeholder="Filter by member" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All members</SelectItem>
                                {detail.memberOptions.map((member) => (
                                    <SelectItem
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div
                        className={
                            resolvedViewMode === "card"
                                ? "hidden md:block"
                                : "block"
                        }
                    >
                        <DataTable
                            columns={columns}
                            data={detail.history}
                            emptyMessage="No matching balance history found"
                            pagination={detail.pagination}
                            onRowClick={setSelectedEntry}
                            enableSearch
                            actions={[
                                <Select
                                    value={detail.filters.memberId || "all"}
                                    onValueChange={(value) =>
                                        updateParams({
                                            memberId:
                                                value === "all" ? null : value,
                                        })
                                    }
                                    key="member-filter"
                                >
                                    <SelectTrigger className="h-8 w-full md:w-[220px] dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur">
                                        <SelectValue placeholder="Filter by member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All members
                                        </SelectItem>
                                        {detail.memberOptions.map((member) => (
                                            <SelectItem
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>,
                            ]}
                        />
                    </div>

                    <div
                        className={[
                            "grid gap-3 md:hidden",
                            resolvedViewMode === "card" ? "grid" : "hidden",
                        ].join(" ")}
                    >
                        {detail.history.length > 0 ? (
                            detail.history.map((entry) => {
                                const isIncrease = entry.deltaAmount >= 0;

                                return (
                                    <Card
                                        key={entry.id}
                                        className="border-border/70 bg-gradient-to-br from-background to-muted/20 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_50px_-28px_rgba(0,0,0,0.9)] dark:backdrop-blur-xl dark-card-glass"
                                    >
                                        <CardContent className="space-y-3 p-4">
                                            <div className=" ">
                                                <div className="flex items-start justify-between">
                                                    <p className="font-semibold">
                                                        {entry.fromMemberName}
                                                    </p>

                                                    <Badge
                                                        variant={
                                                            isIncrease
                                                                ? "success"
                                                                : "warning"
                                                        }
                                                    >
                                                        {entry.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground dark:text-slate-300/80">
                                                    owes {entry.toMemberName}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 items-center gap-2">
                                                <p className="col-span-2 text-sm font-medium">
                                                    {entry.sourceLabel}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground dark:text-slate-300/80">
                                                    {formatDateTime(
                                                        entry.occurredAt,
                                                    )}
                                                </p>
                                                <div
                                                    className={[
                                                        "mt-1 text-sm font-semibold tabular-nums",
                                                        isIncrease
                                                            ? "text-emerald-700 dark:text-emerald-300"
                                                            : "text-amber-700 dark:text-amber-200",
                                                    ].join(" ")}
                                                >
                                                    {isIncrease ? "+" : "-"}
                                                    {formatCurrency(
                                                        Math.abs(
                                                            entry.deltaAmount,
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur dark:hover:bg-white/15"
                                                    onClick={() =>
                                                        setSelectedEntry(entry)
                                                    }
                                                >
                                                    View details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6 text-sm text-muted-foreground dark:border-white/15 dark:bg-white/8 dark:text-slate-300/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                No balance history matches the current filters.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <GroupLedgerHistoryDialog
                entry={selectedEntry}
                open={!!selectedEntry}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedEntry(null);
                    }
                }}
            />
        </div>
    );
}
