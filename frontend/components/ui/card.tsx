import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/class-name";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.78)] shadow-soft",
        className
      )}
      {...props}
    />
  );
}
