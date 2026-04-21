"use client";

import * as React from "react";
import { toast } from "sonner";
import {
    DivideIcon,
    Share2Icon,
    CheckCircle2Icon,
    CircleIcon,
    LoaderIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import type {
    CreateExpenseV1Request,
    CreateExpenseV1Response,
} from "@/features/finance/type";

interface Member {
    id: string;
    name: string;
}
interface SharePreview {
    memberId: string;
    memberName: string;
    amount: number;
}

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function NewExpenseForm({
    members,
    currentMemberId,
    groupId,
}: {
    members: Member[];
    currentMemberId: string;
    groupId: string;
}) {
    const [title, setTitle] = React.useState("");
    const [amountStr, setAmountStr] = React.useState("");
    const [payerId, setPayerId] = React.useState(
        currentMemberId || members[0]?.id || "",
    );
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
        new Set(members.map((m) => m.id)),
    );
    const [shares, setShares] = React.useState<SharePreview[]>([]);
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [lastResult, setLastResult] =
        React.useState<CreateExpenseV1Response | null>(null);

    const amount = React.useMemo(() => {
        const raw = amountStr.replace(/\./g, "").replace(",", ".");
        const n = parseFloat(raw);
        return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
    }, [amountStr]);

    function toggleMember(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                if (next.size > 1) next.delete(id);
            } else next.add(id);
            return next;
        });
        setShares([]);
    }

    function handleSplitEqually() {
        if (amount <= 0) {
            toast.error("Enter amount before splitting equally");
            return;
        }
        const ids = Array.from(selectedIds);
        const base = Math.floor(amount / ids.length);
        const remainder = amount - base * ids.length;
        setShares(
            ids.map((id, i) => ({
                memberId: id,
                memberName: members.find((m) => m.id === id)?.name ?? id,
                amount: i === 0 ? base + remainder : base,
            })),
        );
        toast.success("Split equally", {
            description: formatVND(base) + " per person",
        });
    }

    function handleShare() {
        if (shares.length === 0) {
            toast.error("Press Split Equally before sharing");
            return;
        }
        const payer = members.find((m) => m.id === payerId);
        const perPerson = shares[0] ? Math.floor(amount / selectedIds.size) : 0;
        const text = [
            `💸 ${title || "(Chưa đặt tên)"} – ${formatVND(amount)}`,
            `Người trả: ${payer?.name ?? "?"}`,
            `Split equally: ${formatVND(perPerson)} per person`,
            "",
            ...shares.map(
                (s) =>
                    `• ${s.memberName}: ${s.memberId === payerId ? "✓ Đã trả" : formatVND(s.amount)}`,
            ),
        ].join("\n");
        navigator.clipboard.writeText(text).then(
            () =>
                toast.success("Đã copy nội dung chia tiền", {
                    description: "Dán vào chat nhóm nhé!",
                }),
            () => toast.error("Không thể copy. Vui lòng thử lại."),
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Enter expense name");
            return;
        }
        if (amount <= 0) {
            toast.error("Enter valid amount");
            return;
        }
        if (shares.length === 0) {
            toast.error("Press Split Equally to allocate before saving");
            return;
        }
        setSubmitting(true);
        try {
            const body: CreateExpenseV1Request = {
                groupId,
                title: title.trim(),
                amount,
                paidByMemberId: payerId,
                participantMemberIds: Array.from(selectedIds),
                shareStrategy: "EQUAL",
            };
            const res = await fetch("/api/v1/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error?.message ?? `Error ${res.status}`);
            }
            const json = await res.json();
            setLastResult(json.data as CreateExpenseV1Response);
            setSubmitted(true);
            toast.success("Đã lưu khoản chi!", {
                description: `${title} – ${formatVND(amount)}`,
            });
        } catch (err) {
            toast.error("Không thể lưu khoản chi", {
                description: err instanceof Error ? err.message : "Thử lại sau",
            });
        } finally {
            setSubmitting(false);
        }
    }

    function handleReset() {
        setSubmitted(false);
        setTitle("");
        setAmountStr("");
        setShares([]);
        setLastResult(null);
        setSelectedIds(new Set(members.map((m) => m.id)));
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 px-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2Icon className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <p className="text-lg font-bold">Đã lưu!</p>
                    <p className="text-sm text-muted-foreground">
                        {title} – {formatVND(amount)}
                    </p>
                    {lastResult && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Cập nhật {lastResult.ledgerUpdates.length} ghi nợ
                        </p>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    <Button variant="outline" onClick={handleReset}>
                        Add Another
                    </Button>
                    {shares.length > 0 && (
                        <Button variant="outline" onClick={handleShare}>
                            <Share2Icon className="size-4 mr-1" /> Copy chia
                            tiền
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pb-4 px-4 pt-2">
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên khoản chi</label>
                <Input
                    placeholder="Ví dụ: Bữa tối nhà hàng"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Số tiền (₫)</label>
                <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amountStr}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setAmountStr(
                            raw ? Number(raw).toLocaleString("vi-VN") : "",
                        );
                        setShares([]);
                    }}
                    className="h-11 text-lg font-semibold tabular-nums"
                />
                {amount > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {formatVND(amount)}
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Người trả</label>
                <Select value={payerId} onValueChange={setPayerId}>
                    <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Chọn người trả" />
                    </SelectTrigger>
                    <SelectContent>
                        {members.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                                {m.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Chia cho ai?</label>
                <div className="flex flex-wrap gap-2">
                    {members.map((m) => {
                        const active = selectedIds.has(m.id);
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => toggleMember(m.id)}
                                className={[
                                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                                    active
                                        ? "border-primary bg-primary/10 text-primary font-medium"
                                        : "border-border text-muted-foreground hover:border-primary/50",
                                ].join(" ")}
                            >
                                {active ? (
                                    <CheckCircle2Icon className="size-3.5 shrink-0" />
                                ) : (
                                    <CircleIcon className="size-3.5 shrink-0" />
                                )}
                                {m.name}
                            </button>
                        );
                    })}
                </div>
            </div>
            <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={handleSplitEqually}
            >
                <DivideIcon className="size-4" />
                Split Equally ({selectedIds.size} people)
                {amount > 0 && selectedIds.size > 0 && (
                    <Badge variant="secondary" className="ml-auto tabular-nums">
                        {formatVND(Math.floor(amount / selectedIds.size))}/người
                    </Badge>
                )}
            </Button>
            {shares.length > 0 && (
                <Card className="py-0">
                    <CardHeader className="px-4 pt-3 pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                            <span>Phân bổ chi tiêu</span>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex items-center gap-1 text-xs text-primary font-normal hover:underline"
                            >
                                <Share2Icon className="size-3" /> Copy chia sẻ
                            </button>
                        </CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="px-0 py-0">
                        {shares.map((s, i) => {
                            const isPayer = s.memberId === payerId;
                            return (
                                <div
                                    key={s.memberId}
                                    className={[
                                        "flex items-center gap-3 px-4 py-2.5",
                                        i < shares.length - 1 ? "border-b" : "",
                                    ].join(" ")}
                                >
                                    <MemberAvatar
                                        name={s.memberName}
                                        size="sm"
                                    />
                                    <span className="flex-1 text-sm font-medium">
                                        {s.memberName}
                                    </span>
                                    {isPayer && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            Người trả
                                        </Badge>
                                    )}
                                    <span
                                        className={[
                                            "text-sm font-semibold tabular-nums",
                                            isPayer
                                                ? "text-muted-foreground line-through"
                                                : "text-foreground",
                                        ].join(" ")}
                                    >
                                        {formatVND(s.amount)}
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
            <Button
                type="submit"
                className="w-full h-12 text-base gap-2"
                disabled={amount <= 0 || !title.trim() || submitting}
            >
                {submitting && <LoaderIcon className="size-4 animate-spin" />}
                {submitting ? "Đang lưu..." : "Lưu khoản chi"}
            </Button>
        </form>
    );
}
