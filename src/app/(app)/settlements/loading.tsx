import { Skeleton } from "@/components/ui/skeleton";

export default function SettlementsLoading() {
    return (
        <div className="space-y-4 px-4 pb-6 pt-3">
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                </div>
            </div>

            <Skeleton className="h-[34rem] w-full rounded-2xl" />
        </div>
    );
}
