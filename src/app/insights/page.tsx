import { InsightsClient } from "@/features/insights/components/InsightsClient";
import { fetchInsightsCharts } from "@/features/finance/action";
import { DEMO_GROUP_ID } from "@/features/finance/constants";

export const metadata = { title: "Thống kê | Chi tiêu nhóm" };

export default async function InsightsPage() {
  const { data: charts, isDemo } = await fetchInsightsCharts(DEMO_GROUP_ID);
  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold">Thống kê</h1>
        <p className="text-xs text-muted-foreground">
          Phân tích chi tiêu theo thời gian
        </p>
      </div>
      <InsightsClient charts={charts} isDemo={isDemo} />
    </div>
  );
}
