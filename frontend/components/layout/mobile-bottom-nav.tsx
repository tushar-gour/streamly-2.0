import Link from "next/link";

import { mobileRoutes } from "@/lib/constants/routes";

export function MobileBottomNav() {
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[color:var(--color-border)] bg-[color:var(--color-background-soft)] px-2 py-2 backdrop-blur lg:hidden">
      {mobileRoutes.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          className="grid min-h-12 place-items-center gap-1 rounded-input text-[11px] text-[color:var(--color-text-secondary)]"
          href={href}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
