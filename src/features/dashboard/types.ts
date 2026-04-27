export type DashboardMonthlyCashflowPoint = {
    month: string;
    income: number;
    expense: number;
};

export type DashboardDebtDirection = "iOwe" | "owedToMe";

export type DashboardLedgerItem = {
    ledgerId: string;
    groupId: string;
    groupName: string;
    groupImgUrl: string | null;
    groupCurrency: string;
    counterpartyId: string;
    counterpartyName: string;
    counterpartyImgUrl: string | null;
    amount: number;
    direction: DashboardDebtDirection;
    updatedAt: string;
};

export type DashboardRecentExpenseItem = {
    expenseId: string;
    groupId: string;
    groupName: string;
    groupImgUrl: string | null;
    title: string;
    amount: number;
    paidByMemberId: string;
    paidByMemberName: string;
    myShareAmount: number | null;
    occurredAt: string;
};

export type DashboardQuickAccessItem = {
    title: string;
    url: string;
    kind: "page" | "group";
    imgUrl?: string | null;
};

export type DashboardOverviewData = {
    currentMemberId: string;
    generatedAt: string;
    netBalance: number;
    totalOwedToMe: number;
    totalIOwe: number;
    totalGroupSpending: number;
    transactionCount: number;
    groupCount: number;
    monthlyCashflow: DashboardMonthlyCashflowPoint[];
    ledger: DashboardLedgerItem[];
    recentExpenses: DashboardRecentExpenseItem[];
    quickAccess: DashboardQuickAccessItem[];
};
