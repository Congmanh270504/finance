import type { Metadata } from "next";
import ExpenseClient from "@/features/expense/components/ExpenseClient";
import {
    getExpenseFormGroups,
    getExpenseFormMembers,
    getExpenses,
} from "@/features/expense/action";
import { getCurrentUserContext } from "@/lib/auth";

export const metadata: Metadata = { title: "Expense | Group Expense Tracker" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExpensePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const context = await getCurrentUserContext();
    const [result, groupsResult] = await Promise.all([
        getExpenses({
            page,
            limit: 20,
        }),
        getExpenseFormGroups(),
    ]);
    const initialGroupId =
        context?.primaryGroupId ?? groupsResult.groups[0]?.id ?? "";
    const membersResult = initialGroupId
        ? await getExpenseFormMembers(initialGroupId)
        : { members: [], source: "database" as const };
    const currentMemberId = membersResult.members.some(
        (member) => member.id === context?.user.id,
    )
        ? (context?.user.id ?? "")
        : (membersResult.members[0]?.id ?? "");

    return (
        <ExpenseClient
            initialData={result.items}
            initialPagination={result.pagination}
            source={result.source}
            groups={groupsResult.groups}
            currentMemberId={currentMemberId}
            initialGroupId={initialGroupId}
        />
    );
}
