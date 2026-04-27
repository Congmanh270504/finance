import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/desk-sidebar/app-sidebar";
import { CursorGlow } from "@/components/cursor-glow";
import { BottomNav } from "@/components/layouts/BottomNav";
import { DesktopHeader } from "@/components/layouts/DesktopHeader";
import { MobileHeader } from "@/components/layouts/MobileHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getRecentExpenseGroupsAction } from "@/features/groups/action";
import { getRecentNotificationsAction } from "@/features/notification/action";
import { getCurrentUserContext } from "@/lib/auth";
import Image from "next/image";

function PageFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative h-full min-h-0 w-full overflow-hidden px-2">
            <div className="pointer-events-none absolute inset-2 z-10">
                <div className="absolute left-[88px] right-[88px] top-[16px] border-t border-border" />
                <div className="absolute bottom-[24px] left-[88px] right-[88px] border-t border-border" />
                <div className="absolute bottom-[100px] left-0 top-[100px] border-l border-border" />
                <div className="absolute bottom-[100px] right-0 top-[100px] border-l border-border" />
            </div>

            <Image
                src="/png-clipart-recursos-watercolor-flower-s-green-and-pink-petaled-flowers.png"
                alt=""
                fill
                aria-hidden
                priority
                className="opacity-20"
            />

            <Image
                src="/images-removebg-preview.png"
                alt=""
                width={100}
                height={100}
                aria-hidden
                className="absolute left-2 top-2 z-10 rotate-x-180 object-contain"
            />
            <Image
                src="/images-removebg-preview.png"
                alt=""
                width={100}
                height={100}
                aria-hidden
                className="absolute right-2 top-2 z-10 rotate-180 object-contain"
            />
            <Image
                src="/images-removebg-preview.png"
                alt=""
                width={100}
                height={100}
                aria-hidden
                className="absolute bottom-2 left-2 z-10 object-contain"
            />
            <Image
                src="/images-removebg-preview.png"
                alt=""
                width={100}
                height={100}
                aria-hidden
                className="absolute bottom-2 right-2 z-10 rotate-y-180 object-contain"
            />

            <div className="relative z-20 h-full min-h-0 overflow-y-auto p-5 md:px-15 md:py-10">
                {children}
            </div>
        </div>
    );
}

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const context = await getCurrentUserContext();

    if (!context) {
        redirect("/login");
    }

    const [notificationsResult, recentGroupsResult] = await Promise.all([
        getRecentNotificationsAction(),
        getRecentExpenseGroupsAction(),
    ]);

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
                    recentExpenseGroups={recentGroupsResult.data ?? []}
                    user={{
                        name: context.user.name,
                        email: context.user.email,
                        avatar: context.user.imgUrl ?? "",
                    }}
                />
                <SidebarInset className="flex min-h-0 flex-col">
                    <DesktopHeader
                        className="hidden md:flex"
                        initialNotifications={notificationsResult.data}
                    />
                    <div className="md:hidden">
                        <MobileHeader
                            user={{
                                name: context.user.name,
                                email: context.user.email,
                                avatar: context.user.imgUrl ?? "",
                            }}
                            groupName={context.primaryGroupName}
                            memberCount={context.primaryGroupMemberCount}
                        />
                    </div>
                    <div className="relative min-h-0 flex-1 overflow-y-auto pb-16 md:p-1">
                        <div className="h-full md:mx-auto md:max-w-7xl 4xl:max-w-full">
                            <PageFrame>{children}</PageFrame>
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
