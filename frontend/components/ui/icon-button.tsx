import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/class-name";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({
  className,
  icon,
  label,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[rgba(24,29,43,0.72)] text-[color:var(--color-text-secondary)] transition hover:border-[rgba(141,132,255,0.48)] hover:text-[color:var(--color-text-primary)]",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
