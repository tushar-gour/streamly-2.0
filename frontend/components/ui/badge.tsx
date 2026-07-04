import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/class-name";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border border-[color:var(--color-border)] bg-[rgba(141,132,255,0.1)] px-3 text-xs font-medium text-periwinkle",
        className
      )}
      {...props}
    />
  );
}
