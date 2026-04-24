import { DashboardClient } from "@/features/dashboard/components/DashboardClient";
import {
    fetchBalancesSummary,
    fetchExpenseHistory,
} from "@/features/finance/action";
import {
    DEMO_CURRENT_MEMBER_ID,
    DEMO_GROUP_ID,
} from "@/features/finance/constants";
import { getCurrentUserContext } from "@/lib/auth";

export const metadata = { title: "Overview | Group payments" };

export default async function DashboardPage() {
    const context = await getCurrentUserContext();
    const groupId = context?.primaryGroupId ?? DEMO_GROUP_ID;
    const [summaryResult, historyResult] = await Promise.all([
        fetchBalancesSummary(groupId),
        fetchExpenseHistory(groupId, 5),
    ]);
    const currentMemberId = summaryResult.isDemo
        ? DEMO_CURRENT_MEMBER_ID
        : (context?.user.id ?? DEMO_CURRENT_MEMBER_ID);

    return (
        <DashboardClient
            summary={summaryResult.data}
            history={historyResult.data}
            currentMemberId={currentMemberId}
            isDemo={summaryResult.isDemo}
        />
    );
}
