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
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Counterparty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.counterpartyName,
        },
        {
            accessorKey: "sourceLabel",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Source
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.sourceLabel,
        },
        {
            accessorKey: "signedAmount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Change
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span
                    className={
                        row.original.direction === "increase"
                            ? "font-semibold text-emerald-600"
                            : "font-semibold text-rose-600"
                    }
                >
                    {row.original.direction === "increase" ? "+" : "-"}
                    {formatCurrency(Math.abs(row.original.signedAmount))}
                </span>
            ),
        },
    ];
}
