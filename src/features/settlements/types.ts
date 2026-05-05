import type { Settlement } from "@prisma/client";

export type SettlementDirection = "outgoing" | "incoming";

export type SettlementRow = Settlement & {
    groupName: string;
    groupCurrency: string;
    fromMemberName: string;
    toMemberName: string;
    fromMemberAvatarUrl?: string | null;
    toMemberAvatarUrl?: string | null;
    direction: SettlementDirection;
    signedAmount: number;
};

export type SettlementListPagination = {
    total: number;
    page: number;
    limit: number;
};

export type SettlementFormGroup = {
    id: string;
    name: string;
    currency: string;
};

export type SettlementFormMember = {
    id: string;
    name: string;
    avatarUrl?: string;
    avatarFallback?: string;
};

export type SettlementDebtOption = {
    toMemberId: string;
    toMemberName: string;
    toMemberAvatarUrl?: string | null;
    amount: number;
    currency: string;
};

export type SettlementFormData = {
    members: SettlementFormMember[];
    debts: SettlementDebtOption[];
    currency: string;
};

export type SettlementSummary = {
    totalOutgoing: number;
    totalIncoming: number;
    netAmount: number;
    settlementCount: number;
};

export type SettlementListResult = {
    items: SettlementRow[];
    groups: SettlementFormGroup[];
    pagination: SettlementListPagination;
    filters: {
        query: string;
        groupId: string;
    };
    summary: SettlementSummary;
    currentMemberId: string;
};

export type SettlementActionResponse<T = undefined> = {
    success: boolean;
    error?: string;
    data?: T;
};
