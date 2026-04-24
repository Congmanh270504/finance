"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import UserAvatar from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
    MemberGroupItem,
    MemberManagementItem,
} from "@/features/members/types";

type MemberColumnsArgs = {
    groups: MemberGroupItem[];
    onView: (member: MemberManagementItem) => void;
    onStartEdit: (member: MemberManagementItem) => void;
    onDelete: (member: MemberManagementItem) => void;
};

function formatVND(amount: number) {
    return `${new Intl.NumberFormat("vi-VN").format(amount)} d`;
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
        <div className="flex items-center justify-center">
            <Button
                variant="ghost"
                className="border-none px-0 font-semibold hover:bg-transparent"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                {label}
                <ArrowUpDown className="ml-2 size-4" />
            </Button>
        </div>
    );
}

function ActionIconButton({
    label,
    onClick,
    variant = "ghost",
    children,
}: {
    label: string;
    onClick: () => void;
    variant?: "ghost" | "outline" | "destructive";
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant={variant}
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClick();
                    }}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] font-semibold">
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

export function createMemberColumns({
    groups,
    onView,
    onStartEdit,
    onDelete,
}: MemberColumnsArgs): ColumnDef<MemberManagementItem>[] {
    void groups;

    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <SortableHeader label="Name" column={column} />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <UserAvatar
                        src={row.original.imgUrl ?? undefined}
                        alt={row.original.name}
                        fallback={row.original.name.charAt(0).toUpperCase()}
                    />
                    <div className="min-w-0">
                        <div
                            className="truncate text-left font-semibold"
                            onClick={(event) => {
                                event.stopPropagation();
                                onView(row.original);
                            }}
                        >
                            {row.original.name}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <SortableHeader label="Email" column={column} />
            ),
            cell: ({ row }) => (
                <div className="text-center text-sm text-slate-700">
                    {row.original.email}
                </div>
            ),
        },
        {
            accessorKey: "netAmount",
            header: ({ column }) => (
                <SortableHeader label="Balance Ledger" column={column} />
            ),
            cell: ({ row }) => (
                <div className="space-y-0.5 text-center">
                    <div
                        className={
                            row.original.netAmount >= 0
                                ? "font-semibold text-emerald-600"
                                : "font-semibold text-rose-600"
                        }
                    >
                        {row.original.netAmount > 0 ? "+" : ""}
                        {formatVND(row.original.netAmount)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {row.original.ledgerCount} ledger entries
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: ({ column }) => (
                <SortableHeader label="Status" column={column} />
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    {row.original.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Active
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-700"
                        >
                            Inactive
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
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
                        onClick={() => onStartEdit(row.original)}
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
