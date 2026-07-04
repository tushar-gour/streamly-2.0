import { Skeleton } from "@/components/feedback/skeleton";

export function LoadingState() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-44" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}
