import { fetchSettingsPageData } from "@/features/settings/action";
import { SettingsClient } from "@/features/settings/components/SettingsClient";

export const metadata = { title: "Cài đặt | Finance" };

export default async function SettingsPage() {
  const { data, isDemo } = await fetchSettingsPageData();

  return <SettingsClient profile={data.profile} isDemo={isDemo} />;
}
