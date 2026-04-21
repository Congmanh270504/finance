---
name: dashboard-ui-spec
description: "Use when: build or update a dashboard page UI with grouped module cards and an AppSidebar menu that matches the LEA Admin UI (collapsed + expanded, active state, permissions, search param filter)."
---

# Dashboard UI Spec (LEA-style)

## Goal

Create a dashboard page with grouped module cards and a sidebar that visually and behaviorally matches the LEA Admin UI. The output must use the same data shapes, filtering rules, and interaction states as the reference UI.

## Required Stack

- React + Next.js
- Tailwind CSS
- lucide-react icons only
- shadcn/ui primitives for `Sidebar`, `Collapsible`, `DropdownMenu`

## Data Model (single source of truth)

Use a shared `navGroups` array for both the sidebar and dashboard cards.

```tsx
import type { LucideIcon } from "lucide-react";

type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    moduleKey?: string | null;
};

type NavGroup = {
    label: string;
    icon: LucideIcon;
    items: NavItem[];
};

export const navGroups: NavGroup[] = [
    {
        label: "Tong quan & Thong ke",
        icon: LayoutDashboard,
        items: [
            {
                name: "Tong quan",
                href: "/dashboard",
                icon: LayoutDashboard,
                moduleKey: "dashboard",
            },
            {
                name: "Thong ke",
                href: "/thong-ke",
                icon: BarChart2,
                moduleKey: "thong-ke",
            },
            {
                name: "Chi tieu KPI",
                href: "/pacing-chi-tieu",
                icon: Target,
                moduleKey: "pacing-chi-tieu",
            },
        ],
    },
    // ...the rest of groups with the same shape
];
```

## Permission Rules

- `moduleKey` undefined/null: always visible.
- `isAdmin === true`: always visible.
- otherwise: visible only when `permissions[moduleKey]?.canView === true`.

```ts
function canShowItem(
    item: NavItem,
    isAdmin: boolean,
    permissions: Record<string, { canView?: boolean }>,
) {
    if (!item.moduleKey) return true;
    if (isAdmin) return true;
    return permissions[item.moduleKey]?.canView === true;
}
```

## Active Route Logic

```ts
function isPathActive(pathname: string, href: string) {
    if (href === "#") return false;
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
}
```

## Sidebar UI (AppSidebar)

Behavior:

- 2 states: expanded vs collapsed.
- Expanded: groups are collapsible; only 1 group open at a time.
- Collapsed: show only group icons; hover/click opens a dropdown with items.
- Active item is highlighted and shows a right-side indicator bar.

Skeleton (match the reference structure):

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { navGroups } from "@/config/nav";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar({ permissions = {}, isAdmin = false, ...props }) {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const availableGroups = useMemo(() => {
        return navGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) =>
                    canShowItem(item, isAdmin, permissions),
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [isAdmin, permissions]);

    const activeGroupLabel = useMemo(() => {
        return (
            availableGroups.find((group) =>
                group.items.some((item) => isPathActive(pathname, item.href)),
            )?.label ?? null
        );
    }, [availableGroups, pathname]);

    const [openGroup, setOpenGroup] = useState(
        activeGroupLabel ?? availableGroups[0]?.label ?? null,
    );

    return (
        <Sidebar {...props}>
            <SidebarHeader>{/* logo block */}</SidebarHeader>
            <SidebarContent className="gap-0">
                {isCollapsed ? (
                    <SidebarGroup className="px-1 py-2">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2">
                                {availableGroups.map((group) => {
                                    const hasActiveChild = group.items.some(
                                        (item) =>
                                            isPathActive(pathname, item.href),
                                    );
                                    return (
                                        <SidebarMenuItem key={group.label}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <SidebarMenuButton
                                                        IS_ACTIVE={
                                                            hasActiveChild
                                                        }
                                                        tooltip={group.label}
                                                        className={cn(
                                                            "h-9 cursor-pointer transition-all",
                                                            hasActiveChild
                                                                ? "bg-primary text-white"
                                                                : "border-sidebar-border/60 bg-background/40 hover:border-primary/20 hover:bg-primary/5",
                                                        )}
                                                    >
                                                        <span className="flex w-full items-center justify-center">
                                                            <group.icon className="size-4" />
                                                        </span>
                                                    </SidebarMenuButton>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    side="right"
                                                    align="start"
                                                    sideOffset={10}
                                                    className="w-64 rounded-xl"
                                                >
                                                    <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        {group.label}
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {group.items.map((item) => {
                                                        const IS_ACTIVE =
                                                            isPathActive(
                                                                pathname,
                                                                item.href,
                                                            );
                                                        return (
                                                            <DropdownMenuItem
                                                                key={item.name}
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    className={cn(
                                                                        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2",
                                                                        IS_ACTIVE &&
                                                                            "bg-primary/10 text-primary",
                                                                    )}
                                                                >
                                                                    <item.icon className="size-4" />
                                                                    <span className="truncate">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : (
                    availableGroups.map((group) => {
                        const isOpen = openGroup === group.label;
                        return (
                            <Collapsible
                                key={group.label}
                                open={isOpen}
                                onOpenChange={(next) =>
                                    setOpenGroup(next ? group.label : null)
                                }
                                className="px-1 pt-2.5"
                            >
                                <SidebarGroup className="p-0">
                                    <CollapsibleTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                "flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-all",
                                                isOpen
                                                    ? "bg-primary text-white"
                                                    : "hover:bg-primary/5",
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-flex h-8 w-8 items-center justify-center",
                                                    isOpen
                                                        ? "text-white"
                                                        : "text-sidebar-foreground/80",
                                                )}
                                            >
                                                <group.icon className="size-4" />
                                            </span>
                                            <span
                                                className={cn(
                                                    "flex-1 truncate text-[12px] font-semibold uppercase tracking-wide",
                                                    isOpen
                                                        ? "text-white"
                                                        : "text-sidebar-foreground/80",
                                                )}
                                            >
                                                {group.label}
                                            </span>
                                            <ChevronRight
                                                className={cn(
                                                    "size-4 transition-transform duration-200",
                                                    isOpen
                                                        ? "text-white"
                                                        : "text-sidebar-foreground/60",
                                                    isOpen && "rotate-90",
                                                )}
                                            />
                                        </button>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                        <SidebarGroupContent className="pt-2">
                                            <SidebarMenu className="ml-3.5 gap-1 border-l border-sidebar-border/50 pl-2">
                                                {group.items.map((item) => {
                                                    const IS_ACTIVE =
                                                        isPathActive(
                                                            pathname,
                                                            item.href,
                                                        );
                                                    return (
                                                        <SidebarMenuItem
                                                            key={item.name}
                                                        >
                                                            <SidebarMenuButton
                                                                asChild
                                                                IS_ACTIVE={
                                                                    IS_ACTIVE
                                                                }
                                                                tooltip={
                                                                    item.name
                                                                }
                                                                className={cn(
                                                                    "relative h-9 rounded-md pr-3 transition-all",
                                                                    IS_ACTIVE
                                                                        ? "bg-primary font-semibold text-white hover:bg-primary"
                                                                        : "text-sidebar-foreground/80 hover:bg-primary/5 hover:text-sidebar-foreground",
                                                                )}
                                                            >
                                                                <Link
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    className="flex items-center gap-2.5"
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-sidebar-border/60 bg-background/60 text-sidebar-foreground/70 transition-colors",
                                                                            IS_ACTIVE &&
                                                                                "border-primary/30 bg-primary/10 text-primary",
                                                                        )}
                                                                    >
                                                                        <item.icon className="size-3.5" />
                                                                    </span>
                                                                    <span className="truncate">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                    {IS_ACTIVE ? (
                                                                        <span className="absolute right-1.5 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary/80" />
                                                                    ) : null}
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    );
                                                })}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        );
                    })
                )}
            </SidebarContent>

            <SidebarFooter>{/* user dropdown */}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
```

## Dashboard Page UI (module cards)

Behavior:

- Search query from URL: `?q=`
- Filter by search and permission
- Render group header with count
- Render cards in responsive grid

Skeleton:

```tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { navGroups } from "@/config/nav";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const search = searchParams.get("q") ?? "";
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const filtered = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((m) => {
                const matchSearch =
                    m.name.toLowerCase().includes(search.toLowerCase()) ||
                    (m.description || "")
                        .toLowerCase()
                        .includes(search.toLowerCase());
                const matchPermission = m.moduleKey
                    ? canView(m.moduleKey)
                    : true;
                return matchSearch && matchPermission;
            }),
        }))
        .filter((g) => g.items.length > 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">Khong tim thay module nao</p>
                    <p className="text-sm mt-1">Thu tim voi tu khoa khac</p>
                </div>
            ) : (
                filtered.map((group) => (
                    <section key={group.label}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-5 w-1 rounded-full bg-primary" />
                            <h2 className="font-bold text-foreground text-base">
                                {group.label}
                            </h2>
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {group.items.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
                            {group.items.map((mod) => (
                                <ModuleCard key={mod.name} module={mod} />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
```

## Module Card visuals

- Card uses hover wave gradient from bottom.
- Bottom bar animates on hover.
- Icon container changes bg + text color on hover.
- Chevron slides right on hover.

Use a `colorMap` like the reference to map `blue|indigo|emerald|rose|orange|purple|cyan|sky|amber|teal|yellow|violet|slate|red`.

## Acceptance Checklist

- Sidebar expanded + collapsed behavior matches spec.
- Active route is highlighted in both sidebar and dropdown.
- Permissions filter applied to both sidebar and dashboard.
- Dashboard cards grouped, searchable by URL query, and show empty state.
- Only lucide-react icons used.

## Example Prompts

- "Dung skill nay tao dashboard page va AppSidebar cho project moi"
- "Ap dung dashboard-ui-spec de render module cards tu navGroups"
