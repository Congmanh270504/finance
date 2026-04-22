import type { Metadata } from "next";
import ExpenseClient from "@/features/expense/components/ExpenseClient";
import { getExpenses } from "@/features/expense/action";
import { DEMO_GROUP_ID } from "@/features/finance/constants";

export const metadata: Metadata = { title: "Expense | Chi tiêu nhóm" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExpensePage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const result = await getExpenses({
        groupId: DEMO_GROUP_ID,
        query: params.query,
        page,
        limit: 10,
    });

    return (
        <ExpenseClient
            initialData={result.items}
            initialPagination={result.pagination}
            initialQuery={result.query}
            source={result.source}
        />
    );
}
