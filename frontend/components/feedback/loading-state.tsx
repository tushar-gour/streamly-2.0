import { Skeleton } from "@/components/feedback/skeleton";

type LoadingStateProps = Readonly<{
  label?: string;
}>;

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      {label ? (
        <p className="text-center text-sm text-[color:var(--color-text-secondary)]">
          {label}
        </p>
      ) : null}
      <Skeleton className="h-44" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}
