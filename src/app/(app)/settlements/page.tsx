import type { Metadata } from "next";
import { getSettlements } from "@/features/settlements/action";
import { SettlementClient } from "@/features/settlements/components/SettlementClient";

export const metadata: Metadata = {
    title: "Settlements | Finance",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettlementsPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string;
        groupId?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const data = await getSettlements({
        query: params.q,
        groupId: params.groupId,
        page: params.page,
        limit: 20,
    });

    return <SettlementClient data={data} />;
}
