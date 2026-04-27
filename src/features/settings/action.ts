"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
    settingsDeleteAccountSchema,
    settingsPageDataSchema,
    settingsPasswordUpdateSchema,
    settingsProfileUpdateSchema,
    settingsStatusUpdateSchema,
} from "@/features/settings/schema";
import type {
    SettingsAccountData,
    SettingsNavSection,
    SettingsPageData,
} from "@/features/settings/types";
import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";

type SettingHighlight = SettingsPageData["profile"]["highlights"][number];

const SETTINGS_NAV_SECTIONS = [
    {
        title: "",
        items: [
            {
                id: "public-profile",
                label: "Public profile",
                href: "/settings",
                icon: "user",
                active: true,
            },
            {
                id: "account",
                label: "Account",
                href: "/settings/account",
                icon: "shield",
            },
            { id: "appearance", label: "Appearance", icon: "palette" },
            {
                id: "accessibility",
                label: "Accessibility",
                icon: "accessibility",
            },
            { id: "notifications", label: "Notifications", icon: "bell" },
        ],
    },
    {
        title: "Access",
        items: [
            {
                id: "billing",
                label: "Billing and licensing",
                icon: "credit-card",
                expandable: true,
            },
            { id: "emails", label: "Emails", icon: "mail" },
            { id: "password", label: "Password and authentication", icon: "key" },
            { id: "sessions", label: "Sessions", icon: "activity" },
            { id: "organizations", label: "Organizations", icon: "briefcase" },
            { id: "enterprises", label: "Enterprises", icon: "globe" },
        ],
    },
    {
        title: "Code, planning, and automation",
        items: [
            { id: "developer", label: "Developer settings", icon: "code2" },
            {
                id: "repositories",
                label: "Repositories",
                icon: "folder-git-2",
            },
            { id: "packages", label: "Packages", icon: "package", badge: "Preview" },
        ],
    },
] satisfies SettingsNavSection[];

function normalizeText(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

function slugifyUsername(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function buildUsername(input: {
    username?: string | null;
    email?: string | null;
    name?: string | null;
    fallback: string;
}) {
    const explicitUsername = normalizeText(input.username);
    if (explicitUsername) {
        return explicitUsername;
    }

    const emailPrefix = normalizeText(input.email?.split("@")[0]);
    if (emailPrefix) {
        return emailPrefix;
    }

    const normalizedName = normalizeText(input.name);
    const nameSlug = normalizedName ? slugifyUsername(normalizedName) : null;
    if (nameSlug) {
        return nameSlug;
    }

    return input.fallback;
}

function buildEmailHint(email: string) {
    return `Email dang duoc lien ket voi tai khoan cua ban la ${email}.`;
}

export type SettingsActionResponse<T = undefined> = {
    success: boolean;
    error?: string;
    data?: T;
};

export async function fetchSettingsPageData(): Promise<{
    data: SettingsPageData;
    isDemo: boolean;
}> {
    const context = await getCurrentUserContext();

    if (!context) {
        throw new Error("Not authenticated");
    }

    const { user, memberships, primaryGroupName } = context;
    const highlights = [
        {
            label: "Status",
            value: user.isActive ? "Active" : "Suspended",
        },
        {
            label: "Groups",
            value: `${memberships.length}`,
        },
    ] satisfies SettingHighlight[];

    const data = settingsPageDataSchema.parse({
        profile: {
            displayName: user.name,
            username: buildUsername({
                username: user.username,
                email: user.email,
                name: user.name,
                fallback: user.id,
            }),
            nickname: normalizeText(user.nickname) ?? "",
            phone: normalizeText(user.phone) ?? "",
            avatarUrl: normalizeText(user.imgUrl),
            email: user.email,
            emailHint: buildEmailHint(user.email),
            bio: normalizeText(user.bio) ?? "",
            pronouns: normalizeText(user.pronouns) ?? "",
            url: normalizeText(user.profileUrl) ?? "",
            company:
                normalizeText(user.company) ??
                normalizeText(primaryGroupName) ??
                "",
            location: normalizeText(user.location) ?? "",
            avatarTone: normalizeText(user.avatarTone) ?? "",
            highlights,
        },
        navSections: SETTINGS_NAV_SECTIONS,
    });

    return { data, isDemo: false };
}

export async function updateSettingsProfileAction(
    input: unknown,
): Promise<SettingsActionResponse<SettingsPageData["profile"]>> {
    const parsed = settingsProfileUpdateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid profile data",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    try {
        await prisma.user.update({
            where: {
                id: context.user.id,
            },
            data: {
                name: parsed.data.displayName.trim(),
                email: parsed.data.email.trim().toLowerCase(),
                nickname: normalizeText(parsed.data.nickname),
                phone: normalizeText(parsed.data.phone),
                username: normalizeText(parsed.data.username),
                imgUrl: normalizeText(parsed.data.avatarUrl),
                bio: normalizeText(parsed.data.bio),
                pronouns: normalizeText(parsed.data.pronouns),
                profileUrl: normalizeText(parsed.data.url),
                company: normalizeText(parsed.data.company),
                location: normalizeText(parsed.data.location),
                avatarTone: normalizeText(parsed.data.avatarTone),
            },
        });

        const { data } = await fetchSettingsPageData();

        revalidatePath("/");
        revalidatePath("/settings");

        return {
            success: true,
            data: data.profile,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unable to update profile",
        };
    }
}

export async function fetchSettingsAccountData(): Promise<SettingsAccountData> {
    const context = await getCurrentUserContext();

    if (!context) {
        throw new Error("Not authenticated");
    }

    const { user } = context;

    return {
        id: user.id,
        displayName: user.name,
        email: user.email,
        isActive: user.isActive,
        hasPassword: Boolean(user.passwordHash),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}

export async function updateSettingsPasswordAction(
    input: unknown,
): Promise<SettingsActionResponse> {
    const parsed = settingsPasswordUpdateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid password data",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    try {
        if (context.user.passwordHash) {
            const currentPasswordMatches = await compare(
                parsed.data.currentPassword ?? "",
                context.user.passwordHash,
            );

            if (!currentPasswordMatches) {
                return {
                    success: false,
                    error: "Current password is incorrect",
                };
            }
        }

        await prisma.user.update({
            where: {
                id: context.user.id,
            },
            data: {
                passwordHash: await hash(parsed.data.newPassword, 10),
            },
        });

        revalidatePath("/settings/account");

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unable to update password",
        };
    }
}

export async function updateSettingsStatusAction(
    input: unknown,
): Promise<SettingsActionResponse<Pick<SettingsAccountData, "isActive">>> {
    const parsed = settingsStatusUpdateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid account status",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    try {
        const user = await prisma.user.update({
            where: {
                id: context.user.id,
            },
            data: {
                isActive: parsed.data.isActive,
            },
            select: {
                isActive: true,
            },
        });

        revalidatePath("/settings/account");

        return {
            success: true,
            data: user,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unable to update account status",
        };
    }
}

export async function deleteSettingsAccountAction(
    input: unknown,
): Promise<SettingsActionResponse> {
    const parsed = settingsDeleteAccountSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid confirmation",
        };
    }

    const context = await getCurrentUserContext();

    if (!context) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    if (
        parsed.data.confirmationEmail.trim().toLowerCase() !==
        context.user.email.trim().toLowerCase()
    ) {
        return {
            success: false,
            error: "Confirmation email does not match this account",
        };
    }

    try {
        await prisma.user.delete({
            where: {
                id: context.user.id,
            },
        });

        revalidatePath("/");

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unable to delete account",
        };
    }
}
