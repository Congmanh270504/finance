"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
    ArrowUpDown,
    Eye,
    EyeIcon,
    MoreHorizontalIcon,
    Pencil,
    PencilIcon,
    Trash2,
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
import { ActionIconButton } from "@/components/action-icon-button";

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
            className="border-none"
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
                <div className="flex justify-center">
                    <SortableHeader label="Khoản chi" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div
                    className="text-center"
                    onClick={(event) => {
                        event.stopPropagation();
                        onView(row.original);
                    }}
                >
                    {row.original.title}
                </div>
            ),
        },
        {
            accessorKey: "paidByName",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Người trả" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.original.paidByName}</div>
            ),
        },
        {
            accessorKey: "groupName",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Tên nhóm" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.original.groupName}</div>
            ),
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Số tiền" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="font-semibold tabular-nums text-center">
                    {formatCurrency(row.original.amount)}
                </div>
            ),
        },
        {
            accessorKey: "shareCount",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Số người" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.shareCount} người
                </div>
            ),
        },
        {
            accessorKey: "occurredAt",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Ngày chi" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    {formatDate(row.original.occurredAt)}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Thao tác</div>,
            enableSorting: false,
            cell: ({ row }) => (
                <div
                    className="flex items-center justify-end gap-1"
                    data-no-row-open="true"
                    onClick={(event) => event.stopPropagation()}
                >
                    <ActionIconButton
                        label="View"
                        onClick={() => onView(row.original)}
                    >
                        <Eye className="size-4 text-sky-600" />
                    </ActionIconButton>
                    <ActionIconButton
                        label="Edit"
                        onClick={() => onEdit(row.original)}
                    >
                        <Pencil className="size-4 text-amber-600" />
                    </ActionIconButton>
                    <ActionIconButton
                        label="Delete"
                        onClick={() => onDelete(row.original)}
                        variant="outline"
                    >
                        <Trash2 className="size-4 text-rose-600" />
                    </ActionIconButton>
                </div>
            ),
        },
    ];
}
