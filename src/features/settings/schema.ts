import { z } from "zod";

export const settingHighlightSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const settingsNavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
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
  nickname: z.string(),
  phone: z.string(),
  avatarUrl: z.string().nullable().optional(),
  email: z.string(),
  emailHint: z.string(),
  bio: z.string(),
  pronouns: z.string(),
  url: z.string(),
  company: z.string(),
  location: z.string(),
  avatarTone: z.string(),
  highlights: z.array(settingHighlightSchema),
});

export const settingsProfileUpdateSchema = settingsProfileSchema
  .pick({
    displayName: true,
    username: true,
    nickname: true,
    phone: true,
    avatarUrl: true,
    email: true,
    bio: true,
    pronouns: true,
    url: true,
    company: true,
    location: true,
    avatarTone: true,
  })
  .extend({
    displayName: z.string().trim().min(1, "Name is required"),
    username: z.string().trim().min(1, "Username is required"),
    nickname: z.string().trim().optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    avatarUrl: z.string().trim().optional().nullable().or(z.literal("")),
    email: z.string().trim().email("Email is invalid"),
    bio: z.string().trim().optional().or(z.literal("")),
    pronouns: z.string().trim().optional().or(z.literal("")),
    url: z.string().trim().optional().or(z.literal("")),
    company: z.string().trim().optional().or(z.literal("")),
    location: z.string().trim().optional().or(z.literal("")),
    avatarTone: z.string().trim().optional().or(z.literal("")),
  });

export const settingsPasswordUpdateSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim().min(6, "Confirm password is required"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const settingsStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

export const settingsDeleteAccountSchema = z.object({
  confirmationEmail: z.string().trim().email("Email is invalid"),
});

export const settingsPageDataSchema = z.object({
  profile: settingsProfileSchema,
  navSections: z.array(settingsNavSectionSchema),
});

export type SettingsPageInput = z.infer<typeof settingsPageDataSchema>;
export type SettingsProfileUpdateInput = z.infer<
  typeof settingsProfileUpdateSchema
>;
