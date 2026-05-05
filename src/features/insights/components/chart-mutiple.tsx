"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type { InsightsMonthStat } from "@/features/insights/types";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

const chartConfig = {
    totalAmount: {
        label: "Total spending",
        color: "var(--chart-2)",
    },
    myShareAmount: {
        label: "My share",
        color: "var(--chart-5)",
    },
    paidByMeAmount: {
        label: "Paid back",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

const SHORT_MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function getShortMonthLabel(month: number) {
    return SHORT_MONTH_LABELS[month - 1] ?? `M${month}`;
}

export function ChartLineMultiple({
    data,
    year,
}: {
    data: InsightsMonthStat[];
    year: number;
}) {
    const chartData = data.map((item) => ({
        month: getShortMonthLabel(item.month),
        totalAmount: item.totalAmount,
        myShareAmount: item.myShareAmount,
        paidByMeAmount: item.paidByMeAmount,
    }));

    return (
        <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 animate-shimmer" />
            </div>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">
                    Spending chart for {year}
                </CardTitle>
                <CardDescription>
                    Track total spending, your share, and repayments by month.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[260px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <>
                                            <span className="text-muted-foreground">
                                                {chartConfig[
                                                    name as keyof typeof chartConfig
                                                ]?.label ?? name}
                                            </span>
                                            <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                                                {formatVND(Number(value))}
                                            </span>
                                        </>
                                    )}
                                />
                            }
                        />
                        <Line
                            dataKey="totalAmount"
                            type="monotone"
                            stroke="var(--color-totalAmount)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="myShareAmount"
                            type="monotone"
                            stroke="var(--color-myShareAmount)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="paidByMeAmount"
                            type="monotone"
                            stroke="var(--color-paidByMeAmount)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
