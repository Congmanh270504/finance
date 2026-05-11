import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
    return (
        <div className="px-4 py-4 md:px-6 md:py-6">
            <div className="mx-auto max-w-full overflow-hidden rounded-[28px] border border-border/60 bg-card/80 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                <div className="border-b border-border/70 px-4 py-5 md:px-8 md:py-7">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="mt-2 h-4 w-40" />
                </div>

                <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="border-b border-border/70 px-4 py-5 lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </aside>

                    <main className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-7">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-56" />
                            <Skeleton className="h-4 w-full max-w-3xl" />
                            <Skeleton className="h-[34rem] w-full rounded-2xl" />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
