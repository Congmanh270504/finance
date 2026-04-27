import { redirect } from "next/navigation";
import { getDashboardOverviewAction } from "@/features/dashboard/action";
import { DashboardClient } from "@/features/dashboard/components/DashboardClient";

export const metadata = { title: "Overview | Group payments" };

export default async function DashboardPage() {
    const dashboard = await getDashboardOverviewAction();

    if (!dashboard) {
        redirect("/login");
    }

    return <DashboardClient dashboard={dashboard} />;
}
