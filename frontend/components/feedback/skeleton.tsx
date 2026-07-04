import { cn } from "@/lib/utils/class-name";

export function Skeleton({ className }: Readonly<{ className?: string }>) {
  return <div className={cn("streamly-shimmer rounded-card", className)} />;
}
