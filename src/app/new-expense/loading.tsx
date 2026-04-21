import { Skeleton } from "@/components/ui/skeleton";

export default function NewExpenseLoading() {
  return (
    <div className="space-y-4 pb-4 px-4 pt-4">
      <Skeleton className="h-11 w-full rounded-md" />
      <Skeleton className="h-11 w-full rounded-md" />
      <Skeleton className="h-11 w-full rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}
