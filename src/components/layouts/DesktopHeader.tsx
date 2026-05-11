"use client";

import { ThemeChanger } from "@/components/theme-changer";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { NotificationSummary } from "@/features/notification/types";
import { cn } from "@/lib/utils";
import { DynamicBreadcrumb } from "../dynamic-breadcrumb";
import { AnimatedThemeToggle } from "../ui/animated-theme-toggle";
import { NotificationsMenu } from "./NotificationsMenu";

export function DesktopHeader({
    className,
    initialNotifications,
}: {
    className?: string;
    initialNotifications?: NotificationSummary;
}) {
    return (
        <header
            className={cn(
                "flex h-16 shrink-0 items-center gap-2 border-b px-2",
                className,
            )}
        >
            <div className="flex justify-between px-4 w-full">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4 self-center!"
                    />
                    <DynamicBreadcrumb />
                </div>
                <div className="flex items-center gap-2 ">
                    <NotificationsMenu initialNotifications={initialNotifications} />

                    <AnimatedThemeToggle />

                    <ThemeChanger />
                </div>
            </div>
        </header>
    );
}
