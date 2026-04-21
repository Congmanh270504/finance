export type SettingsNavItem = {
  id: string;
  label: string;
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

export type SocialLink = {
  label: string;
  value: string;
};

export type SettingHighlight = {
  label: string;
  value: string;
};

export type SettingsProfile = {
  displayName: string;
  username: string;
  accountTagline: string;
  email: string;
  emailHint: string;
  bio: string;
  pronouns: string;
  url: string;
  company: string;
  location: string;
  avatarTone: string;
  socialLinks: SocialLink[];
  highlights: SettingHighlight[];
};

export type SettingsPageData = {
  profile: SettingsProfile;
  navSections: SettingsNavSection[];
};
