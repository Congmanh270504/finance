import type { Group } from "@prisma/client";

export type GroupCrudItem = Group & {
    memberCount: number;
    activeMemberCount: number;
};

export type GroupsActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};
