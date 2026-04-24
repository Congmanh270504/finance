"use client";

import { ArrowRight, MinusCircle, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { GroupLedgerHistoryRow } from "@/features/group-details/types";

function formatCurrency(amount: number) {
    return `${new Intl.NumberFormat("vi-VN").format(Math.abs(amount))} ₫`;
}

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "full",
        timeStyle: "short",
    }).format(new Date(value));
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="space-y-1 rounded-2xl border border-border/70 bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {label}
            </p>
            <div className="text-sm font-medium text-foreground">{value}</div>
        </div>
    );
}

export function GroupLedgerHistoryDialog({
    entry,
    open,
    onOpenChange,
}: {
    entry: GroupLedgerHistoryRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isIncrease = (entry?.deltaAmount ?? 0) >= 0;

    const typeLabel =
        entry?.type === "EXPENSE_SHARE"
            ? "Expense Share"
            : entry?.type === "EXPENSE_DELETION_REVERSAL"
              ? "Expense Deletion Reversal"
              : entry?.type === "SETTLEMENT_PAYMENT"
                ? "Settlement Payment"
                : entry?.type === "MANUAL_ADJUSTMENT"
                  ? "Manual Adjustment"
                  : "Custom";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-3xl gap-5">
                <DialogHeader>
                    <DialogTitle>Balance Change Details</DialogTitle>
                    <DialogDescription>
                        Review the source and movement direction of the selected
                        balance event.
                    </DialogDescription>
                </DialogHeader>

                {entry ? (
                    <div className="space-y-5">
                        <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        Movement
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                                        <span>{entry.fromMemberName}</span>
                                        <ArrowRight className="size-4 text-muted-foreground" />
                                        <span>{entry.toMemberName}</span>
                                    </div>
                                </div>
                                <Badge
                                    variant={isIncrease ? "success" : "warning"}
                                    className="self-start"
                                >
                                    {typeLabel}
                                </Badge>
                            </div>

                            <div
                                className={[
                                    "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums",
                                    isIncrease
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700",
                                ].join(" ")}
                            >
                                {isIncrease ? (
                                    <PlusCircle className="size-4" />
                                ) : (
                                    <MinusCircle className="size-4" />
                                )}
                                {isIncrease ? "+" : "-"}
                                {formatCurrency(entry.deltaAmount)}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailItem
                                label="Effective At"
                                value={formatDateTime(entry.occurredAt)}
                            />
                            <DetailItem
                                label="Recorded At"
                                value={formatDateTime(entry.createdAt)}
                            />
                            <DetailItem
                                label="Source"
                                value={entry.sourceLabel}
                            />
                            <DetailItem
                                label="Note"
                                value={entry.note?.trim() || "None"}
                            />
                        </div>

                        <Separator />
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
