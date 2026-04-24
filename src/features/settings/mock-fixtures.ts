import type { SettingsPageData } from "@/features/settings/types";

export const settingsFixtures: SettingsPageData = {
  profile: {
    displayName: "Tran Cong Manh",
    username: "congmanh270504",
    accountTagline: "Tai khoan ca nhan",
    avatarUrl: null,
    email: "congmanh270504@demo.local",
    emailHint:
      "Email hien dang o che do rieng tu. Ban co the doi sang dia chi cong khai neu can hien thi thong tin lien he.",
    bio: "Xay giao dien, toi uu flow va debug nhung cho team tai chinh nho.",
    pronouns: "anh/anh",
    url: "https://demo.local/congmanh270504",
    company: "Moc Data Studio",
    location: "Da Nang, Viet Nam",
    avatarTone: "Monochrome",
    socialLinks: [
      { label: "GitHub", value: "github.com/congmanh270504" },
      { label: "LinkedIn", value: "linkedin.com/in/congmanh270504" },
      { label: "Facebook", value: "facebook.com/congmanh270504" },
      { label: "Portfolio", value: "congmanh270504.dev" },
    ],
    highlights: [
      { label: "Vai tro", value: "Product engineer" },
      { label: "Font hien tai", value: "Be Vietnam Pro" },
      { label: "Theme", value: "Arctic Mint" },
    ],
  },
  navSections: [
    {
      title: "",
      items: [
        {
          id: "public-profile",
          label: "Public profile",
          icon: "user",
          active: true,
        },
        { id: "account", label: "Account", icon: "shield" },
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
  ],
};
