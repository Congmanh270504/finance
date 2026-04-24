import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGroupLedgerDetail } from "@/features/group-details/action";
import { GroupDetailClient } from "@/features/group-details/components/GroupDetailClient";

export const metadata: Metadata = {
    title: "Chi tiet group | Finance",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroupDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        query?: string;
        memberId?: string;
        page?: string;
    }>;
}) {
    const routeParams = await params;
    const filters = await searchParams;
    const detail = await getGroupLedgerDetail({
        groupId: routeParams.id,
        query: filters.query,
        memberId: filters.memberId,
        page: filters.page,
        limit: 20,
    });

    if (!detail) {
        notFound();
    }

    return <GroupDetailClient detail={detail} />;
}
