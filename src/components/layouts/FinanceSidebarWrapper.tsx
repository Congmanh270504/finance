"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

interface FinanceSidebarWrapperProps {
  groupName: string;
  memberCount: number;
  children: React.ReactNode;
}

export function FinanceSidebarWrapper({
  groupName,
  memberCount,
  children,
}: FinanceSidebarWrapperProps) {
  return (
    <SidebarProvider>
      <DesktopSidebar groupName={groupName} memberCount={memberCount} />
      <SidebarInset className="flex flex-col md:p-2 md:pl-0">
        <DesktopHeader className="hidden md:flex" />
        <div className="md:hidden">
          <MobileHeader groupName={groupName} memberCount={memberCount} />
        </div>
        {/* pb-16 = bottom nav height on mobile */}
        <div className="relative flex-1 overflow-y-auto pb-16 md:pb-6 md:pt-2">
          <div className="md:mx-auto md:max-w-7xl">{children}</div>
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
