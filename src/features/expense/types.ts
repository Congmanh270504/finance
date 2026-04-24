import type { Expense, ShareStrategy } from "@prisma/client";

export type ExpenseParticipant = {
    memberId: string;
    memberName: string;
    shareAmount: number;
};

export type ExpenseRow = Expense & {
    groupName: string;
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
    groupId?: string;
    query?: string;
    page?: number;
    limit?: number;
};

export type ExpenseFormMember = {
    id: string;
    name: string;
    avatarUrl?: string;
    avatarFallback?: string;
};

export type ExpenseFormGroup = {
    id: string;
    name: string;
    currency: string;
};

export type ExpenseCreateResult = {
    expense: ExpenseRow;
    ledgerUpdates: number;
};

export type ExpenseActionResponse<T = undefined> = {
    success: boolean;
    error?: string;
    data?: T;
};

export type ExpenseShareStrategyLabel = Record<ShareStrategy, string>;
