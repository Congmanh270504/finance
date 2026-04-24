"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon, TablePropertiesIcon } from "lucide-react";
import DeleteDialog from "@/components/delete-dialog";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteExpenseAction } from "@/features/expense/action";
import { ExpenseDetailDialog } from "@/features/expense/components/ExpenseDetailDialog";
import { NewExpenseForm } from "@/features/expense/components/NewExpenseForm";
import { getExpenseColumns } from "@/features/expense/components/columns";
import type {
    ExpenseFormGroup,
    ExpenseListPagination,
    ExpenseRow,
} from "@/features/expense/types";

export default function ExpenseClient({
    initialData,
    initialPagination,
    initialQuery,
    source,
    groups,
    currentMemberId,
    initialGroupId,
}: {
    initialData: ExpenseRow[];
    initialPagination: ExpenseListPagination;
    initialQuery?: string;
    source: "database" | "demo";
    groups: ExpenseFormGroup[];
    currentMemberId: string;
    initialGroupId: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
    const [isPending, startTransition] = useTransition();

    const columns = getExpenseColumns({
        onView: setSelectedExpense,
        onEdit: (expense) => {
            toast.info("Edit flow is not available yet", {
                description: `You can currently view or delete "${expense.title}".`,
            });
        },
        onDelete: setDeleteTarget,
    });

    const updateQueryParam = (query: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (query) {
            params.set("query", query);
        } else {
            params.delete("query");
        }

        params.delete("page");

        const nextUrl = params.toString()
            ? `/expense?${params.toString()}`
            : "/expense";

        startTransition(() => {
            router.replace(nextUrl);
        });
    };

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

    return (
        <div className="space-y-4 px-4 pb-6 pt-3">
            <div className="flex flex-col gap-3 rounded-2xl border bg-white/80 p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <TablePropertiesIcon className="size-5 text-primary" />
                            <h1 className="text-lg font-bold">
                                Expense Table
                            </h1>
                            {source === "demo" ? (
                                <Badge variant="warning">Demo data</Badge>
                            ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Review all expenses in table view and open each row
                            for more details.
                        </p>
                    </div>

                    <Button onClick={() => setCreateOpen(true)}>
                        <PlusIcon className="size-4" />
                        Add expense
                    </Button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative max-w-md flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            defaultValue={initialQuery}
                            placeholder="Search by expense title or payer"
                            className="pl-9"
                            onChange={(event) =>
                                updateQueryParam(event.target.value.trim())
                            }
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {initialPagination.total} expenses
                        {isPending ? " • updating..." : ""}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={initialData}
                    emptyMessage="No matching expenses found"
                    pagination={initialPagination}
                    onRowClick={setSelectedExpense}
                />
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
                            <strong>{deleteTarget.title}</strong> will be removed
                            from the expense table.
                        </>
                    ) : undefined
                }
            />
        </div>
    );
}
