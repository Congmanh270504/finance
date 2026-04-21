import { MembersClient } from "@/features/members/components/MembersClient";
import { fetchBalancesSummary } from "@/features/finance/action";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/features/finance/constants";

export const metadata = { title: "Thành viên | Chi tiêu nhóm" };

export default async function MembersPage() {
  const { data: summary, isDemo } = await fetchBalancesSummary(DEMO_GROUP_ID);
  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold">Thành viên</h1>
        <p className="text-xs text-muted-foreground">
          Số dư và công nợ tổng cộng của từng người:{" "}
          {new Intl.NumberFormat("vi-VN").format(summary.totalOutstanding)} đ
        </p>
      </div>
      <MembersClient
        summary={summary}
        currentMemberId={DEMO_CURRENT_MEMBER_ID}
        isDemo={isDemo}
      />
    </div>
  );
}
