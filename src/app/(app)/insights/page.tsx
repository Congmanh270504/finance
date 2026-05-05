import { redirect } from "next/navigation";
import { getInsightsYearlyStatsAction } from "@/features/insights/action";
import { InsightsClient } from "@/features/insights/components/InsightsClient";

export const metadata = { title: "Insights | Insights Your Expenses" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InsightsPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>;
}) {
    const params = await searchParams;
    const data = await getInsightsYearlyStatsAction({
        year: params.year,
    });

    if (!data) {
        redirect("/login");
    }

    return <InsightsClient data={data} />;
}
