"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, SearchIcon, TablePropertiesIcon } from "lucide-react";
import Link from "next/link";
import DeleteDialog from "@/components/delete-dialog";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deleteExpenseAction } from "@/features/expense/action";
import { ExpenseDetailDialog } from "@/features/expense/components/ExpenseDetailDialog";
import { getExpenseColumns } from "@/features/expense/components/columns";
import type { ExpenseListPagination, ExpenseRow } from "@/features/expense/types";

export default function ExpenseClient({
    initialData,
    initialPagination,
    initialQuery,
    source,
}: {
    initialData: ExpenseRow[];
    initialPagination: ExpenseListPagination;
    initialQuery?: string;
    source: "database" | "demo";
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
    const [isPending, startTransition] = useTransition();

    const columns = getExpenseColumns({
        onView: setSelectedExpense,
        onEdit: (expense) => {
            toast.info("Luồng sửa chưa được triển khai", {
                description: `Tạm thời chỉ hỗ trợ xem hoặc xóa khoản "${expense.title}".`,
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
                toast.error("Không thể xóa khoản chi", {
                    description: result.error,
                });
                return;
            }

            toast.success("Đã xóa khoản chi", {
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
                                Bảng khoản chi
                            </h1>
                            {source === "demo" ? (
                                <Badge variant="warning">Demo data</Badge>
                            ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Theo dõi toàn bộ khoản chi theo dạng bảng và mở
                            nhanh chi tiết từng dòng.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/new-expense">
                            <PlusIcon className="size-4" />
                            Thêm khoản chi
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative max-w-md flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            defaultValue={initialQuery}
                            placeholder="Tìm theo tên khoản chi hoặc người trả"
                            className="pl-9"
                            onChange={(event) =>
                                updateQueryParam(event.target.value.trim())
                            }
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {initialPagination.total} khoản chi
                        {isPending ? " • đang cập nhật..." : ""}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <DataTable
                    columns={columns}
                    data={initialData}
                    emptyMessage="Chưa có khoản chi phù hợp"
                    pagination={initialPagination}
                    onRowClick={setSelectedExpense}
                />
            </div>

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
                title="Xóa khoản chi"
                description={
                    deleteTarget ? (
                        <>
                            Khoản <strong>{deleteTarget.title}</strong> sẽ bị
                            xóa khỏi bảng chi tiêu.
                        </>
                    ) : undefined
                }
            />
        </div>
    );
}
