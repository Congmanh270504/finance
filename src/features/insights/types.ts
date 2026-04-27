export type InsightsMonthStat = {
    month: number;
    monthLabel: string;
    totalAmount: number;
    myShareAmount: number;
    paidByMeAmount: number;
    expenseCount: number;
    groupCount: number;
};

export type InsightsYearOption = {
    year: number;
    expenseCount: number;
};

export type InsightsSummary = {
    totalAmount: number;
    myShareAmount: number;
    paidByMeAmount: number;
    expenseCount: number;
};

export type InsightsYearlyStats = {
    selectedYear: number;
    yearOptions: InsightsYearOption[];
    months: InsightsMonthStat[];
    summary: InsightsSummary;
};
