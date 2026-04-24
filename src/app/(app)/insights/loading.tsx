import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <div className="space-y-4 pb-4 px-4 pt-4">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
