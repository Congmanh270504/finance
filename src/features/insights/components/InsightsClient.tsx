"use client";

import * as React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import type { InsightsChartsResponseV1 } from "@/features/finance/type";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}
function formatBucketLabel(iso: string, bucket: string) {
    const d = new Date(iso);
    if (bucket === "month")
        return d.toLocaleDateString("vi-VN", {
            month: "short",
            year: "2-digit",
        });
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

const PAYER_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

const tooltipStyle = {
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    background: "oklch(from var(--popover) l c h / 0.85)",
    backdropFilter: "blur(12px)",
    color: "var(--popover-foreground)",
    fontSize: 12,
};

export function InsightsClient({
    charts,
    isDemo,
}: {
    charts: InsightsChartsResponseV1;
    isDemo?: boolean;
}) {
    const trendData = charts.trend.map((p) => ({
        label: formatBucketLabel(p.bucketStart, charts.bucket),
        total: p.totalAmount,
        count: p.expenseCount,
    }));
    const payerData = charts.topPayers.map((p) => ({
        name: p.memberName,
        total: p.totalAmount,
        id: p.memberId,
    }));
    const avg =
        charts.expenseCount > 0
            ? Math.round(charts.totalAmount / charts.expenseCount)
            : 0;

    return (
        <div className="space-y-4 pb-4 pt-4 px-4">
            {isDemo && (
                <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
                    Demo mode – sample data
                </div>
            )}
            <div className="flex items-start justify-between animate-fade-in-down">
                <div>
                    <h2 className="text-sm font-semibold text-gradient">
                        Spending Statistics
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {new Date(charts.fromDate).toLocaleDateString("vi-VN")}{" "}
                        â†’{" "}
                        {new Date(charts.toDate).toLocaleDateString("vi-VN")}
                    </p>
                </div>
                <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 font-mono"
                >
                    {charts.bucket === "day"
                        ? "Day"
                        : charts.bucket === "week"
                          ? "Week"
                          : "Month"}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up stagger-1">
                <Card className="gap-1 py-3 hover-lift border-glow border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
                    <CardHeader className="px-3 pb-0">
                        <CardTitle className="text-xs text-muted-foreground font-medium">
                            Total Spending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3">
                        <p className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                            {formatVND(charts.totalAmount)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="gap-1 py-3 hover-lift border-glow border border-violet-200/30 dark:border-violet-800/20 bg-gradient-to-br from-violet-50/80 to-background dark:from-violet-950/20 dark:to-background">
                    <CardHeader className="px-3 pb-0">
                        <CardTitle className="text-xs text-muted-foreground font-medium">
                            Avg/Item
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3">
                        <p className="text-base font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums">
                            {formatVND(avg)}
                        </p>
                    </CardContent>
                </Card>
            </div>
            {trendData.length > 0 && (
                <Card className="py-4 border border-primary/10 glass hover-lift animate-fade-in-up stagger-2">
                    <CardHeader className="px-4 pb-2">
                        <CardTitle className="text-sm text-gradient">
                            Spending Trend
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                            {charts.expenseCount} expenses
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                                data={trendData}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: -16,
                                    bottom: 0,
                                }}
                            >
                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={(v) =>
                                        `${(v / 1000).toFixed(0)}k`
                                    }
                                    tick={{
                                        fontSize: 10,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip
                                    formatter={(
                                        value: number,
                                        _: string,
                                        entry: { payload?: { count?: number } },
                                    ) => [
                                        `${formatVND(value)} (${entry?.payload?.count ?? 0} items)`,
                                        "Spending",
                                    ]}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar
                                    dataKey="total"
                                    radius={[4, 4, 0, 0]}
                                    fill="var(--primary)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
            {payerData.length > 0 && (
                <Card className="py-4 border border-primary/10 glass hover-lift animate-fade-in-up stagger-3">
                    <CardHeader className="px-4 pb-2">
                        <CardTitle className="text-sm text-gradient">
                            Top Payers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2">
                        <ResponsiveContainer
                            width="100%"
                            height={Math.max(120, payerData.length * 48)}
                        >
                            <BarChart
                                data={payerData}
                                layout="vertical"
                                margin={{
                                    top: 4,
                                    right: 24,
                                    left: 8,
                                    bottom: 0,
                                }}
                            >
                                <XAxis
                                    type="number"
                                    tickFormatter={(v) =>
                                        `${(v / 1000).toFixed(0)}k`
                                    }
                                    tick={{
                                        fontSize: 10,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={60}
                                />
                                <RechartsTooltip
                                    formatter={(value: number) => [
                                        formatVND(value),
                                        "Paid",
                                    ]}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                                    {payerData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                PAYER_COLORS[
                                                    i % PAYER_COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 space-y-2 px-2">
                            {payerData.map((p, i) => (
                                <div
                                    key={p.id}
                                    className="flex items-center gap-2 py-1 rounded-md transition-colors duration-150 hover:bg-muted/30 px-1"
                                >
                                    <MemberAvatar
                                        name={p.name}
                                        size="sm"
                                        className="size-6 text-[9px]"
                                    />
                                    <span className="text-xs flex-1 font-medium">
                                        {p.name}
                                    </span>
                                    <span className="text-xs font-semibold font-mono tabular-nums text-right">
                                        {formatVND(p.total)}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono w-9 text-right tabular-nums">
                                        {charts.totalAmount > 0
                                            ? Math.round(
                                                  (p.total /
                                                      charts.totalAmount) *
                                                      100,
                                              )
                                            : 0}
                                        %
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
