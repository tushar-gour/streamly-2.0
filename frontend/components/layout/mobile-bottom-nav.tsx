"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileRoutes } from "@/lib/constants/routes";

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[color:var(--color-border)] bg-[color:var(--color-background-soft)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      {mobileRoutes.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "grid min-h-12 place-items-center gap-1 rounded-input bg-[color:var(--color-surface)] text-[11px] font-semibold text-periwinkle"
                : "grid min-h-12 place-items-center gap-1 rounded-input text-[11px] text-[color:var(--color-text-secondary)]"
            }
            href={href}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
