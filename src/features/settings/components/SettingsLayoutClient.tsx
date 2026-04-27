"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AccessibilityIcon,
    BellIcon,
    BriefcaseIcon,
    ChevronDownIcon,
    Code2Icon,
    CreditCardIcon,
    FolderGit2Icon,
    GlobeIcon,
    KeyRoundIcon,
    MailIcon,
    PackageIcon,
    PaletteIcon,
    ShieldIcon,
    UserIcon,
    WavesIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
    SettingsNavItem,
    SettingsPageData,
} from "@/features/settings/types";
import UserAvatar from "@/components/user-avatar";

const ICONS = {
    user: UserIcon,
    shield: ShieldIcon,
    palette: PaletteIcon,
    accessibility: AccessibilityIcon,
    bell: BellIcon,
    "credit-card": CreditCardIcon,
    mail: MailIcon,
    key: KeyRoundIcon,
    activity: WavesIcon,
    briefcase: BriefcaseIcon,
    globe: GlobeIcon,
    code2: Code2Icon,
    "folder-git-2": FolderGit2Icon,
    package: PackageIcon,
} as const;

function isActivePath(pathname: string, href?: string) {
    if (!href || href === "#") {
        return false;
    }

    if (href === "/settings") {
        return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

function SettingsNavLink({ item }: { item: SettingsNavItem }) {
    const pathname = usePathname();
    const Icon = ICONS[item.icon];
    const active =
        isActivePath(pathname, item.href) || (!item.href && item.active);
    const className = cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
        active
            ? "bg-primary/10 text-foreground ring-1 ring-primary/10"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
    );
    const content = (
        <>
            <span
                className={cn(
                    "h-5 w-1 rounded-full",
                    active ? "bg-primary" : "bg-transparent",
                )}
            />
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate font-medium">
                {item.label}
            </span>
            {item.badge ? (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                </span>
            ) : null}
            {item.expandable ? (
                <ChevronDownIcon className="size-4 shrink-0" />
            ) : null}
        </>
    );

    if (item.href) {
        return (
            <Link href={item.href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className={className}>
            {content}
        </button>
    );
}

export function SettingsLayoutClient({
    pageData,
    children,
}: {
    pageData: SettingsPageData;
    children: React.ReactNode;
}) {
    const { profile, navSections } = pageData;

    return (
        <div className="px-4 py-4 md:px-6 md:py-6">
            <div className="mx-auto max-w-full">
                <div className="overflow-hidden rounded-[28px] border border-border/60 bg-card/80 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <div className="relative border-b border-border/70 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.92)_42%,rgba(6,182,212,0.06)_100%)] px-4 py-5 md:px-8 md:py-7">
                        <div
                            className="pointer-events-none absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_58%)] md:block"
                            aria-hidden
                        />
                        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <UserAvatar
                                    src={profile.avatarUrl || undefined}
                                    alt={profile.displayName}
                                    fallback={profile.displayName
                                        .charAt(0)
                                        .toUpperCase()}
                                />
                                <div className="min-w-0">
                                    <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-[2rem]">
                                        {profile.displayName}{" "}
                                        <span className="text-foreground/70">
                                            ({profile.username})
                                        </span>
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.nickname || profile.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="border-b border-border/70 px-4 py-5 lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
                            <div className="space-y-5">
                                {navSections.map((section, index) => (
                                    <div
                                        key={`${section.title}-${index}`}
                                        className="space-y-3"
                                    >
                                        {section.title ? (
                                            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                                                {section.title}
                                            </p>
                                        ) : null}
                                        <div className="space-y-1.5">
                                            {section.items.map((item) => (
                                                <SettingsNavLink
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ))}
                                        </div>
                                        {index < navSections.length - 1 ? (
                                            <Separator className="mt-4" />
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <main className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-7">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
