"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createMyLedgerHistoryColumns } from "@/features/my-ledger-history/components/columns";
import type { MyLedgerHistoryResult } from "@/features/my-ledger-history/types";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

export function MyLedgerHistoryClient({
    data,
}: {
    data: MyLedgerHistoryResult;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const columns = React.useMemo(() => createMyLedgerHistoryColumns(), []);

    function replaceParams(updates: Record<string, string | null | undefined>) {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (!value || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }

        params.delete("page");
        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname);
    }

    return (
        <div className="space-y-4 px-4 pb-6 pt-4">
            <div>
                <h1 className="text-lg font-bold">Lịch sử công nợ của tôi</h1>
                <p className="text-xs text-muted-foreground">
                    Theo dõi từng lần cộng trừ công nợ của tài khoản đang đăng
                    nhập.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="py-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tăng công nợ</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold text-emerald-600">
                        +{formatCurrency(data.summary.increaseAmount)}
                    </CardContent>
                </Card>
                <Card className="py-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Giảm công nợ</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold text-rose-600">
                        -{formatCurrency(data.summary.decreaseAmount)}
                    </CardContent>
                </Card>
                <Card className="py-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Ròng</CardTitle>
                    </CardHeader>
                    <CardContent
                        className={`text-lg font-semibold ${
                            data.summary.netAmount >= 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                        }`}
                    >
                        {data.summary.netAmount >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(data.summary.netAmount))}
                    </CardContent>
                </Card>
            </div>

            <Card className="py-0">
                <CardHeader className="space-y-4">
                    <CardTitle className="text-base">
                        Nhật ký biến động
                    </CardTitle>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                value={searchParams.get("query") ?? ""}
                                onChange={(event) =>
                                    replaceParams({
                                        query: event.target.value,
                                    })
                                }
                                placeholder="Tìm theo tiêu đề, ghi chú, người liên quan..."
                            />
                        </div>
                        <Select
                            value={searchParams.get("groupId") ?? "all"}
                            onValueChange={(value) =>
                                replaceParams({ groupId: value })
                            }
                        >
                            <SelectTrigger className="min-w-52">
                                <SelectValue placeholder="All groups" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All groups</SelectItem>
                                {data.groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={data.items}
                        emptyMessage="Chưa có lịch sử công nợ phù hợp."
                        pagination={data.pagination}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
