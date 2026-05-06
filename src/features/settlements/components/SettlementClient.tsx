"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutGrid,
    LayoutList,
    PlusIcon,
    SearchIcon,
    WalletCardsIcon,
} from "lucide-react";
import DeleteDialog from "@/components/delete-dialog";
import { ActionIconButton } from "@/components/action-icon-button";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/table/Pagination";
import { deleteSettlementAction } from "@/features/settlements/action";
import { SettlementDetailDialog } from "@/features/settlements/components/SettlementDetailDialog";
import { SettlementDialog } from "@/features/settlements/components/SettlementDialog";
import { getSettlementColumns } from "@/features/settlements/components/columns";
import type {
    SettlementListResult,
    SettlementRow,
} from "@/features/settlements/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

function formatDate(value: string | Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function settlementCardLabel(item: SettlementRow) {
    return item.direction === "outgoing"
        ? `You paid ${item.toMemberName}`
        : `${item.fromMemberName} paid you`;
}

function SummaryCard({
    title,
    value,
    tone,
}: {
    title: string;
    value: string;
    tone: "emerald" | "violet" | "rose";
}) {
    const colorMap = {
        emerald: "text-emerald-600 dark:text-emerald-400",
        violet: "text-violet-600 dark:text-violet-400",
        rose: "text-rose-600 dark:text-rose-400",
    } as const;

    return (
        <Card className="gap-1 py-3 border border-primary/10 bg-background/80 shadow-sm">
            <CardHeader className="px-3 pb-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
                <p
                    className={cn(
                        "font-mono text-lg font-bold tabular-nums",
                        colorMap[tone],
                    )}
                >
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function SettlementCard({
    item,
    currentMemberId,
    onView,
    onEdit,
    onDelete,
}: {
    item: SettlementRow;
    currentMemberId: string;
    onView: (item: SettlementRow) => void;
    onEdit: (item: SettlementRow) => void;
    onDelete: (item: SettlementRow) => void;
}) {
    const canMutate = item.fromMemberId === currentMemberId;
    const isOutgoing = item.direction === "outgoing";

    return (
        <Card
            className="overflow-hidden border border-primary/10 bg-background/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onView(item)}
        >
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {settlementCardLabel(item)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.groupName} - {formatDate(item.settledAt)}
                        </p>
                    </div>
                    <div
                        className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                            isOutgoing
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
                        )}
                    >
                        {isOutgoing ? "-" : "+"}
                        {formatCurrency(item.amount)}
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/20 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Note
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm">
                        {item.note?.trim() || "Payment"}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-1">
                    <ActionIconButton label="View" onClick={() => onView(item)}>
                        <Wallet className="size-4 text-sky-600" />
                    </ActionIconButton>
                    {canMutate ? (
                        <>
                            <ActionIconButton
                                label="Edit"
                                onClick={() => onEdit(item)}
                            >
                                <Pencil className="size-4 text-amber-600" />
                            </ActionIconButton>
                            <ActionIconButton
                                label="Delete"
                                onClick={() => onDelete(item)}
                                variant="outline"
                            >
                                <Trash2 className="size-4 text-rose-600" />
                            </ActionIconButton>
                        </>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export function SettlementClient({ data }: { data: SettlementListResult }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = React.useState(data.filters.query);
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = React.useState<"table" | "card">(
        isMobile ? "card" : "table",
    );
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editSettlement, setEditSettlement] =
        React.useState<SettlementRow | null>(null);
    const [viewSettlement, setViewSettlement] =
        React.useState<SettlementRow | null>(null);
    const [deleteTarget, setDeleteTarget] =
        React.useState<SettlementRow | null>(null);

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchInput(data.filters.query);
    }, [data.filters.query]);

    React.useEffect(() => {
        const handle = window.setTimeout(() => {
            const currentQuery = searchParams.get("q") ?? "";
            const value = searchInput.trim();

            if (value === currentQuery.trim()) {
                return;
            }

            const params = new URLSearchParams(searchParams.toString());

            if (value) {
                params.set("q", value);
            } else {
                params.delete("q");
            }

            params.delete("page");
            const next = params.toString();
            router.replace(next ? `${pathname}?${next}` : pathname);
        }, 300);

        return () => {
            window.clearTimeout(handle);
        };
    }, [pathname, router, searchInput, searchParams]);

    const columns = React.useMemo(
        () =>
            getSettlementColumns({
                currentMemberId: data.currentMemberId,
                onView: setViewSettlement,
                onEdit: setEditSettlement,
                onDelete: setDeleteTarget,
            }),
        [data.currentMemberId],
    );

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

    function handleDelete() {
        if (!deleteTarget) return;

        void deleteSettlementAction({ id: deleteTarget.id }).then((result) => {
            if (!result.success) {
                toast.error("Failed to delete payment", {
                    description: result.error,
                });
                return;
            }

            toast.success("Payment deleted", {
                description: deleteTarget.groupName,
            });
            setDeleteTarget(null);
            setViewSettlement((current) =>
                current?.id === deleteTarget.id ? null : current,
            );
            router.refresh();
        });
    }

    const totalPages =
        data.pagination.limit > 0
            ? Math.ceil(data.pagination.total / data.pagination.limit)
            : 0;

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
    return (
        <div className="space-y-4 px-4 pb-6 pt-3">
            <div className="flex flex-col gap-3 rounded-2xl border bg-background/80 p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <WalletCardsIcon className="size-5 text-primary" />
                            <h1 className="text-lg font-bold">Settlements</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Save repayments, update the balance ledger, and keep
                            monthly payment stats in sync.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setCreateOpen(true)}
                        >
                            <PlusIcon className="size-4" />
                            Add payment
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard
                        title="Paid"
                        value={formatCurrency(data.summary.totalOutgoing)}
                        tone="rose"
                    />
                    <SummaryCard
                        title="Received"
                        value={formatCurrency(data.summary.totalIncoming)}
                        tone="emerald"
                    />
                    <SummaryCard
                        title="Net"
                        value={`${data.summary.netAmount >= 0 ? "+" : "-"}${formatCurrency(Math.abs(data.summary.netAmount))}`}
                        tone="violet"
                    />
                </div>
            </div>

            {viewMode === "table" ? (
                <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                    <DataTable
                        columns={columns}
                        data={data.items}
                        emptyMessage="No matching payments found"
                        pagination={{
                            ...data.pagination,
                            onPageChange: (page) =>
                                replaceParams({ page: String(page) }),
                        }}
                        onRowClick={setViewSettlement}
                        enableSearch={true}
                        actions={[
                            <div key="view-mode-toggle" className="md:hidden">
                                {viewModeToggle}
                            </div>,
                            <Select
                                key="group-filter"
                                value={data.filters.groupId || "all"}
                                onValueChange={(value) =>
                                    replaceParams({ groupId: value })
                                }
                            >
                                <SelectTrigger className="w-full md:w-56 h-8">
                                    <SelectValue placeholder="All groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All groups
                                    </SelectItem>
                                    {data.groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>,
                        ]}
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    {data.items.length === 0 ? (
                        <Card className="border border-dashed py-10 text-center text-sm text-muted-foreground">
                            No matching payments found
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {data.items.map((item) => (
                                <SettlementCard
                                    key={item.id}
                                    item={item}
                                    currentMemberId={data.currentMemberId}
                                    onView={setViewSettlement}
                                    onEdit={setEditSettlement}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </div>
                    )}
                    <div className="rounded-2xl border bg-background px-3 py-3 shadow-sm">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={data.pagination.page}
                            total={data.pagination.total}
                        />
                    </div>
                </div>
            )}

            <SettlementDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                mode="create"
                groups={data.groups}
                initialGroupId={
                    data.filters.groupId || data.groups[0]?.id || ""
                }
            />

            <SettlementDialog
                open={!!editSettlement}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditSettlement(null);
                    }
                }}
                mode="edit"
                groups={data.groups}
                initialGroupId={
                    editSettlement?.groupId || data.groups[0]?.id || ""
                }
                settlement={editSettlement}
            />

            <SettlementDetailDialog
                settlement={viewSettlement}
                open={!!viewSettlement}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewSettlement(null);
                    }
                }}
            />

            <DeleteDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                onConfirm={handleDelete}
                title="Delete payment"
                description={
                    deleteTarget ? (
                        <>
                            <strong>{deleteTarget.groupName}</strong> will be
                            removed from the payment history.
                        </>
                    ) : undefined
                }
            />
        </div>
    );
}
