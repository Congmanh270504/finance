"use client";

import * as React from "react";
import Image from "next/image";
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
import { cn } from "@/lib/utils";

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
    const [imagePreviewOpen, setImagePreviewOpen] = React.useState(false);
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setImagePreviewOpen(false);
        }

        onOpenChange(nextOpen);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    className={cn(
                        "max-w-2xl  max-h-[90vh] overflow-y-auto",
                        expense?.imgUrl ? "md:max-w-3xl" : "",
                    )}
                >
                    {expense ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{expense.title}</DialogTitle>
                                <DialogDescription>
                                    Quick details about this expense. You can
                                    also edit or delete it
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-1 sm:grid-cols-2 border rounded-xl bg-muted/30 px-4 py-2 dark:border-gray-700!">
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

                            <div
                                className={cn(
                                    "grid gap-6 pt-1",
                                    expense.imgUrl
                                        ? "md:grid-cols-2"
                                        : "grid-cols-1",
                                )}
                            >
                                {expense.imgUrl ? (
                                    <div className="space-y-2 border rounded-xl bg-muted/30 px-4 py-2 dark:border-gray-700!">
                                        <p className="text-sm font-semibold">
                                            Expense image
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImagePreviewOpen(true)
                                            }
                                            className="group relative h-44 w-full overflow-hidden rounded-xl border bg-muted/30 transition-colors hover:border-primary/60"
                                            aria-label="Open expense image preview"
                                        >
                                            <Image
                                                src={expense.imgUrl}
                                                alt={expense.title}
                                                fill
                                                sizes="(min-width: 640px) 672px, calc(100vw - 48px)"
                                                className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                                                unoptimized
                                            />
                                            <p className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
                                                Click to view
                                            </p>
                                        </button>
                                    </div>
                                ) : null}

                                <div className="space-y-3 border rounded-xl bg-muted/30 px-4 py-2 dark:border-gray-700!">
                                    <div>
                                        <span className="text-sm font-semibold">
                                            Participants{" "}
                                            <Badge
                                                variant="outline"
                                                className="bg-emerald-500 text-white"
                                            >
                                                {expense.shares.length} people
                                            </Badge>
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {expense.shares.map((share) => (
                                            <div
                                                key={share.memberId}
                                                className="flex items-center justify-between rounded-xl border px-4 py-3 dark:border-gray-700!"
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
                                                    {formatCurrency(
                                                        share.shareAmount,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {expense.notes ? (
                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Note
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {expense.notes}
                                    </p>
                                </div>
                            ) : null}

                            <DialogFooter showCloseButton />
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="max-w-5xl p-2">
                    <DialogTitle></DialogTitle>

                    {expense?.imgUrl ? (
                        <div className="relative h-[75vh] max-h-[760px] w-full overflow-hidden rounded-lg">
                            <Image
                                src={expense.imgUrl}
                                alt={expense.title}
                                fill
                                sizes="min(1024px, 100vw)"
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
