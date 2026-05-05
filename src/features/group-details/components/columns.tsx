"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, MinusCircle, PlusCircle } from "lucide-react";
import { ActionIconButton } from "@/components/action-icon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GroupLedgerHistoryRow } from "@/features/group-details/types";

function formatCurrency(amount: number) {
    return `${new Intl.NumberFormat("vi-VN").format(Math.abs(amount))} ₫`;
}

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

function getHistoryTypeLabel(type: GroupLedgerHistoryRow["type"]) {
    switch (type) {
        case "EXPENSE_SHARE":
            return "Expense Share";
        case "EXPENSE_DELETION_REVERSAL":
            return "Expense Deletion Reversal";
        case "SETTLEMENT_PAYMENT":
            return "Settlement Payment";
        case "MANUAL_ADJUSTMENT":
            return "Manual Adjustment";
        default:
            return "Custom";
    }
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

export function getGroupLedgerHistoryColumns({
    onView,
}: {
    onView: (entry: GroupLedgerHistoryRow) => void;
}): ColumnDef<GroupLedgerHistoryRow>[] {
    return [
        {
            accessorKey: "occurredAt",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Time" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center text-sm">
                    {formatDateTime(row.original.occurredAt)}
                </div>
            ),
        },
        {
            id: "flow",
            accessorFn: (row) => `${row.fromMemberName}-${row.toMemberName}`,
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Debt" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <button
                    type="button"
                    className="mx-auto flex flex-col items-center text-center"
                    onClick={(event) => {
                        event.stopPropagation();
                        onView(row.original);
                    }}
                >
                    <span className="font-semibold underline underline-offset-4">
                        {row.original.fromMemberName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        owes {row.original.toMemberName}
                    </span>
                </button>
            ),
        },
        {
            accessorKey: "sourceLabel",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Source" column={column} />
                </div>
            ),
            cell: ({ row }) => (
                <div className=" truncate text-center text-sm">
                    {row.original.sourceLabel}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Type" column={column} />
                </div>
            ),
            cell: ({ row }) => {
                const isIncrease = row.original.deltaAmount >= 0;

                return (
                    <div className="flex justify-center">
                        <Badge variant={isIncrease ? "success" : "warning"}>
                            {getHistoryTypeLabel(row.original.type)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "deltaAmount",
            header: ({ column }) => (
                <div className="flex justify-center">
                    <SortableHeader label="Amount" column={column} />
                </div>
            ),
            cell: ({ row }) => {
                const isIncrease = row.original.deltaAmount >= 0;

                return (
                    <div
                        className={[
                            "flex items-center justify-center gap-2 font-semibold tabular-nums",
                            isIncrease ? "text-emerald-700" : "text-amber-700",
                        ].join(" ")}
                    >
                        {isIncrease ? (
                            <PlusCircle className="size-4" />
                        ) : (
                            <MinusCircle className="size-4" />
                        )}
                        <span>
                            {isIncrease ? "+" : "-"}
                            {formatCurrency(row.original.deltaAmount)}
                        </span>
                    </div>
                );
            },
        },
        // {
        //     id: "actions",
        //     header: () => <div className="text-center">Details</div>,
        //     enableSorting: false,
        //     cell: ({ row }) => (
        //         <div
        //             className="flex items-center justify-center"
        //             data-no-row-open="true"
        //             onClick={(event) => event.stopPropagation()}
        //         >
        //             <ActionIconButton
        //                 label="View details"
        //                 onClick={() => onView(row.original)}
        //             >
        //                 <Eye className="size-4 text-sky-600" />
        //             </ActionIconButton>
        //         </div>
        //     ),
        // },
    ];
}
