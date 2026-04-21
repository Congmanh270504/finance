"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart2Icon,
    ClockIcon,
    HomeIcon,
    PlusCircleIcon,
    SettingsIcon,
    UsersIcon,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    primary?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/history", label: "History", icon: ClockIcon },
    {
        href: "/new-expense",
        label: "New Expense",
        icon: PlusCircleIcon,
        primary: true,
    },
    { href: "/members", label: "Members", icon: UsersIcon },
    // { href: "/settings", label: "Settings", icon: SettingsIcon },
    { href: "/insights", label: "Insights", icon: BarChart2Icon },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-primary/10 glass-strong safe-area-inset-bottom">
            {NAV_ITEMS.map(({ href, label, icon: Icon, primary }) => {
                const isActive = pathname === href;

                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all duration-200",
                            primary
                                ? "relative"
                                : isActive
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {primary ? (
                            <span
                                className={cn(
                                    "-mt-5 flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
                                    isActive
                                        ? "scale-110 bg-primary text-primary-foreground shadow-[0_0_20px_4px_var(--glow-color)]"
                                        : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-[0_0_16px_2px_var(--glow-color)]",
                                )}
                            >
                                <Icon className="size-5" />
                            </span>
                        ) : (
                            <Icon
                                className={cn(
                                    "size-5 transition-transform",
                                    isActive && "scale-110",
                                )}
                            />
                        )}
                        <span
                            className={
                                primary ? "font-semibold text-primary" : ""
                            }
                        >
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
