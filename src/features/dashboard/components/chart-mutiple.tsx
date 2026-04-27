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
import type { DashboardMonthlyCashflowPoint } from "@/features/dashboard/types";

function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

const chartConfig = {
    income: {
        label: "Income",
        color: "var(--chart-2)",
    },
    expense: {
        label: "Expense",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig;

export function DashboardCashflowChart({
    data,
}: {
    data: DashboardMonthlyCashflowPoint[];
}) {
    return (
        <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 animate-shimmer" />
            </div>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">
                    Income and Expenses in 6 months
                </CardTitle>
                <CardDescription>
                    Incomes mean the amount of money received, expenses are the
                    amounts spent.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[220px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
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
                            tickFormatter={(value) => value.slice(0, 3)}
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
                            dataKey="income"
                            type="monotone"
                            stroke="var(--color-income)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="expense"
                            type="monotone"
                            stroke="var(--color-expense)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
