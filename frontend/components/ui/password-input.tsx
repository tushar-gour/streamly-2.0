"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/class-name";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function PasswordInput({
  className,
  error,
  id = "password",
  label = "Password",
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label
      className="grid gap-2 text-sm text-[color:var(--color-text-secondary)]"
      htmlFor={id}
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex min-h-12 items-center gap-3 rounded-input border border-[color:var(--color-border)] bg-[color:var(--color-background-soft)] px-4 transition duration-180 ease-streamly focus-within:border-periwinkle focus-within:shadow-[0_0_0_4px_rgba(141,132,255,0.12)]",
          error && "border-[color:var(--color-error)]",
          className
        )}
      >
        <Lock size={18} className="text-[color:var(--color-text-muted)]" />
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          className="min-w-0 flex-1 bg-transparent text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)]"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error ? (
        <span
          id={`${id}-error`}
          className="text-sm text-[color:var(--color-error)]"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
