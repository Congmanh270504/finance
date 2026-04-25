"use server";

import { revalidatePath } from "next/cache";
import type {
    NotificationActionResponse,
    NotificationItem,
    NotificationSummary,
} from "@/features/notification/types";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

const RECENT_NOTIFICATION_LIMIT = 10;

function mapNotificationItem(
    notification: Awaited<
        ReturnType<typeof prisma.notification.findMany>
    >[number],
): NotificationItem {
    return {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
    };
}

export async function getRecentNotificationsAction(): Promise<
    NotificationActionResponse<NotificationSummary>
> {
    const user = await getCurrentUser();

    if (!user) {
        return {
            success: false,
            error: "Not authenticated.",
            data: {
                items: [],
                unreadCount: 0,
            },
        };
    }

    try {
        const [items, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: {
                    userId: user.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: RECENT_NOTIFICATION_LIMIT,
            }),
            prisma.notification.count({
                where: {
                    userId: user.id,
                    isRead: false,
                },
            }),
        ]);

        return {
            success: true,
            data: {
                items: items.map(mapNotificationItem),
                unreadCount,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to load notifications.",
            data: {
                items: [],
                unreadCount: 0,
            },
        };
    }
}

export async function markNotificationsReadAction(): Promise<
    NotificationActionResponse<{ updatedCount: number }>
> {
    const user = await getCurrentUser();

    if (!user) {
        return {
            success: false,
            error: "Not authenticated.",
        };
    }

    try {
        const result = await prisma.notification.updateMany({
            where: {
                userId: user.id,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        revalidatePath("/");

        return {
            success: true,
            data: {
                updatedCount: result.count,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to mark notifications as read.",
        };
    }
}
