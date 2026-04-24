import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/desk-sidebar/app-sidebar";
import { CursorGlow } from "@/components/cursor-glow";
import { BottomNav } from "@/components/layouts/BottomNav";
import { DesktopHeader } from "@/components/layouts/DesktopHeader";
import { MobileHeader } from "@/components/layouts/MobileHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUserContext } from "@/lib/auth";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const context = await getCurrentUserContext();

    if (!context) {
        redirect("/login");
    }

    return (
        <div className="relative min-h-screen bg-background scanlines">
            <CursorGlow />
            <div
                className="pointer-events-none fixed inset-0 overflow-hidden"
                aria-hidden
            >
                <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute top-1/3 -left-32 h-64 w-64 rounded-full bg-primary/4 blur-3xl" />
                <div className="absolute -bottom-48 right-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            </div>
            <SidebarProvider>
                <AppSidebar
                    groupName={context.primaryGroupName}
                    memberCount={context.primaryGroupMemberCount}
                    user={{
                        name: context.user.name,
                        email: context.user.email,
                        avatar: context.user.imgUrl ?? "",
                    }}
                />
                <SidebarInset className="flex flex-col">
                    <DesktopHeader className="hidden md:flex" />
                    <div className="md:hidden">
                        <MobileHeader
                            groupName={context.primaryGroupName}
                            memberCount={context.primaryGroupMemberCount}
                        />
                    </div>
                    <div className="relative flex-1 overflow-y-auto pb-16 md:pb-6 md:pt-2">
                        <div className="md:mx-auto md:max-w-7xl 4xl:max-w-full">
                            {children}
                        </div>
                    </div>
                    <div className="md:hidden">
                        <BottomNav />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
