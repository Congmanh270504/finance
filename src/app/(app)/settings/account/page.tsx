import { fetchSettingsAccountData } from "@/features/settings/action";
import { AccountSettingsClient } from "@/features/settings/components/AccountSettingsClient";

export const metadata = { title: "Tai khoan | Finance" };

export default async function AccountSettingsPage() {
    const account = await fetchSettingsAccountData();

    return <AccountSettingsClient account={account} />;
}
