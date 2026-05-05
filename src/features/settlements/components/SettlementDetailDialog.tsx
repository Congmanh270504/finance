"use client";

import { ArrowRight, WalletCardsIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { SettlementRow } from "@/features/settlements/types";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(amount)) + " VND";
}

function formatDate(value: Date) {
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
        <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}

export function SettlementDetailDialog({
    settlement,
    open,
    onOpenChange,
}: {
    settlement: SettlementRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isOutgoing = settlement?.direction === "outgoing";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl md:max-w-3xl">
                {settlement ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <WalletCardsIcon className="size-5 text-primary" />
                                Payment detail
                            </DialogTitle>
                            <DialogDescription>
                                Saved repayment record and the balance movement
                                it created.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2 text-lg font-semibold">
                                    <span className="truncate">
                                        {settlement.fromMemberName}
                                    </span>
                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate">
                                        {settlement.toMemberName}
                                    </span>
                                </div>
                                <Badge
                                    variant={
                                        isOutgoing ? "destructive" : "success"
                                    }
                                    className="font-mono tabular-nums"
                                >
                                    {isOutgoing ? "-" : "+"}
                                    {formatCurrency(settlement.amount)}
                                </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {isOutgoing
                                    ? "You paid this debt."
                                    : "This payment was made to you."}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailItem
                                label="Group"
                                value={`${settlement.groupName} (${settlement.groupCurrency})`}
                            />
                            <DetailItem
                                label="Payment date"
                                value={formatDate(settlement.settledAt)}
                            />
                            <DetailItem
                                label="Recorded at"
                                value={formatDate(settlement.createdAt)}
                            />
                            <DetailItem
                                label="Note"
                                value={settlement.note?.trim() || "None"}
                            />
                        </div>

                        <DialogFooter showCloseButton />
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
