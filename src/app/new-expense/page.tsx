import { NewExpenseForm } from "@/features/new-expense/components/NewExpenseForm";
import {
  fetchBalancesSummary,
  extractMembersFromSummary,
} from "@/features/finance/action";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/features/finance/constants";

export const metadata = { title: "Thêm chi tiêu | Chi tiêu nhóm" };

export default async function NewExpensePage() {
  const { data: summary } = await fetchBalancesSummary(DEMO_GROUP_ID);
  const members = extractMembersFromSummary(summary);
  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold">Thêm khoản chi</h1>
        <p className="text-xs text-muted-foreground">
          Nhập thông tin và chia đều cho nhóm
        </p>
      </div>
      <NewExpenseForm
        members={members}
        currentMemberId={DEMO_CURRENT_MEMBER_ID}
        groupId={DEMO_GROUP_ID}
      />
    </div>
  );
}
