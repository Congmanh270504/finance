import { Skeleton } from "@/components/ui/skeleton";

export default function ExpenseLoading() {
    return (
        <div className="space-y-4 px-4 pb-6 pt-3">
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
            </div>

            <Skeleton className="h-14 w-full rounded-2xl" />

            <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </div>

            <Skeleton className="h-[28rem] w-full rounded-2xl" />
        </div>
    );
}
