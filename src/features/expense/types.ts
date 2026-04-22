import type { Expense, ShareStrategy } from "@prisma/client";

export type ExpenseParticipant = {
    memberId: string;
    memberName: string;
    shareAmount: number;
};

export type ExpenseRow = Expense & {
    paidByName: string;
    shareCount: number;
    participantNames: string[];
    shares: ExpenseParticipant[];
};

export type ExpenseListPagination = {
    total: number;
    page: number;
    limit: number;
};

export type ExpenseListResult = {
    items: ExpenseRow[];
    pagination: ExpenseListPagination;
    query?: string;
    source: "database" | "demo";
};

export type ExpenseListParams = {
    groupId: string;
    query?: string;
    page?: number;
    limit?: number;
};

export type ExpenseActionResponse = {
    success: boolean;
    error?: string;
};

export type ExpenseShareStrategyLabel = Record<ShareStrategy, string>;
