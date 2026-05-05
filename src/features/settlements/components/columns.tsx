"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { ActionIconButton } from "@/components/action-icon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SettlementRow } from "@/features/settlements/types";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(amount)) + " VND";
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

export function getSettlementColumns({
    currentMemberId,
    onView,
    onEdit,
    onDelete,
}: {
    currentMemberId: string;
    onView: (settlement: SettlementRow) => void;
    onEdit: (settlement: SettlementRow) => void;
    onDelete: (settlement: SettlementRow) => void;
}): ColumnDef<SettlementRow>[] {
    return [
        {
            accessorKey: "stt",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Index" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "settledAt",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Paid at" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center text-sm">
                    {formatDate(row.original.settledAt)}
                </div>
            ),
        },
        {
            accessorKey: "groupName",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Group" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <button
                    type="button"
                    className="mx-auto block max-w-44 truncate text-center font-medium underline underline-offset-4"
                    onClick={(event) => {
                        event.stopPropagation();
                        onView(row.original);
                    }}
                >
                    {row.original.groupName}
                </button>
            ),
        },
        {
            accessorKey: "toMemberName",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Payment" column={column} />
                </div>
            ),
            cell: ({ row }) => {
                const isOutgoing = row.original.direction === "outgoing";
                const counterparty = isOutgoing
                    ? row.original.toMemberName
                    : row.original.fromMemberName;

                return (
                    <div className="text-center">
                        <p className="font-medium">{counterparty}</p>
                        <p className="text-xs text-muted-foreground">
                            {isOutgoing ? "You paid" : "Paid you"}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: "note",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Note" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="mx-auto max-w-52 truncate text-center text-sm text-muted-foreground">
                    {row.original.note?.trim() || "Payment"}
                </div>
            ),
        },
        {
            accessorKey: "signedAmount",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Amount" column={column} />
                </div>
            ),
            cell: ({ row }) => {
                const isOutgoing = row.original.direction === "outgoing";

                return (
                    <div className="text-center">
                        <Badge
                            variant={isOutgoing ? "destructive" : "success"}
                            className="font-mono tabular-nums"
                        >
                            {isOutgoing ? "-" : "+"}
                            {formatCurrency(row.original.amount)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            enableSorting: false,
            cell: ({ row }) => {
                const canMutate = row.original.fromMemberId === currentMemberId;

                return (
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
                        {canMutate ? (
                            <>
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
                            </>
                        ) : null}
                    </div>
                );
            },
        },
    ];
}
