import type { ReactNode } from "react";

export function Sheet({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 rounded-t-modal border border-[color:var(--color-border)] bg-elevated p-5 shadow-soft md:hidden">
      {children}
    </aside>
  );
}
