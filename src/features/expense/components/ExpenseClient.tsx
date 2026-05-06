"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
    LayoutGrid,
    LayoutList,
    PlusIcon,
    TablePropertiesIcon,
} from "lucide-react";
import DeleteDialog from "@/components/delete-dialog";
import { DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deleteExpenseAction } from "@/features/expense/action";
import { ExpenseDetailDialog } from "@/features/expense/components/ExpenseDetailDialog";
import { NewExpenseForm } from "@/features/expense/components/NewExpenseForm";
import { getExpenseColumns } from "@/features/expense/components/columns";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
    ExpenseFormGroup,
    ExpenseListPagination,
    ExpenseRow,
} from "@/features/expense/types";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function ExpenseClient({
    initialData,
    initialPagination,
    source,
    groups,
    currentMemberId,
    initialGroupId,
}: {
    initialData: ExpenseRow[];
    initialPagination: ExpenseListPagination;
    source: "database" | "demo";
    groups: ExpenseFormGroup[];
    currentMemberId: string;
    initialGroupId: string;
}) {
    const router = useRouter();
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
    const [isPending, startTransition] = useTransition();
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<"table" | "card">(
        isMobile ? "card" : "table",
    );

    const columns = getExpenseColumns({
        onView: setSelectedExpense,
        onEdit: (expense) => {
            toast.info("Edit flow is not available yet", {
                description: `You can currently view or delete "${expense.title}".`,
            });
        },
        onDelete: setDeleteTarget,
    });

    const handleDelete = () => {
        if (!deleteTarget) return;

        startTransition(async () => {
            const result = await deleteExpenseAction({ id: deleteTarget.id });

            if (!result.success) {
                toast.error("Failed to delete expense", {
                    description: result.error,
                });
                return;
            }

            toast.success("Expense deleted", {
                description: deleteTarget.title,
            });
            setDeleteTarget(null);
            setSelectedExpense((current) =>
                current?.id === deleteTarget.id ? null : current,
            );
            router.refresh();
        });
    };

    const viewModeToggle = (
        <div className="md:hidden flex border border-border rounded-lg bg-muted/40 p-1 gap-1">
            <Button
                onClick={() => setViewMode("table")}
                className={cn(
                    "flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all",
                    viewMode === "table"
                        ? "bg-background text-primary shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted",
                )}
                variant="ghost"
                size="sm"
            >
                <LayoutList className="w-3.5 h-3.5" />
                Table
            </Button>
            <Button
                onClick={() => setViewMode("card")}
                className={cn(
                    "flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all",
                    viewMode === "card"
                        ? "bg-background text-primary shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted",
                )}
                variant="ghost"
                size="sm"
            >
                <LayoutGrid className="w-3.5 h-3.5" />
                Card
            </Button>
        </div>
    );

    return (
        <div className="space-y-4 px-4 pb-6 pt-3">
            <div className="flex flex-col gap-3 rounded-2xl border bg-white/80 p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <TablePropertiesIcon className="size-5 text-primary" />
                            <h1 className="text-lg font-bold">Expense Table</h1>
                            {source === "demo" ? (
                                <Badge variant="warning">Demo data</Badge>
                            ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Review all expenses in table view and open each row
                            for more details.
                        </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        {initialPagination.total} expenses
                        {isPending ? " - updating..." : ""}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {viewMode === "table" ? (
                    <DataTable
                        columns={columns}
                        data={initialData}
                        emptyMessage="No matching expenses found"
                        pagination={initialPagination}
                        onRowClick={setSelectedExpense}
                        searchPlaceholder="Search by expense title or payer"
                        actions={[
                            viewModeToggle,
                            {
                                label: "Add expense",
                                icon: <PlusIcon className="size-4" />,
                                onClick: () => setCreateOpen(true),
                            },
                        ]}
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-between gap-2 p-2">
                            {viewModeToggle}
                            <Button
                                size="sm"
                                onClick={() => setCreateOpen(true)}
                                className="h-8 gap-1"
                            >
                                <PlusIcon className="size-4" />
                                Add expense
                            </Button>
                        </div>
                        <div className="space-y-3 p-3 pt-0">
                            {initialData.length === 0 ? (
                                <p className="py-6 text-center text-sm italic text-muted-foreground">
                                    No matching expenses found
                                </p>
                            ) : (
                                initialData.map((expense) => (
                                    <ExpenseCard
                                        key={expense.id}
                                        expense={expense}
                                        onView={setSelectedExpense}
                                        onEdit={(e) =>
                                            toast.info(
                                                "Edit flow is not available yet",
                                                {
                                                    description: `You can currently view or delete "${e.title}".`,
                                                },
                                            )
                                        }
                                        onDelete={setDeleteTarget}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            <NewExpenseForm
                open={createOpen}
                onOpenChange={setCreateOpen}
                groups={groups}
                currentMemberId={currentMemberId}
                initialGroupId={initialGroupId}
            />

            <ExpenseDetailDialog
                expense={selectedExpense}
                open={!!selectedExpense}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedExpense(null);
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
                loading={isPending}
                title="Delete expense"
                description={
                    deleteTarget ? (
                        <>
                            <strong>{deleteTarget.title}</strong> will be
                            removed from the expense table.
                        </>
                    ) : undefined
                }
            />
        </div>
    );
}

function ExpenseCard({
    expense,
    onView,
    onEdit,
    onDelete,
}: {
    expense: ExpenseRow;
    onView: (expense: ExpenseRow) => void;
    onEdit: (expense: ExpenseRow) => void;
    onDelete: (expense: ExpenseRow) => void;
}) {
    return (
        <Card
            className="cursor-pointer border border-border transition-colors hover:bg-muted/30"
            onClick={() => onView(expense)}
        >
            <CardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">
                        {expense.title}
                    </CardTitle>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatCurrency(expense.amount)}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {expense.groupName}
                </p>
            </CardHeader>
            <CardContent className="space-y-1 p-3 pt-0">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Người trả</span>
                    <span>{expense.paidByName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Số người</span>
                    <span>{expense.shareCount} người</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Ngày chi</span>
                    <span>{formatDate(expense.occurredAt)}</span>
                </div>
                <div
                    className="flex items-center justify-between border p-2 rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs text-sky-600"
                        onClick={() => onView(expense)}
                    >
                        Xem
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs text-amber-600"
                        onClick={() => onEdit(expense)}
                    >
                        Sửa
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs text-rose-600"
                        onClick={() => onDelete(expense)}
                    >
                        Xóa
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
