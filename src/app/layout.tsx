import type { Metadata } from "next";
import {
    Be_Vietnam_Pro,
    Geist,
    Geist_Mono,
    Inter,
    Plus_Jakarta_Sans,
    Roboto,
} from "next/font/google";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/desk-sidebar/app-sidebar";
import { CursorGlow } from "@/components/cursor-glow";
import { BottomNav } from "@/components/layouts/BottomNav";
import { DesktopHeader } from "@/components/layouts/DesktopHeader";
import { MobileHeader } from "@/components/layouts/MobileHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DEMO_GROUP_ID, DEMO_GROUP_NAME } from "@/features/finance/constants";
import {
    extractMembersFromSummary,
    fetchBalancesSummary,
} from "@/features/finance/action";
import "./globals.css";
import { cn } from "@/lib/utils";

const beVietnam = Be_Vietnam_Pro({
    subsets: ["latin", "vietnamese"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-be-vietnam",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-roboto",
    display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: "swap",
});

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
    display: "swap",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Finance",
    description: "Quan ly chi tieu nhom",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { data: summary } = await fetchBalancesSummary(DEMO_GROUP_ID);
    const members = extractMembersFromSummary(summary);

    return (
        <html
            lang="vi"
            className={cn(
                beVietnam.variable,
                inter.variable,
                roboto.variable,
                jakarta.variable,
                geist.variable,
                geistMono.variable,
                "h-full font-sans antialiased",
            )}
        >
            <body className="min-h-full flex flex-col font-sans antialiased">
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
                            groupName={DEMO_GROUP_NAME}
                            memberCount={members.length}
                        />
                        <SidebarInset className="flex flex-col">
                            <DesktopHeader className="hidden md:flex" />
                            <div className="md:hidden">
                                <MobileHeader
                                    groupName={DEMO_GROUP_NAME}
                                    memberCount={members.length}
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
                    <Toaster position="top-center" richColors />
                </div>
            </body>
        </html>
    );
}
