"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
    ArrowUpDown,
    EyeIcon,
    MoreHorizontalIcon,
    PencilIcon,
    Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExpenseRow } from "@/features/expense/types";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

function SortableHeader({
    label,
    column,
}: {
    label: string;
    column: {
        getIsSorted: () => false | "asc" | "desc";
        toggleSorting: (desc?: boolean) => void;
    };
}) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {label}
            <ArrowUpDown className="ml-2 size-4" />
        </Button>
    );
}

export function getExpenseColumns({
    onView,
    onEdit,
    onDelete,
}: {
    onView: (expense: ExpenseRow) => void;
    onEdit: (expense: ExpenseRow) => void;
    onDelete: (expense: ExpenseRow) => void;
}): ColumnDef<ExpenseRow>[] {
    return [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <SortableHeader label="Khoản chi" column={column} />
            ),
            cell: ({ row }) => (
                <button
                    type="button"
                    className="font-medium underline underline-offset-4"
                    onClick={(event) => {
                        event.stopPropagation();
                        onView(row.original);
                    }}
                >
                    {row.original.title}
                </button>
            ),
        },
        {
            accessorKey: "paidByName",
            header: ({ column }) => (
                <SortableHeader label="Người trả" column={column} />
            ),
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <SortableHeader label="Số tiền" column={column} />
            ),
            cell: ({ row }) => (
                <span className="font-semibold tabular-nums">
                    {formatCurrency(row.original.amount)}
                </span>
            ),
        },
        {
            accessorKey: "shareCount",
            header: ({ column }) => (
                <SortableHeader label="Số người" column={column} />
            ),
            cell: ({ row }) => `${row.original.shareCount} người`,
        },
        {
            accessorKey: "occurredAt",
            header: ({ column }) => (
                <SortableHeader label="Ngày chi" column={column} />
            ),
            cell: ({ row }) => formatDate(row.original.occurredAt),
        },
        {
            id: "actions",
            header: "Thao tác",
            enableSorting: false,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            data-no-row-open="true"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <MoreHorizontalIcon className="size-4" />
                            <span className="sr-only">Mở thao tác</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(event) => {
                                event.stopPropagation();
                                onView(row.original);
                            }}
                        >
                            <EyeIcon className="size-4" />
                            Xem
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit(row.original);
                            }}
                        >
                            <PencilIcon className="size-4" />
                            Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete(row.original);
                            }}
                        >
                            <Trash2Icon className="size-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}
