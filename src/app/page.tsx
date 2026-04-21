import { DashboardClient } from "@/features/dashboard/components/DashboardClient";
import {
    fetchBalancesSummary,
    fetchExpenseHistory,
} from "@/features/finance/action";
import {
    DEMO_GROUP_ID,
    DEMO_CURRENT_MEMBER_ID,
} from "@/features/finance/constants";

export const metadata = { title: "Overview | Group payments" };

export default async function DashboardPage() {
    const [summaryResult, historyResult] = await Promise.all([
        fetchBalancesSummary(DEMO_GROUP_ID),
        fetchExpenseHistory(DEMO_GROUP_ID, 5),
    ]);
    return (
        <DashboardClient
            summary={summaryResult.data}
            history={historyResult.data}
            currentMemberId={DEMO_CURRENT_MEMBER_ID}
            isDemo={summaryResult.isDemo}
        />
    );
}
