export type SidebarNavLink = {
    title: string;
    url: string;
};

export type SidebarQuickAccessLink = SidebarNavLink & {
    kind: "page" | "group";
};

export const dashboardSidebarLinks: SidebarNavLink[] = [
    { title: "Overview", url: "/" },
    { title: "Expense", url: "/expense" },
    { title: "Debt History", url: "/my-ledger-history" },
    { title: "Expense History", url: "/history" },
    { title: "Insights", url: "/insights" },
];

export const dashboardQuickAccessLinks: SidebarQuickAccessLink[] =
    dashboardSidebarLinks
        .filter((item) => item.url !== "/")
        .map((item) => ({
            ...item,
            kind: "page",
        }));
