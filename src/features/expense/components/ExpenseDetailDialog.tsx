"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ExpenseRow } from "@/features/expense/types";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

const shareStrategyLabel = {
    EQUAL: "Chia đều",
    CUSTOM: "Tùy chỉnh",
};

export function ExpenseDetailDialog({
    expense,
    open,
    onOpenChange,
}: {
    expense: ExpenseRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                {expense ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{expense.title}</DialogTitle>
                            <DialogDescription>
                                Quick details about this expense. You can also
                                edit or delete it
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Payer
                                </p>
                                <p className="mt-1 text-base font-semibold">
                                    {expense.paidByName}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Occurrence Date
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {formatDate(expense.occurredAt)}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Sharing Strategy
                                </p>
                                <div className="mt-1">
                                    <Badge variant="secondary">
                                        {
                                            shareStrategyLabel[
                                                expense.shareStrategy
                                            ]
                                        }
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-semibold">
                                    Participants
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {expense.shareCount} people
                                </p>
                            </div>
                            <div className="space-y-2">
                                {expense.shares.map((share) => (
                                    <div
                                        key={share.memberId}
                                        className="flex items-center justify-between rounded-xl border px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {share.memberName}
                                            </p>
                                            {share.memberId ===
                                            expense.paidByMemberId ? (
                                                <p className="text-xs text-muted-foreground">
                                                    Payer
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="font-semibold tabular-nums">
                                            {formatCurrency(share.shareAmount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {expense.notes ? (
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Note
                                </p>
                                <p className="mt-1 text-sm">{expense.notes}</p>
                            </div>
                        ) : null}

                        <DialogFooter showCloseButton />
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
