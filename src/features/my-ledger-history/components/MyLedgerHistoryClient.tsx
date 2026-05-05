"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/table/DataTable";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutGrid, LayoutList, SlidersHorizontal } from "lucide-react";
import { createMyLedgerHistoryColumns } from "@/features/my-ledger-history/components/columns";
import type {
    MyLedgerHistoryItem,
    MyLedgerHistoryResult,
} from "@/features/my-ledger-history/types";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value) + " â‚«";
}

export function MyLedgerHistoryClient({
    data,
}: {
    data: MyLedgerHistoryResult;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const columns = React.useMemo(() => createMyLedgerHistoryColumns(), []);
    const [viewMode, setViewMode] = React.useState<"table" | "card">("table");
    const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);

    function replaceParams(updates: Record<string, string | null | undefined>) {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (!value || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }

        params.delete("page");
        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname);
    }

    const viewModeToggle = (
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            <Button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                    "flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                    viewMode === "table"
                        ? "bg-background text-primary shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted",
                )}
                variant="ghost"
                size="sm"
            >
                <LayoutList className="h-3.5 w-3.5" />
                Table
            </Button>
            <Button
                type="button"
                onClick={() => setViewMode("card")}
                className={cn(
                    "flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                    viewMode === "card"
                        ? "bg-background text-primary shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted",
                )}
                variant="ghost"
                size="sm"
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                Card
            </Button>
        </div>
    );

    const renderGroupFilterSelect = () => (
        <Select
            key="group-filter"
            value={searchParams.get("groupId") ?? "all"}
            onValueChange={(value) => replaceParams({ groupId: value })}
        >
            <SelectTrigger className="h-8 w-fit min-w-[10rem]">
                <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {data.groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                        {group.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    const mobileFilterButton = (
        <Button
            key="mobile-filter"
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 md:hidden"
            onClick={() => setIsFilterSheetOpen(true)}
        >
            <SlidersHorizontal className="size-4" />
            Filters
        </Button>
    );

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-lg font-bold">My Ledger History</h1>
                <p className="text-xs text-muted-foreground">
                    Track your individual ledger history.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-foreground/75">
                            TÄƒng cÃ´ng ná»£
                        </CardTitle>
                        <CardDescription className="text-2xl font-semibold leading-tight text-foreground">{`+ ${formatCurrency(data.summary.increaseAmount)}`}</CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-foreground/75">
                            Giáº£m cÃ´ng ná»£
                        </CardTitle>
                        <CardDescription className="text-2xl font-semibold leading-tight text-foreground">{`-${formatCurrency(data.summary.decreaseAmount)}`}</CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-foreground/75">
                            RÃ²ng
                        </CardTitle>
                        <CardDescription className="text-2xl font-semibold leading-tight text-foreground">{`${data.summary.netAmount >= 0 ? "+" : "-"} ${formatCurrency(data.summary.netAmount)}`}</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <Card className="py-0">
                <CardContent>
                    {viewMode === "table" ? (
                        <DataTable
                            columns={columns}
                            data={data.items}
                            emptyMessage="ChÆ°a cÃ³ lá»‹ch sá»­ cÃ´ng ná»£ phÃ¹ há»£p."
                            pagination={data.pagination}
                            enableSearch={true}
                            actions={() => [
                                <div
                                    key="view-mode-toggle"
                                    className="md:hidden"
                                >
                                    {viewModeToggle}
                                </div>,
                                mobileFilterButton,
                                <div
                                    key="group-filter-desktop"
                                    className="hidden md:flex"
                                >
                                    {renderGroupFilterSelect()}
                                </div>,
                            ]}
                        />
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2">
                                {viewModeToggle}
                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex">
                                        {renderGroupFilterSelect()}
                                    </div>
                                    {mobileFilterButton}
                                </div>
                            </div>
                            <div className="space-y-3 pb-3">
                                {data.items.length === 0 ? (
                                    <p className="py-6 text-center text-sm italic text-muted-foreground">
                                        ChÆ°a cÃ³ lá»‹ch sá»­ cÃ´ng ná»£ phÃ¹ há»£p.
                                    </p>
                                ) : (
                                    data.items.map((item) => (
                                        <LedgerHistoryCard
                                            key={item.id}
                                            item={item}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle>History filters</SheetTitle>
                        <SheetDescription>
                            Narrow the history by group.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-3 px-4 pb-4 pt-0">
                        {renderGroupFilterSelect()}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function LedgerHistoryCard({ item }: { item: MyLedgerHistoryItem }) {
    return (
        <Card className="border border-border">
            <CardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-medium underline underline-offset-4">
                            {item.groupName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {item.groupCurrency}
                        </p>
                    </div>
                    <span
                        className={cn(
                            "text-sm font-semibold",
                            item.direction === "increase"
                                ? "text-emerald-600"
                                : "text-rose-600",
                        )}
                    >
                        {item.direction === "increase" ? "+" : "-"}
                        {formatCurrency(Math.abs(item.signedAmount))}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-1 p-3 pt-0">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Counterparty</span>
                    <span>{item.counterpartyName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Source</span>
                    <span>{item.sourceLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Date</span>
                    <span>
                        {new Date(item.occurredAt).toLocaleString("vi-VN")}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
