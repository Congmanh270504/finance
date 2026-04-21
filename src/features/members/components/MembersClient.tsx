"use client";

import * as React from "react";
import { toast } from "sonner";
import {
    Share2Icon,
    ArrowRightIcon,
    ArrowLeftIcon,
    QrCodeIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import { VietQrSheet } from "./VietQrSheet";
import type { BalancesSummaryResponseV1 } from "@/features/finance/type";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

interface QrTarget {
    amount: number;
    debtorName: string;
    transferNote: string;
}

export function MembersClient({
    summary,
    currentMemberId,
    isDemo,
}: {
    summary: BalancesSummaryResponseV1;
    currentMemberId: string;
    isDemo?: boolean;
}) {
    const [qrTarget, setQrTarget] = React.useState<QrTarget | null>(null);

    function buildSettleText() {
        const lines = ["💳 Group Settlement List", ""];
        for (const entry of summary.ledger)
            lines.push(
                `${entry.fromMemberName} → ${entry.toMemberName}: ${formatVND(entry.amount)}`,
            );
        return lines.join("\n");
    }

    return (
        <div className="space-y-4 pb-4 pt-4 px-4">
            {isDemo && (
                <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
                    Demo mode – sample data
                </div>
            )}
            <div className="flex items-center justify-between animate-fade-in-down">
                <h2 className="text-sm font-semibold font-mono text-gradient uppercase tracking-widest">
                    Thành viên nhóm
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    onClick={() =>
                        navigator.clipboard.writeText(buildSettleText()).then(
                            () => toast.success("Copied settlement list"),
                            () => toast.error("Cannot copy"),
                        )
                    }
                >
                    <Share2Icon className="size-3.5" /> Copy Settlement
                </Button>
            </div>

            {summary.memberBalances.map((member, idx) => {
                const isMe = member.memberId === currentMemberId;
                const owes = summary.ledger.filter(
                    (l) => l.fromMemberId === member.memberId,
                );
                const owedBy = summary.ledger.filter(
                    (l) => l.toMemberId === member.memberId,
                );
                return (
                    <Card
                        key={member.memberId}
                        className={[
                            `py-0 overflow-hidden hover-lift border-glow animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`,
                            isMe
                                ? "border-primary/30 ring-1 ring-primary/20 glass-strong"
                                : "border-border/50 glass",
                        ].join(" ")}
                    >
                        <CardHeader className="px-4 pt-4 pb-3 flex-row items-center gap-3">
                            <MemberAvatar name={member.memberName} size="md" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm">
                                        {member.memberName}
                                    </CardTitle>
                                    {isMe && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] bg-primary/15 text-primary border border-primary/20"
                                        >
                                            Bạn
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="text-right">
                                        <p
                                            className={[
                                                "text-base font-bold font-mono tabular-nums",
                                                member.netAmount > 0
                                                    ? "text-emerald-500 dark:text-emerald-400"
                                                    : member.netAmount < 0
                                                      ? "text-red-500"
                                                      : "text-muted-foreground",
                                            ].join(" ")}
                                        >
                                            {member.netAmount > 0 ? "+" : ""}
                                            {formatVND(
                                                Math.abs(member.netAmount),
                                            )}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {member.netAmount > 0
                                                ? "Owed to You"
                                                : member.netAmount < 0
                                                  ? "You Owe"
                                                  : "Even"}
                                        </p>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>Net balance for {member.memberName}</p>
                                </TooltipContent>
                            </Tooltip>
                        </CardHeader>
                        {(owes.length > 0 || owedBy.length > 0) && (
                            <>
                                <Separator className="opacity-40" />
                                <CardContent className="px-4 py-3 space-y-2">
                                    {owedBy.map((entry) => (
                                        <div
                                            key={entry.ledgerId}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <MemberAvatar
                                                name={entry.fromMemberName}
                                                size="sm"
                                                className="size-5 text-[8px]"
                                            />
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                {entry.fromMemberName}
                                                <ArrowRightIcon className="size-3 text-emerald-500" />
                                                {member.memberName}
                                            </span>
                                            <span className="ml-auto font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                {formatVND(entry.amount)}
                                            </span>
                                            {entry.toMemberId ===
                                                currentMemberId && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="h-6 w-6 rounded-full text-primary hover:bg-primary/10"
                                                            onClick={() =>
                                                                setQrTarget({
                                                                    amount: entry.amount,
                                                                    debtorName:
                                                                        entry.fromMemberName,
                                                                    transferNote: `Tra no ${entry.fromMemberName}`,
                                                                })
                                                            }
                                                        >
                                                            <QrCodeIcon className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p>
                                                            Generate QR Payment
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    ))}
                                    {owes.map((entry) => (
                                        <div
                                            key={entry.ledgerId}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <MemberAvatar
                                                name={member.memberName}
                                                size="sm"
                                                className="size-5 text-[8px]"
                                            />
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                {member.memberName}
                                                <ArrowLeftIcon className="size-3 text-red-400" />
                                                {entry.toMemberName}
                                            </span>
                                            <span className="ml-auto font-semibold font-mono text-red-500 tabular-nums">
                                                {formatVND(entry.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </>
                        )}
                    </Card>
                );
            })}
            <VietQrSheet
                open={qrTarget !== null}
                onOpenChange={(v) => {
                    if (!v) setQrTarget(null);
                }}
                amount={qrTarget?.amount ?? 0}
                debtorName={qrTarget?.debtorName ?? ""}
                transferNote={qrTarget?.transferNote ?? ""}
            />
        </div>
    );
}
