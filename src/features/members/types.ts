import type { User } from "@prisma/client";
import type { GroupCrudItem } from "@/features/groups/types";

export type MembersActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export type MemberManagementItem = User & {
    linkedGroupIds: string[];
    linkedGroupNames: string[];
    linkedGroupLabel: string;
    netAmount: number;
    oweAmount: number;
    receiveAmount: number;
    ledgerCount: number;
};

export type MemberGroupItem = GroupCrudItem;

export type MembersManagementData = {
    groups: MemberGroupItem[];
    members: MemberManagementItem[];
};

export type MemberDraft = Pick<User, "name" | "email" | "isActive">;

export type MemberFormValues = Pick<User, "name" | "email" | "imgUrl" | "isActive"> & {
    linkedGroupIds: string[];
};

export type MemberStatusFilter = "all" | "active" | "inactive";
export type MemberFormMode = "create" | "edit" | "view";
