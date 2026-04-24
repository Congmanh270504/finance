import { z } from "zod";

export const socialLinkSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const settingHighlightSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const settingsNavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.enum([
    "user",
    "shield",
    "palette",
    "accessibility",
    "bell",
    "credit-card",
    "mail",
    "key",
    "activity",
    "briefcase",
    "globe",
    "code2",
    "folder-git-2",
    "package",
  ]),
  active: z.boolean().optional(),
  badge: z.string().optional(),
  expandable: z.boolean().optional(),
});

export const settingsNavSectionSchema = z.object({
  title: z.string(),
  items: z.array(settingsNavItemSchema),
});

export const settingsProfileSchema = z.object({
  displayName: z.string(),
  username: z.string(),
  accountTagline: z.string(),
  avatarUrl: z.string().nullable().optional(),
  email: z.string(),
  emailHint: z.string(),
  bio: z.string(),
  pronouns: z.string(),
  url: z.string(),
  company: z.string(),
  location: z.string(),
  avatarTone: z.string(),
  socialLinks: z.array(socialLinkSchema),
  highlights: z.array(settingHighlightSchema),
});

export const settingsPageDataSchema = z.object({
  profile: settingsProfileSchema,
  navSections: z.array(settingsNavSectionSchema),
});

export type SettingsPageInput = z.infer<typeof settingsPageDataSchema>;
