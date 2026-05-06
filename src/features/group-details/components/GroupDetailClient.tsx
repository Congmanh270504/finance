"use client";

import Link from "next/link";
import {
    ArrowRightLeft,
    Clock3,
    LayoutGrid,
    LayoutList,
    Search,
    SlidersHorizontal,
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
    const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
    const [selectedEntry, setSelectedEntry] =
        React.useState<GroupLedgerHistoryRow | null>(null);

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
            },
            {
                title: "Active Debts",
                value: detail.group.currentLedgerCount,
                icon: ArrowRightLeft,
            },
            {
                title: "Outstanding Total",
                value: formatCurrency(detail.group.totalOutstanding),
                icon: WalletCards,
            },
            {
                title: "History Events",
                value: detail.group.historyEventCount,
                icon: Clock3,
            },
        ],
        [detail.group],
    );

    const renderFilterControls = () => (
        <>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    defaultValue={detail.filters.query}
                    className="pl-9"
                    placeholder="Search by source, member, or note"
                    onChange={(event) =>
                        updateParams({
                            query: event.target.value.trim() || null,
                        })
                    }
                />
            </div>

            <Select
                value={detail.filters.memberId || "all"}
                onValueChange={(value) =>
                    updateParams({
                        memberId: value === "all" ? null : value,
                    })
                }
            >
                <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All members</SelectItem>
                    {detail.memberOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                            {member.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                type="button"
                variant="outline"
                onClick={() =>
                    updateParams({
                        query: null,
                        memberId: null,
                    })
                }
            >
                Clear filters
            </Button>
        </>
    );

    return (
        <div className="space-y-5 px-4 pb-6 pt-4">
            <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-white via-primary/5 to-white shadow-sm">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                    {detail.group.currency}
                                </Badge>
                                <Badge variant="secondary">
                                    {detail.group.historyEventCount} events
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {detail.group.name}
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                    Track current balances and review every debt
                                    increase or decrease recorded in this group.
                                </p>
                            </div>
                        </div>

                        <Button asChild variant="outline">
                            <Link href="/members">
                                Back to member management
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card) => (
                    <OverviewCard key={card.title} data={card} />
                ))}
            </div>

            <Card className="border-primary/10 bg-white/90 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">
                                Current Balances
                            </CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Snapshot showing who currently owes whom.
                            </p>
                        </div>
                        <Badge variant="outline">
                            {detail.currentBalances.length} debt pairs
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {detail.currentBalances.length > 0 ? (
                        detail.currentBalances.map((balance) => (
                            <Card
                                key={balance.id}
                                className="border-border/70 bg-gradient-to-br from-background to-muted/30"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                Debtor
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {balance.fromMemberName}
                                            </p>
                                        </div>
                                        <ArrowRightLeft className="mt-1 size-4 text-muted-foreground" />
                                        <div className="text-right">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                Creditor
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {balance.toMemberName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-center">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                                            Outstanding
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-amber-800 tabular-nums">
                                            {formatCurrency(balance.amount)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                            This group currently has no outstanding balances.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-primary/10 bg-white/90 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Balance Change History
                            </CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Each event is stored separately to explain how
                                the current snapshot changed over time.
                            </p>
                        </div>
                        <Badge variant="outline">
                            {detail.pagination.total} results
                        </Badge>
                    </div>

                    <div className="hidden gap-3 md:flex md:flex-row md:items-center">
                        {renderFilterControls()}
                    </div>

                    <div className="flex items-center justify-between gap-2 md:hidden">
                        <div className="flex rounded-xl border border-border bg-muted/40 p-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={[
                                    "rounded-lg px-3",
                                    viewMode === "table"
                                        ? "bg-background shadow-sm"
                                        : "text-muted-foreground",
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
                                    viewMode === "card"
                                        ? "bg-background shadow-sm"
                                        : "text-muted-foreground",
                                ].join(" ")}
                                onClick={() => setViewMode("card")}
                            >
                                <LayoutGrid className="size-4" />
                            </Button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFilterSheetOpen(true)}
                        >
                            <SlidersHorizontal className="size-4" />
                            Filters
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div
                        className={
                            viewMode === "card" ? "hidden md:block" : "block"
                        }
                    >
                        <DataTable
                            columns={columns}
                            data={detail.history}
                            emptyMessage="No matching balance history found"
                            pagination={detail.pagination}
                            onRowClick={setSelectedEntry}
                            enableSearch={false}
                        />
                    </div>

                    <div
                        className={[
                            "grid gap-3 md:hidden",
                            viewMode === "card" ? "grid" : "hidden",
                        ].join(" ")}
                    >
                        {detail.history.length > 0 ? (
                            detail.history.map((entry) => {
                                const isIncrease = entry.deltaAmount >= 0;

                                return (
                                    <Card
                                        key={entry.id}
                                        className="border-border/70 bg-gradient-to-br from-background to-muted/20"
                                    >
                                        <CardContent className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        {entry.fromMemberName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        owes{" "}
                                                        {entry.toMemberName}
                                                    </p>
                                                </div>
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

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {entry.sourceLabel}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        entry.occurredAt,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <div
                                                    className={[
                                                        "text-sm font-semibold tabular-nums",
                                                        isIncrease
                                                            ? "text-emerald-700"
                                                            : "text-amber-700",
                                                    ].join(" ")}
                                                >
                                                    {isIncrease ? "+" : "-"}
                                                    {formatCurrency(
                                                        Math.abs(
                                                            entry.deltaAmount,
                                                        ),
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
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
                            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6 text-sm text-muted-foreground">
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

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle>History Filters</SheetTitle>
                        <SheetDescription>
                            Narrow the list by member or related content.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-3 p-4 pt-0">
                        {renderFilterControls()}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
