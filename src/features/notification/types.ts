import type { Notification, NotificationType } from "@prisma/client";

export type NotificationItem = Omit<Notification, "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
    groupName?: string;
    expenseTitle?: string;
};

export type NotificationSummary = {
    items: NotificationItem[];
    unreadCount: number;
};

export type NotificationActionResponse<T = undefined> = {
    success: boolean;
    error?: string;
    data?: T;
};

export type NotificationTypeLabel = Record<NotificationType, string>;
