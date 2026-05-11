"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getRecentNotificationsAction,
    markNotificationsReadAction,
} from "@/features/notification/action";
import type {
    NotificationItem,
    NotificationSummary,
} from "@/features/notification/types";
import { cn } from "@/lib/utils";

function formatNotificationTime(value: string) {
    const date = new Date(value);
    const diffInSeconds = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 1000),
    );

    if (diffInSeconds < 60) {
        return "Vua xong";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
        return `${diffInMinutes} phut truoc`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `${diffInHours} gio truoc`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays < 7) {
        return `${diffInDays} ngay truoc`;
    }

    return date.toLocaleDateString("vi-VN");
}

export function NotificationsMenu({
    initialNotifications,
}: {
    initialNotifications?: NotificationSummary;
}) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState<NotificationItem[]>(
        initialNotifications?.items ?? [],
    );
    const [unreadCount, setUnreadCount] = React.useState(
        initialNotifications?.unreadCount ?? 0,
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const [isMarkingRead, setIsMarkingRead] = React.useState(false);

    const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

    const loadNotifications = React.useCallback(async () => {
        setIsLoading(true);

        const result = await getRecentNotificationsAction();

        if (result.data) {
            setItems(result.data.items);
            setUnreadCount(result.data.unreadCount);
        }

        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        function handleRefresh() {
            void loadNotifications();
        }

        window.addEventListener("notifications:refresh", handleRefresh);

        return () => {
            window.removeEventListener("notifications:refresh", handleRefresh);
        };
    }, [loadNotifications]);

    React.useEffect(() => {
        if (!open) {
            return;
        }

        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [open]);

    function handleToggleNotifications() {
        const nextOpen = !open;

        setOpen(nextOpen);

        if (nextOpen) {
            void loadNotifications();
        }
    }

    async function handleMarkRead() {
        if (unreadCount === 0) {
            return;
        }

        setIsMarkingRead(true);
        const result = await markNotificationsReadAction();

        if (result.success) {
            setUnreadCount(0);
            setItems((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
            );
        }

        setIsMarkingRead(false);
    }

    return (
        <div className="relative" ref={containerRef}>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="relative rounded-full"
                aria-label="Notifications"
                aria-expanded={open}
                onClick={handleToggleNotifications}
            >
                <BellIcon className="size-4" />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">
                        {unreadLabel}
                    </span>
                ) : null}
            </Button>

            {open ? (
                <div className="fixed left-2 right-2 top-[3.75rem] z-50 overflow-hidden rounded-lg border bg-background shadow-xl md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.5rem)] md:w-[min(22rem,calc(100vw-2rem))]">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold">
                                Notifications
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {unreadCount} unread
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={unreadCount === 0 || isMarkingRead}
                            onClick={handleMarkRead}
                        >
                            {isMarkingRead ? (
                                <Loader2Icon className="size-3 animate-spin" />
                            ) : (
                                <CheckIcon className="size-3" />
                            )}
                            Mark as Read
                        </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto py-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                                <Loader2Icon className="size-4 animate-spin" />
                                Loading notifications...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        ) : (
                            items.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.href ?? "/expense"}
                                    className={cn(
                                        "flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted",
                                        !notification.isRead && "bg-primary/5",
                                    )}
                                    onClick={() => setOpen(false)}
                                >
                                    <span
                                        className={cn(
                                            "mt-1 size-2 rounded-full",
                                            notification.isRead
                                                ? "bg-muted-foreground/30"
                                                : "bg-rose-500",
                                        )}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">
                                            {notification.title}
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                            {notification.message}
                                        </span>
                                        <span className="mt-1 block text-[11px] text-muted-foreground">
                                            {formatNotificationTime(
                                                notification.createdAt,
                                            )}
                                        </span>
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
