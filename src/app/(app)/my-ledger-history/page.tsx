import type { Metadata } from "next";
import { getMyLedgerHistory } from "@/features/my-ledger-history/action";
import { MyLedgerHistoryClient } from "@/features/my-ledger-history/components/MyLedgerHistoryClient";

export const metadata: Metadata = {
    title: "Lịch sử công nợ của tôi | Finance",
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyLedgerHistoryPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
        groupId?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const data = await getMyLedgerHistory({
        query: params.query,
        groupId: params.groupId,
        page: params.page,
        limit: 20,
    });

    return <MyLedgerHistoryClient data={data} />;
}
