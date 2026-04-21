"use client";

import {
  AccessibilityIcon,
  BellIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  Code2Icon,
  CreditCardIcon,
  ExternalLinkIcon,
  FolderGit2Icon,
  GlobeIcon,
  KeyRoundIcon,
  MailIcon,
  PackageIcon,
  PaletteIcon,
  PencilIcon,
  ShieldIcon,
  UserIcon,
  WavesIcon,
} from "lucide-react";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  SettingsNavItem,
  SettingsPageData,
} from "@/features/settings/types";

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

function SettingsNavLink({ item }: { item: SettingsNavItem }) {
  const Icon = ICONS[item.icon];

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
        item.active
          ? "bg-primary/10 text-foreground ring-1 ring-primary/10"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "h-5 w-1 rounded-full",
          item.active ? "bg-primary" : "bg-transparent",
        )}
      />
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {item.badge}
        </span>
      ) : null}
      {item.expandable ? <ChevronDownIcon className="size-4 shrink-0" /> : null}
    </button>
  );
}

function FieldLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-foreground">{title}</label>
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function StaticTextArea({ value, rows = 4 }: { value: string; rows?: number }) {
  return (
    <textarea
      rows={rows}
      defaultValue={value}
      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  );
}

export function SettingsClient({
  pageData,
  isDemo,
}: {
  pageData: SettingsPageData;
  isDemo?: boolean;
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
                <div className="rounded-full border border-foreground/10 bg-white/70 p-1 shadow-sm">
                  <MemberAvatar
                    name={profile.displayName}
                    size="lg"
                    className="size-14 bg-zinc-200 text-zinc-800 md:size-16 md:text-lg"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-[2rem]">
                    {profile.displayName}{" "}
                    <span className="text-foreground/70">
                      ({profile.username})
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {profile.accountTagline}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-foreground/15 bg-white/70 md:w-auto"
              >
                Go to your personal profile
                <ExternalLinkIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-border/70 px-4 py-5 lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
              <div className="space-y-5">
                {navSections.map((section, index) => (
                  <div key={`${section.title}-${index}`} className="space-y-3">
                    {section.title ? (
                      <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                        {section.title}
                      </p>
                    ) : null}
                    <div className="space-y-1.5">
                      {section.items.map((item) => (
                        <SettingsNavLink key={item.id} item={item} />
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
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                      Profile settings
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                      Public profile
                    </h2>
                  </div>
                  {isDemo ? (
                    <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      Mock data preview
                    </div>
                  ) : null}
                </div>

                <Separator />

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <section className="space-y-6">
                    <div className="grid gap-2">
                      <FieldLabel
                        title="Name"
                        description="Ten cua ban co the hien thi xung quanh cac khu vuc ban dong gop hoac duoc nhac ten."
                      />
                      <Input defaultValue={profile.displayName} />
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel
                        title="Public email"
                        description={profile.emailHint}
                      />
                      <Select defaultValue={profile.email}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chon email cong khai" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={profile.email}>
                            {profile.email}
                          </SelectItem>
                          <SelectItem value="private">
                            Private - hidden
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel
                        title="Bio"
                        description="Mo ta ngan gon de hien thi tren ho so hoac khu vuc gioi thieu thanh vien."
                      />
                      <StaticTextArea value={profile.bio} />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="grid gap-2">
                        <FieldLabel title="Pronouns" />
                        <Select defaultValue={profile.pronouns}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chon cach xung ho" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={profile.pronouns}>
                              {profile.pronouns}
                            </SelectItem>
                            <SelectItem value="he/him">he/him</SelectItem>
                            <SelectItem value="she/her">she/her</SelectItem>
                            <SelectItem value="they/them">they/them</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel title="Avatar style" />
                        <Input defaultValue={profile.avatarTone} />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="grid gap-2">
                        <FieldLabel title="URL" />
                        <Input defaultValue={profile.url} />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel title="Company" />
                        <Input defaultValue={profile.company} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel title="Location" />
                      <Input defaultValue={profile.location} />
                    </div>

                    <div className="grid gap-3">
                      <FieldLabel title="Social accounts" />
                      <div className="space-y-3">
                        {profile.socialLinks.map((link) => (
                          <div
                            key={link.label}
                            className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3"
                          >
                            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <ExternalLinkIcon className="size-4" />
                            </div>
                            <div className="grid min-w-0 flex-1 gap-1">
                              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                {link.label}
                              </span>
                              <Input defaultValue={link.value} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border/70 pt-6 md:flex-row">
                      <Button className="md:min-w-36">Update profile</Button>
                      <Button variant="outline" className="md:min-w-36">
                        Reset changes
                      </Button>
                    </div>
                  </section>

                  <aside className="order-first xl:order-none">
                    <div className="rounded-[24px] border border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(240,253,250,0.9))] p-5 shadow-sm">
                      <p className="text-sm font-semibold text-foreground">
                        Profile picture
                      </p>
                      <div className="mt-5 flex flex-col items-start gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.95),rgba(161,161,170,0.1)_38%,rgba(39,39,42,0.65)_100%)] blur-sm" />
                          <div className="relative flex size-44 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-[radial-gradient(circle_at_35%_30%,#fafafa_0%,#e4e4e7_35%,#52525b_100%)] text-4xl font-black uppercase tracking-[0.18em] text-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_12px_30px_-18px_rgba(15,23,42,0.35)]">
                            {profile.displayName
                              .split(" ")
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")}
                          </div>
                        </div>
                        <Button variant="outline" className="bg-white/85">
                          <PencilIcon className="size-4" />
                          Edit
                        </Button>
                      </div>

                      <Separator className="my-5" />

                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Quick facts
                        </p>
                        {profile.highlights.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.label}
                            </span>
                            <span className="text-right font-medium text-foreground">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
