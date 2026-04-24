import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/lib/auth";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string }>;
}) {
    const session = await auth();

    if (session?.user) {
        redirect("/");
    }

    const params = await searchParams;
    const redirectTo =
        params.callbackUrl && params.callbackUrl.startsWith("/")
            ? params.callbackUrl
            : "/";

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm redirectTo={redirectTo} />
            </div>
        </div>
    );
}
