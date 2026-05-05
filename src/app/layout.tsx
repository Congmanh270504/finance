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
import { TooltipProvider } from "@/components/ui/tooltip";
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
    icons: {
        icon: "/logo.png",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
                <TooltipProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                </TooltipProvider>
            </body>
        </html>
    );
}
