"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { viewerRoutes, utilityRoutes } from "@/lib/constants/routes";
import { useAuthStore } from "@/stores/auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const canUpload = user?.permissions?.includes("video:create");
  const canAdmin =
    user?.permissions?.includes("user:admin") ||
    user?.roles?.includes("admin");

  const routes = [
    ...viewerRoutes,
    ...(canUpload
      ? [{ label: "Creator Studio", href: "/studio", icon: Clapperboard }]
      : []),
    utilityRoutes[3],
    utilityRoutes[1],
    ...(canAdmin ? [utilityRoutes[2]] : []),
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-[color:var(--color-border)] bg-[color:var(--color-background-soft)] px-4 py-6 lg:flex">
      <Logo compact />
      <nav aria-label="Main navigation" className="mt-8 grid gap-1">
        {routes.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex min-h-11 items-center gap-3 rounded-input bg-indigo px-4 text-sm font-medium text-white"
                  : "flex min-h-11 items-center gap-3 rounded-input px-4 text-sm text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text-primary)]"
              }
              href={href}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
