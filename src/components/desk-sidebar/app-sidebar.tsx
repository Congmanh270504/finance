"use client";

import * as React from "react";
import Link from "next/link";
import { dashboardSidebarLinks } from "@/components/desk-sidebar/nav-data";
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
    CircleDollarSign,
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
import type { RecentExpenseGroupItem } from "@/features/groups/types";

function buildNavMainItems(recentExpenseGroups: RecentExpenseGroupItem[]) {
    return [
        {
            title: "Dashboard",
            url: "/",
            icon: <TerminalSquareIcon />,
            isActive: true,
            items: dashboardSidebarLinks,
        },
        {
            title: "Groups",
            url: "/groups",
            icon: <BotIcon />,
            isActive: true,
            items: recentExpenseGroups.map((group) => ({
                title: group.name,
                url: `/groups/${group.id}`,
            })),
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
            items: [{ title: "Account", url: "/settings/account" }],
        },
    ];
}

const data = {
    navSecondary: [
        // {
        //     title: "Add Expense",
        //     url: "/expense",
        //     icon: <SendIcon />,
        // },
        // {
        //     title: "Expense Table",
        //     url: "/expense",
        //     icon: <ReceiptTextIcon />,
        // },
        // {
        //     title: "Help",
        //     url: "/settings",
        //     icon: <LifeBuoyIcon />,
        // },
    ],
    projects: [
        {
            name: "Settlements",
            url: "/settlements",
            icon: <CircleDollarSign />,
        },
        // {
        //     name: "Track Debts",
        //     url: "/history",
        //     icon: <PieChartIcon />,
        // },
        // {
        //     name: "MocData Profile",
        //     url: "/settings",
        //     icon: <MapIcon />,
        // },
    ],
};

export function AppSidebar({
    groupName,
    memberCount,
    recentExpenseGroups = [],
    user,
    ...props
}: React.ComponentProps<typeof Sidebar> & {
    groupName: string;
    memberCount: number;
    recentExpenseGroups?: RecentExpenseGroupItem[];
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
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg border ">
                                    <img
                                        src="/logo.png"
                                        alt="Gia Pham Logo"
                                        className="h-8 w-auto rounded object-contain"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        CrewCash
                                    </span>
                                    <span className="truncate text-xs">
                                        Expense management for groups
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={buildNavMainItems(recentExpenseGroups)} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
