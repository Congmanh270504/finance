"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/table/DataTable";
import {
    Card,
    CardContent,
    ImageBackgroundCard,
} from "@/components/ui/card";
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
        <div className="space-y-4 ">
            <div>
                <h1 className="text-lg font-bold">Lịch sử công nợ của tôi</h1>
                <p className="text-xs text-muted-foreground">
                    Theo dõi từng lần cộng trừ công nợ của tài khoản đang đăng
                    nhập.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <ImageBackgroundCard
                    backgroundImage="/bbbb.png"
                    title={
                        "\u0054\u0103\u006e\u0067\u0020\u0063\u00f4\u006e\u0067\u0020\u006e\u1ee3"
                    }
                    value={`+${formatCurrency(data.summary.increaseAmount)}`}
                />
                <ImageBackgroundCard
                    backgroundImage="/bbbb.png"
                    title={
                        "\u0047\u0069\u1ea3\u006d\u0020\u0063\u00f4\u006e\u0067\u0020\u006e\u1ee3"
                    }
                    value={`-${formatCurrency(data.summary.decreaseAmount)}`}
                />
                <ImageBackgroundCard
                    backgroundImage="/bbbb.png"
                    title={"Ròng"}
                    value={`${data.summary.netAmount >= 0 ? "+" : "-"} ${formatCurrency(data.summary.netAmount)}`}
                />
            </div>

            <Card className="py-0">
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={data.items}
                        emptyMessage="Chưa có lịch sử công nợ phù hợp."
                        pagination={data.pagination}
                        enableSearch={true}
                        actions={[
                            <Select
                                key="group-filter"
                                value={searchParams.get("groupId") ?? "all"}
                                onValueChange={(value) =>
                                    replaceParams({ groupId: value })
                                }
                            >
                                <SelectTrigger className="w-fit">
                                    <SelectValue placeholder="All groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All groups
                                    </SelectItem>
                                    {data.groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>,
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
