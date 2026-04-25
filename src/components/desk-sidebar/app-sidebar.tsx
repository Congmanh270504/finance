"use client";

import * as React from "react";
import Link from "next/link";
import {
    BookOpenIcon,
    BotIcon,
    FrameIcon,
    LifeBuoyIcon,
    MapIcon,
    ReceiptTextIcon,
    PieChartIcon,
    SendIcon,
    Settings2Icon,
    TerminalIcon,
    TerminalSquareIcon,
} from "lucide-react";
import { NavMain } from "@/components/desk-sidebar/nav-main";
import { NavProjects } from "@/components/desk-sidebar/nav-projects";
import { NavSecondary } from "@/components/desk-sidebar/nav-secondary";
import { NavUser } from "@/components/desk-sidebar/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: <TerminalSquareIcon />,
            isActive: true,
            items: [
                { title: "Overview", url: "/" },
                { title: "Expense", url: "/expense" },
                { title: "Debt History", url: "/my-ledger-history" },
                { title: "Expense History", url: "/history" },
                { title: "Insights", url: "/insights" },
            ],
        },
        {
            title: "Members",
            url: "/members",
            icon: <BotIcon />,
            items: [
                { title: "Balance", url: "/members" },
                { title: "QR Payment", url: "/members" },
            ],
        },
        {
            title: "Profile",
            url: "/settings",
            icon: <BookOpenIcon />,
            items: [
                { title: "Public Profile", url: "/settings" },
                { title: "Appearance", url: "/settings" },
                { title: "Notifications", url: "/settings" },
            ],
        },
        {
            title: "System Settings",
            url: "/settings",
            icon: <Settings2Icon />,
            items: [
                { title: "Account", url: "/settings" },
                { title: "Security", url: "/settings" },
                { title: "Customize UI", url: "/settings" },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Add Expense",
            url: "/expense",
            icon: <SendIcon />,
        },
        {
            title: "Expense Table",
            url: "/expense",
            icon: <ReceiptTextIcon />,
        },
        {
            title: "Help",
            url: "/settings",
            icon: <LifeBuoyIcon />,
        },
    ],
    projects: [
        {
            name: "Da Lat Travel Group",
            url: "/",
            icon: <FrameIcon />,
        },
        {
            name: "Track Debts",
            url: "/history",
            icon: <PieChartIcon />,
        },
        {
            name: "MocData Profile",
            url: "/settings",
            icon: <MapIcon />,
        },
    ],
};

export function AppSidebar({
    groupName,
    memberCount,
    user,
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    groupName: string;
    memberCount: number;
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}) {
    return (
        <Sidebar variant="inset" collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <TerminalIcon className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {groupName}
                                    </span>
                                    <span className="truncate text-xs">
                                        {memberCount} members
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
