import type * as React from "react";
import { fetchSettingsPageData } from "@/features/settings/action";
import { SettingsLayoutClient } from "@/features/settings/components/SettingsLayoutClient";

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data } = await fetchSettingsPageData();

    return (
        <SettingsLayoutClient pageData={data}>{children}</SettingsLayoutClient>
    );
}
