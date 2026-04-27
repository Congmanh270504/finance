export type SettingsNavItem = {
  id: string;
  label: string;
  href?: string;
  icon:
    | "user"
    | "shield"
    | "palette"
    | "accessibility"
    | "bell"
    | "credit-card"
    | "mail"
    | "key"
    | "activity"
    | "briefcase"
    | "globe"
    | "code2"
    | "folder-git-2"
    | "package";
  active?: boolean;
  badge?: string;
  expandable?: boolean;
};

export type SettingsNavSection = {
  title: string;
  items: SettingsNavItem[];
};

export type SettingHighlight = {
  label: string;
  value: string;
};

export type SettingsProfile = {
  displayName: string;
  username: string;
  nickname: string;
  phone: string;
  avatarUrl?: string | null;
  email: string;
  emailHint: string;
  bio: string;
  pronouns: string;
  url: string;
  company: string;
  location: string;
  avatarTone: string;
  highlights: SettingHighlight[];
};

export type SettingsPageData = {
  profile: SettingsProfile;
  navSections: SettingsNavSection[];
};

export type SettingsAccountData = {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};
