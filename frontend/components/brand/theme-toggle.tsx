"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      aria-pressed={theme === "light"}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3 text-[color:var(--color-text-secondary)]"
      type="button"
      onClick={toggleTheme}
    >
      <Moon
        size={16}
        className={theme === "dark" ? "text-periwinkle" : undefined}
      />
      <span className="size-6 rounded-full bg-indigo shadow-[0_0_18px_rgba(108,92,231,0.48)]" />
      <Sun
        size={16}
        className={theme === "light" ? "text-periwinkle" : undefined}
      />
    </button>
  );
}
