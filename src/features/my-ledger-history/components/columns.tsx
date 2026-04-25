"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MyLedgerHistoryItem } from "@/features/my-ledger-history/types";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

export function createMyLedgerHistoryColumns(): ColumnDef<MyLedgerHistoryItem>[] {
    return [
        {
            accessorKey: "occurredAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="border-none"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) =>
                new Date(row.original.occurredAt).toLocaleString("vi-VN"),
        },
        {
            accessorKey: "groupName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="border-none"
                >
                    Group
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium underline underline-offset-4">
                        {row.original.groupName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.groupCurrency}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "counterpartyName",
            header: ({ column }) => (
                <div className="flex items-center justify-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="border-none"
                    >
                        Counterparty
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.counterpartyName}
                </div>
            ),
        },
        {
            accessorKey: "sourceLabel",
            header: ({ column }) => (
                <div className="flex items-center justify-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="border-none"
                    >
                        Source
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.original.sourceLabel}</div>
            ),
        },
        {
            accessorKey: "signedAmount",
            header: ({ column }) => (
                <div className="flex items-center justify-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="border-none"
                    >
                        Change
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div
                    className={`
                        ${
                            row.original.direction === "increase"
                                ? "font-semibold text-emerald-600"
                                : "font-semibold text-rose-600"
                        }
                        text-center
                        `}
                >
                    {row.original.direction === "increase" ? "+" : "-"}
                    {formatCurrency(Math.abs(row.original.signedAmount))}
                </div>
            ),
        },
    ];
}
