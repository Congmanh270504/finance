import { InsightsClient } from "@/features/insights/components/InsightsClient";
import { fetchInsightsCharts } from "@/features/finance/action";
import { DEMO_GROUP_ID } from "@/features/finance/constants";
import { getCurrentUserContext } from "@/lib/auth";

export const metadata = { title: "Thong ke | Chi tieu nhom" };

export default async function InsightsPage() {
    const context = await getCurrentUserContext();
    const { data: charts, isDemo } = await fetchInsightsCharts(
        context?.primaryGroupId ?? DEMO_GROUP_ID,
    );

    return (
        <div>
            <div className="px-4 pb-1 pt-4">
                <h1 className="text-lg font-bold">Thong ke</h1>
                <p className="text-xs text-muted-foreground">
                    Phan tich chi tieu theo thoi gian
                </p>
            </div>
            <InsightsClient charts={charts} isDemo={isDemo} />
        </div>
    );
}
