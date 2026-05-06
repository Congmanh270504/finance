import type { User } from "@prisma/client";
import type { GroupCrudItem } from "@/features/groups/types";
import type {
    AssignExistingMembersInput,
    CreateMemberInput,
    UpdateMemberInput,
} from "@/features/members/schema";

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
    groupLedgerStats: Record<
        string,
        {
            oweAmount: number;
            receiveAmount: number;
            netAmount: number;
            ledgerCount: number;
        }
    >;
};

export type MemberGroupItem = GroupCrudItem;

export type MembersManagementData = {
    groups: MemberGroupItem[];
    members: MemberManagementItem[];
};

export type MemberDraft = Pick<User, "name" | "email" | "isActive">;

export type MemberFormValues = Pick<User, "name" | "email" | "imgUrl" | "isActive"> & {
    linkedGroupIds: string[];
    password: string;
    selectedUserIds: string[];
};

export type MemberStatusFilter = "all" | "active" | "inactive";
export type MemberFormMode = "create" | "edit" | "view";

export type MemberSelectableUser = Pick<
    User,
    "id" | "name" | "email" | "imgUrl" | "isActive"
> & {
    linkedGroupIds: string[];
};

export type MemberFormSubmitPayload =
    | CreateMemberInput
    | UpdateMemberInput
    | AssignExistingMembersInput;
