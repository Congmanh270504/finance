import { getMembersManagementData } from "@/features/members/action";
import { MembersClient } from "@/features/members/components/MembersClient";

export const metadata = { title: "Thành viên | Chi tiêu nhóm" };

export default async function MembersPage() {
    const { data: managementData, isDemo } = await getMembersManagementData();

    return <MembersClient managementData={managementData} isDemo={isDemo} />;
}
