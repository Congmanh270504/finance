import { Skeleton } from "@/components/ui/skeleton";

export default function MyLedgerHistoryLoading() {
    return (
        <div className="space-y-4 px-4 pb-6 pt-3">
            <div>
                <Skeleton className="h-6 w-44" />
                <Skeleton className="mt-2 h-4 w-full max-w-xl" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
            </div>

            <Skeleton className="h-[30rem] w-full rounded-2xl" />
        </div>
    );
}
