import type { BalanceLedgerHistory } from "@prisma/client";

export type MyLedgerHistoryGroupOption = {
    id: string;
    name: string;
    currency: string;
};

export type MyLedgerHistoryItem = BalanceLedgerHistory & {
    groupName: string;
    groupCurrency: string;
    counterpartyName: string;
    direction: "increase" | "decrease";
    signedAmount: number;
    sourceLabel: string;
};

export type MyLedgerHistoryPagination = {
    total: number;
    page: number;
    limit: number;
};

export type MyLedgerHistoryResult = {
    items: MyLedgerHistoryItem[];
    groups: MyLedgerHistoryGroupOption[];
    pagination: MyLedgerHistoryPagination;
    filters: {
        query: string;
        groupId: string;
    };
    summary: {
        increaseAmount: number;
        decreaseAmount: number;
        netAmount: number;
    };
};
