"use server";

import { revalidatePath } from "next/cache";
import { settingsFixtures } from "@/features/settings/mock-fixtures";
import {
  settingsPageDataSchema,
  settingsProfileUpdateSchema,
} from "@/features/settings/schema";
import type { SettingsPageData } from "@/features/settings/types";
import { getCurrentUserContext } from "@/lib/auth";
import prisma from "@/lib/prisma";

type SocialLink = SettingsPageData["profile"]["socialLinks"][number];
type SettingHighlight = SettingsPageData["profile"]["highlights"][number];

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

function parseSocialLinks(value: unknown): SocialLink[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof (item as { label?: unknown }).label !== "string" ||
        typeof (item as { value?: unknown }).value !== "string"
      ) {
        return null;
      }

      return {
        label: (item as { label: string }).label,
        value: (item as { value: string }).value,
      } satisfies SocialLink;
    })
    .filter((item): item is SocialLink => Boolean(item));

  return normalized.length > 0 ? normalized : null;
}

function parseHighlights(value: unknown): SettingHighlight[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof (item as { label?: unknown }).label !== "string" ||
        typeof (item as { value?: unknown }).value !== "string"
      ) {
        return null;
      }

      return {
        label: (item as { label: string }).label,
        value: (item as { value: string }).value,
      } satisfies SettingHighlight;
    })
    .filter((item): item is SettingHighlight => Boolean(item));

  return normalized.length > 0 ? normalized : null;
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
  const fallback = settingsPageDataSchema.parse(settingsFixtures);

  try {
    const context = await getCurrentUserContext();

    if (!context) {
      return { data: fallback, isDemo: true };
    }

    const { user, primaryGroupName, primaryGroupMemberCount } = context;
    const socialLinks =
      parseSocialLinks(user.socialLinks) ?? fallback.profile.socialLinks;
    const highlights =
      parseHighlights(user.profileHighlights) ?? [
        {
          label: "Trang thai",
          value: user.isActive ? "Dang hoat dong" : "Tam khoa",
        },
        {
          label: "Nhom chinh",
          value: primaryGroupName,
        },
        {
          label: "Thanh vien nhom",
          value: `${primaryGroupMemberCount} thanh vien`,
        },
      ];

    const data = settingsPageDataSchema.parse({
      profile: {
        ...fallback.profile,
        displayName: user.name,
        username: buildUsername({
          username: user.username,
          email: user.email,
          name: user.name,
          fallback: fallback.profile.username,
        }),
        accountTagline:
          normalizeText(user.accountTagline) ?? fallback.profile.accountTagline,
        avatarUrl: normalizeText(user.imgUrl),
        email: user.email,
        emailHint: buildEmailHint(user.email),
        bio: normalizeText(user.bio) ?? fallback.profile.bio,
        pronouns: normalizeText(user.pronouns) ?? fallback.profile.pronouns,
        url: normalizeText(user.profileUrl) ?? fallback.profile.url,
        company:
          normalizeText(user.company) ??
          normalizeText(primaryGroupName) ??
          fallback.profile.company,
        location: normalizeText(user.location) ?? fallback.profile.location,
        avatarTone:
          normalizeText(user.avatarTone) ?? fallback.profile.avatarTone,
        socialLinks,
        highlights,
      },
      navSections: fallback.navSections,
    });

    return { data, isDemo: false };
  } catch {
    return { data: fallback, isDemo: true };
  }
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
        username: normalizeText(parsed.data.username),
        accountTagline: normalizeText(parsed.data.accountTagline),
        imgUrl: normalizeText(parsed.data.avatarUrl),
        bio: normalizeText(parsed.data.bio),
        pronouns: normalizeText(parsed.data.pronouns),
        profileUrl: normalizeText(parsed.data.url),
        company: normalizeText(parsed.data.company),
        location: normalizeText(parsed.data.location),
        avatarTone: normalizeText(parsed.data.avatarTone),
        socialLinks: parsed.data.socialLinks.map((link) => ({
          label: link.label.trim(),
          value: link.value?.trim() ?? "",
        })),
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
        error instanceof Error ? error.message : "Unable to update profile",
    };
  }
}
