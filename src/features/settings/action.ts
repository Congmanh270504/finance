import { settingsFixtures } from "@/features/settings/mock-fixtures";
import { settingsPageDataSchema } from "@/features/settings/schema";
import type { SettingsPageData } from "@/features/settings/types";

export async function fetchSettingsPageData(): Promise<{
  data: SettingsPageData;
  isDemo: boolean;
}> {
  const data = settingsPageDataSchema.parse(settingsFixtures);
  return { data, isDemo: true };
}
