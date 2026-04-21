"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { QrCodeIcon, LoaderIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {
    GenerateVietQrRequestV1,
    GenerateVietQrResponseV1,
} from "@/features/finance/type";

const BANKS = [
    { bin: "970436", name: "Vietcombank" },
    { bin: "970415", name: "VietinBank" },
    { bin: "970418", name: "BIDV" },
    { bin: "970407", name: "Techcombank" },
    { bin: "970422", name: "MB Bank" },
    { bin: "970405", name: "Agribank" },
    { bin: "970432", name: "VPBank" },
    { bin: "970423", name: "TPBank" },
    { bin: "970441", name: "VIB" },
    { bin: "970448", name: "OCB" },
];

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function VietQrSheet({
    open,
    onOpenChange,
    amount,
    transferNote,
    debtorName,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    amount: number;
    transferNote: string;
    debtorName: string;
}) {
    const [bankBin, setBankBin] = React.useState(BANKS[0].bin);
    const [accountNumber, setAccountNumber] = React.useState("");
    const [accountName, setAccountName] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<GenerateVietQrResponseV1 | null>(
        null,
    );

    async function handleGenerate() {
        if (!accountNumber.trim()) {
            toast.error("Enter account number");
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const body: GenerateVietQrRequestV1 = {
                bankBin,
                accountNumber: accountNumber.trim(),
                accountName: accountName.trim() || undefined,
                amount,
                transferNote: transferNote.slice(0, 60),
            };
            const res = await fetch("/api/v1/vietqr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`Lỗi ${res.status}`);
            const json = await res.json();
            setResult(json.data as GenerateVietQrResponseV1);
        } catch (err) {
            toast.error("Cannot generate QR", {
                description: err instanceof Error ? err.message : "Thử lại sau",
            });
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (!open) {
            setResult(null);
            setAccountNumber("");
            setAccountName("");
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="rounded-t-2xl max-h-[92dvh] overflow-y-auto"
            >
                <SheetHeader className="pb-0">
                    <SheetTitle className="flex items-center gap-2">
                        <QrCodeIcon className="size-5 text-primary" /> Generate
                        QR Payment
                    </SheetTitle>
                    <SheetDescription>
                        {debtorName} thanh toán {formatVND(amount)} qua VietQR
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-3 py-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Bank</label>
                        <Select value={bankBin} onValueChange={setBankBin}>
                            <SelectTrigger className="w-full h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BANKS.map((b) => (
                                    <SelectItem key={b.bin} value={b.bin}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            Account Number
                        </label>
                        <Input
                            placeholder="0123456789"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            Account Holder Name{" "}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </label>
                        <Input
                            placeholder="NGUYEN VAN A"
                            value={accountName}
                            onChange={(e) =>
                                setAccountName(e.target.value.toUpperCase())
                            }
                            className="h-10"
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                            Amount
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                            {formatVND(amount)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-2">
                        <span className="text-sm text-muted-foreground">
                            Description
                        </span>
                        <span className="text-xs font-medium truncate max-w-[55%] text-right">
                            {transferNote.slice(0, 60)}
                        </span>
                    </div>
                    <Button
                        type="button"
                        className="w-full gap-2"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? (
                            <LoaderIcon className="size-4 animate-spin" />
                        ) : (
                            <QrCodeIcon className="size-4" />
                        )}
                        {loading ? "Generating QR..." : "Generate QR Code"}
                    </Button>
                    {result && (
                        <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
                            <Image
                                src={result.qrImageUrl}
                                alt="VietQR code"
                                width={200}
                                height={200}
                                className="rounded-lg"
                                unoptimized
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                Scan with banking app to transfer
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                                onClick={() =>
                                    navigator.clipboard
                                        .writeText(result.payload)
                                        .then(
                                            () =>
                                                toast.success(
                                                    "Đã copy QR payload",
                                                ),
                                            () => toast.error("Không thể copy"),
                                        )
                                }
                            >
                                <CopyIcon className="size-3" /> Copy QR payload
                            </Button>
                        </div>
                    )}
                </div>
                <SheetFooter>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
