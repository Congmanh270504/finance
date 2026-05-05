"use client";

import Link from "next/link";
import { BellIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UserAvatar from "../user-avatar";

export function MobileHeader({
    groupName,
    memberCount,
    className,
    user,
}: {
    groupName: string;
    memberCount: number;
    className?: string;
    user?: {
        name: string;
        email: string;
        avatar: string;
    };
}) {
    const displayName = user?.name ?? groupName;
    const displayEmail = user?.email ?? `${memberCount} members`;

    return (
        <header
            className={cn(
                "sticky top-0 z-40 flex h-14 items-center justify-between border-b border-primary/10 glass-strong px-4",
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20 animate-pulse-glow">
                    <UserAvatar
                        src={user?.avatar}
                        alt={displayName}
                        fallback="Avatar"
                    />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight text-gradient">
                        {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {displayEmail}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    asChild
                >
                    <Link href="/members">
                        <BellIcon className="size-4" />
                        <span className="sr-only">Notifications</span>
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    asChild
                >
                    <Link href="/settings">
                        <SettingsIcon className="size-4" />
                        <span className="sr-only">Settings</span>
                    </Link>
                </Button>
            </div>
        </header>
    );
}
