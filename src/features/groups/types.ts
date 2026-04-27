import type { Group } from "@prisma/client";

export type GroupCrudItem = Group & {
    memberCount: number;
    activeMemberCount: number;
};

export type RecentExpenseGroupItem = Pick<Group, "id" | "name" | "imgUrl">;

export type GroupsActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};
