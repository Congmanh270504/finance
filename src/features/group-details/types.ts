import type { BalanceLedger, BalanceLedgerHistory, Group } from "@prisma/client";

export type GroupLedgerMemberOption = {
    id: string;
    name: string;
};

export type GroupCurrentBalanceRow = BalanceLedger & {
    fromMemberName: string;
    toMemberName: string;
};

export type GroupLedgerHistoryRow = BalanceLedgerHistory & {
    fromMemberName: string;
    toMemberName: string;
    sourceLabel: string;
};

export type GroupLedgerOverview = Group & {
    memberCount: number;
    expenseCount: number;
    currentLedgerCount: number;
    historyEventCount: number;
    totalOutstanding: number;
};

export type GroupLedgerHistoryPagination = {
    total: number;
    page: number;
    limit: number;
};

export type GroupLedgerDetailResult = {
    group: GroupLedgerOverview;
    memberOptions: GroupLedgerMemberOption[];
    currentBalances: GroupCurrentBalanceRow[];
    history: GroupLedgerHistoryRow[];
    pagination: GroupLedgerHistoryPagination;
    filters: {
        query: string;
        memberId: string;
    };
};
