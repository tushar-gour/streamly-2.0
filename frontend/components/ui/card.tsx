import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/class-name";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        className
      )}
      {...props}
    />
  );
}
