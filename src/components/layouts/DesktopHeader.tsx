"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeChanger } from "@/components/theme-changer";
import { cn } from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function DesktopHeader({ className }: { className?: string }) {
    return (
        // <header
        //   className={cn(
        //     "sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 rounded-[1.35rem] border border-primary/10 bg-background/80 px-4 shadow-[0_10px_35px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md",
        //     className,
        //   )}
        // >
        //   <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors duration-200 rounded-md" />
        //   <Separator orientation="vertical" className="h-4 opacity-30" />
        //   <div className="flex-1" />
        //   <div className="flex items-center gap-1">
        //     <ThemeToggle />
        //     <ThemeChanger />
        //   </div>
        // </header>
        <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex justify-between px-4 w-full">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4 self-center!"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Build Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className=" flex items-center gap-1">
                    <ThemeToggle />
                    <ThemeChanger />
                </div>
            </div>
        </header>
    );
}
