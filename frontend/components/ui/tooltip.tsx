import type { ReactNode } from "react";

export function Tooltip({
  children,
  content,
}: Readonly<{ children: ReactNode; content: string }>) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-56 -translate-x-1/2 rounded-input border border-[color:var(--color-border)] bg-elevated px-3 py-2 text-xs text-[color:var(--color-text-secondary)] opacity-0 shadow-soft transition group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}
