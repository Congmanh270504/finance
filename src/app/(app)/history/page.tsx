import { ExpenseHistoryClient } from "@/features/history/components/ExpenseHistoryClient";
import { fetchExpenseHistory } from "@/features/finance/action";
import {
    DEMO_CURRENT_MEMBER_ID,
    DEMO_GROUP_ID,
} from "@/features/finance/constants";
import { getCurrentUserContext } from "@/lib/auth";

export const metadata = { title: "Lich su | Chi tieu nhom" };

export default async function HistoryPage() {
    const context = await getCurrentUserContext();
    const groupId = context?.primaryGroupId ?? DEMO_GROUP_ID;
    const { data: history, isDemo } = await fetchExpenseHistory(groupId, 50);
    const currentMemberId = isDemo
        ? DEMO_CURRENT_MEMBER_ID
        : (context?.user.id ?? DEMO_CURRENT_MEMBER_ID);

    return (
        <div>
            <div className="px-4 pb-1 pt-4">
                <h1 className="text-lg font-bold">Lich su chi tieu</h1>
                <p className="text-xs text-muted-foreground">
                    {history.totalCount} khoan chi da ghi lai
                </p>
            </div>
            <ExpenseHistoryClient
                history={history}
                currentMemberId={currentMemberId}
                isDemo={isDemo}
            />
        </div>
    );
}
