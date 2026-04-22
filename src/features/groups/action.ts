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
} from "@/features/groups/types";
import prisma from "@/lib/prisma";

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
                order: nextOrder,
            },
        });

        revalidatePath("/members");

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
            },
        });

        const group = await buildGroupCrudItem(parsed.data.id);

        revalidatePath("/members");

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

        revalidatePath("/members");

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

        revalidatePath("/members");

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
