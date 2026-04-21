"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2Icon,
  ChevronRightIcon,
  ClockIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PlusCircleIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: boolean;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tong quan", icon: HomeIcon },
  { href: "/history", label: "Lich su", icon: ClockIcon },
  { href: "/members", label: "Thanh vien", icon: UsersIcon },
  { href: "/insights", label: "Thong ke", icon: BarChart2Icon },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/new-expense", label: "Them chi tieu", icon: PlusCircleIcon, accent: true },
  { href: "/settings", label: "Cai dat", icon: SettingsIcon },
];

function NavSection({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <div className="space-y-2">
      {open ? (
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
          {title}
        </p>
      ) : null}
      <SidebarMenu>
        {items.map(({ href, label, icon: Icon, accent }) => {
          const isActive = pathname === href;

          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={label}
                className={cn(
                  "h-10 rounded-xl border border-transparent px-3 transition-all duration-200",
                  accent &&
                    !isActive &&
                    "bg-primary/8 text-primary hover:bg-primary/12 hover:text-primary",
                  isActive &&
                    "border-primary/15 bg-primary/10 text-primary shadow-sm hover:bg-primary/15",
                )}
              >
                <Link href={href}>
                  <Icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
                  <span className="truncate">{label}</span>
                  {open ? (
                    <ChevronRightIcon
                      className={cn(
                        "ml-auto size-4 shrink-0 opacity-0 transition-opacity",
                        (isActive || accent) && "opacity-70",
                      )}
                    />
                  ) : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}

export function DesktopSidebar({
  groupName,
  memberCount,
}: {
  groupName: string;
  memberCount: number;
}) {
  const { open } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-transparent px-2 py-2"
    >
      <div className="flex h-full flex-col rounded-3xl border border-primary/10 bg-sidebar/90 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md">
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="h-auto min-h-14 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/14 via-primary/6 to-transparent px-3 py-3"
                tooltip={`${groupName} · ${memberCount} thanh vien`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <WalletCardsIcon className="size-5" />
                </div>
                {open ? (
                  <>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {groupName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {memberCount} thanh vien dang hoat dong
                      </p>
                    </div>
                    <MoreHorizontalIcon className="size-4 shrink-0 text-muted-foreground" />
                  </>
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-3 pb-3">
          <div className="space-y-4">
            {open ? (
              <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/12 via-primary/6 to-transparent p-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <SparklesIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Workspace overview
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Giao dien desktop dang dung layout sidebar-08 voi nav chinh va nav phu tach rieng.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <NavSection title="Main" items={MAIN_NAV_ITEMS} />

            <SidebarSeparator className="mx-0" />

            <NavSection title="Secondary" items={SECONDARY_NAV_ITEMS} />
          </div>
        </SidebarContent>

        <SidebarFooter className="p-3 pt-0">
          <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white">
                CM
              </div>
              {open ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      Cong Manh
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Personal workspace
                    </p>
                  </div>
                  <SettingsIcon className="size-4 shrink-0 text-muted-foreground" />
                </>
              ) : null}
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
