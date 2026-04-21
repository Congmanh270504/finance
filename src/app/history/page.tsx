import { ExpenseHistoryClient } from "@/features/history/components/ExpenseHistoryClient";
import { fetchExpenseHistory } from "@/features/finance/action";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/features/finance/constants";

export const metadata = { title: "Lịch sử | Chi tiêu nhóm" };

export default async function HistoryPage() {
  const { data: history, isDemo } = await fetchExpenseHistory(DEMO_GROUP_ID, 50);
  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold">Lịch sử chi tiêu</h1>
        <p className="text-xs text-muted-foreground">
          {history.totalCount} khoản chi đã ghi lại
        </p>
      </div>
      <ExpenseHistoryClient
        history={history}
        currentMemberId={DEMO_CURRENT_MEMBER_ID}
        isDemo={isDemo}
      />
    </div>
  );
}
