import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/class-name";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

export function Input({
  className,
  error,
  icon,
  id,
  label,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/gu, "-");

  return (
    <label
      className="grid gap-2 text-sm text-[color:var(--color-text-secondary)]"
      htmlFor={inputId}
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex min-h-12 items-center gap-3 rounded-input border border-[color:var(--color-border)] bg-[rgba(8,11,19,0.38)] px-4 transition duration-180 ease-streamly focus-within:border-periwinkle focus-within:shadow-[0_0_0_4px_rgba(141,132,255,0.12)]",
          error && "border-[#FF6B6B]",
          className
        )}
      >
        {icon ? (
          <span className="text-[color:var(--color-text-muted)]">{icon}</span>
        ) : null}
        <input
          id={inputId}
          className="min-w-0 flex-1 bg-transparent text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </span>
      {error ? (
        <span id={`${inputId}-error`} className="text-sm text-[#FF8A8A]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
