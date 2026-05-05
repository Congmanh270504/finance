export type SidebarNavLink = {
    title: string;
    url: string;
};

export type SidebarQuickAccessLink = SidebarNavLink & {
    kind: "page" | "group";
};

export const dashboardSidebarLinks: SidebarNavLink[] = [
    { title: "Overview", url: "/" },
    { title: "Group Expenses", url: "/expense" },
    // { title: "Settlements", url: "/settlements" },
    { title: "Expense History", url: "/my-ledger-history" },
    { title: "Insights", url: "/insights" },
];

export const dashboardQuickAccessLinks: SidebarQuickAccessLink[] =
    dashboardSidebarLinks
        .filter((item) => item.url !== "/")
        .map((item) => ({
            ...item,
            kind: "page",
        }));
