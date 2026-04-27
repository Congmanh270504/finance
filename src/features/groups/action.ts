"use server";

import { revalidatePath } from "next/cache";
import {
    createGroupSchema,
    reorderGroupsSchema,
    updateGroupSchema,
} from "@/features/groups/schema";
import type {
    GroupCrudItem,
    GroupsActionResponse,
    RecentExpenseGroupItem,
} from "@/features/groups/types";
import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";

function normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

async function buildGroupCrudItem(
    groupId: string,
): Promise<GroupCrudItem | null> {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });

    if (!group) return null;

    const relatedMembers = await prisma.user_Groups.findMany({
        where: { groupId },
        select: {
            userId: true,
            User: {
                select: {
                    isActive: true,
                },
            },
        },
    });

    return {
        ...group,
        memberCount: relatedMembers.length,
        activeMemberCount: relatedMembers.filter((item) => item.User.isActive)
            .length,
    };
}

async function getNextGroupOrder() {
    const groups = await prisma.group.findMany({
        select: {
            order: true,
        },
    });

    const maxOrder = groups.reduce((currentMax, group) => {
        return Math.max(currentMax, group.order ?? -1);
    }, -1);

    return maxOrder + 1;
}

function revalidateGroupPaths() {
    revalidatePath("/members");
    revalidatePath("/groups");
    revalidatePath("/", "layout");
}

export async function getRecentExpenseGroupsAction(): Promise<
    GroupsActionResponse<RecentExpenseGroupItem[]>
> {
    try {
        const context = await getCurrentUserContext();
        const groupIds =
            context?.memberships.map((membership) => membership.groupId) ?? [];

        if (groupIds.length === 0) {
            return {
                success: true,
                data: [],
            };
        }

        const recentGroupStats = await prisma.expense.groupBy({
            by: ["groupId"],
            where: {
                groupId: {
                    in: groupIds,
                },
            },
            _max: {
                updatedAt: true,
                occurredAt: true,
                createdAt: true,
            },
            orderBy: [
                {
                    _max: {
                        updatedAt: "desc",
                    },
                },
                {
                    _max: {
                        occurredAt: "desc",
                    },
                },
                {
                    _max: {
                        createdAt: "desc",
                    },
                },
            ],
            take: 5,
        });

        const activeGroupIds = recentGroupStats.map((item) => item.groupId);
        const activeGroupIdSet = new Set(activeGroupIds);
        const inactiveGroupIds = groupIds.filter(
            (groupId) => !activeGroupIdSet.has(groupId),
        );
        const orderedGroupIds = [...activeGroupIds, ...inactiveGroupIds].slice(
            0,
            5,
        );

        const groups = await prisma.group.findMany({
            where: {
                id: {
                    in: orderedGroupIds,
                },
            },
            select: {
                id: true,
                name: true,
                imgUrl: true,
            },
        });

        const groupMap = new Map(groups.map((group) => [group.id, group]));
        const orderedGroups = orderedGroupIds
            .map((groupId) => groupMap.get(groupId))
            .filter((group): group is RecentExpenseGroupItem => Boolean(group));

        return {
            success: true,
            data: orderedGroups,
        };
    } catch (error) {
        console.error("Failed to load recent expense groups", error);
        return {
            success: false,
            error: "Khong the lay danh sach group gan day",
        };
    }
}

export async function createGroupAction(
    input: unknown,
): Promise<GroupsActionResponse<GroupCrudItem>> {
    const parsed = createGroupSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ?? "Du lieu group khong hop le",
        };
    }

    try {
        const nextOrder = await getNextGroupOrder();

        const group = await prisma.group.create({
            data: {
                name: parsed.data.name,
                currency: parsed.data.currency.toUpperCase(),
                imgUrl: normalizeOptionalText(parsed.data.imgUrl),
                order: nextOrder,
            },
        });

        revalidateGroupPaths();

        return {
            success: true,
            data: {
                ...group,
                memberCount: 0,
                activeMemberCount: 0,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Khong the tao group",
        };
    }
}

export async function updateGroupAction(
    input: unknown,
): Promise<GroupsActionResponse<GroupCrudItem>> {
    const parsed = updateGroupSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ??
                "Du lieu cap nhat khong hop le",
        };
    }

    try {
        await prisma.group.update({
            where: { id: parsed.data.id },
            data: {
                name: parsed.data.name,
                currency: parsed.data.currency.toUpperCase(),
                imgUrl: normalizeOptionalText(parsed.data.imgUrl),
            },
        });

        const group = await buildGroupCrudItem(parsed.data.id);

        revalidateGroupPaths();

        return group
            ? { success: true, data: group }
            : { success: false, error: "Khong the lay group sau cap nhat" };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Khong the cap nhat group",
        };
    }
}

export async function reorderGroupsAction(
    input: unknown,
): Promise<GroupsActionResponse<{ orderedIds: string[] }>> {
    const parsed = reorderGroupsSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ??
                "Du lieu sap xep group khong hop le",
        };
    }

    const orderedIds = Array.from(new Set(parsed.data.orderedIds));

    try {
        await prisma.$transaction(
            orderedIds.map((groupId, index) =>
                prisma.group.update({
                    where: { id: groupId },
                    data: { order: index },
                }),
            ),
        );

        revalidateGroupPaths();

        return {
            success: true,
            data: { orderedIds },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Khong the sap xep lai group",
        };
    }
}

export async function deleteGroupAction(
    groupId: string,
): Promise<GroupsActionResponse<{ id: string }>> {
    if (!groupId) {
        return {
            success: false,
            error: "Thieu group id",
        };
    }

    try {
        const relatedMembers = await prisma.user_Groups.count({
            where: { groupId },
        });

        if (relatedMembers > 0) {
            return {
                success: false,
                error: "Group con member nen chua the xoa",
            };
        }

        await prisma.group.delete({
            where: { id: groupId },
        });

        revalidateGroupPaths();

        return {
            success: true,
            data: { id: groupId },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Khong the xoa group",
        };
    }
}
