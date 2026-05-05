"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map URL paths to Vietnamese titles
const pathTitleMap: Record<string, string> = {
    "/groups": "Groups",
    "/expenses": "Expenses",
    "/settlements": "Settlements",
    "/my-ledger-history": "Expense History",
    "/insights": "Insights",
    "/settings": "Settings",
};

export function DynamicBreadcrumb() {
    const pathname = usePathname();

    // If on home page, just show "Trang chủ"
    if (pathname === "/") {
        return (
            <Link href="/" className="text-base font-medium">
                Dashboard
            </Link>
        );
    }

    // Get the page title from the path
    const pageTitle = pathTitleMap[pathname];

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {pageTitle && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
