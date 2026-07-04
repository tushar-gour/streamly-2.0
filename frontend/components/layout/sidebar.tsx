import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { viewerRoutes, utilityRoutes } from "@/lib/constants/routes";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[color:var(--color-border)] bg-[rgba(8,11,19,0.72)] px-5 py-6 lg:block">
      <Logo compact />
      <nav className="mt-8 grid gap-2">
        {viewerRoutes.map(({ href, icon: Icon, label }, index) => (
          <Link
            key={href}
            className={
              index === 0
                ? "flex min-h-11 items-center gap-3 rounded-input bg-indigo px-4 text-sm font-medium text-white"
                : "flex min-h-11 items-center gap-3 rounded-input px-4 text-sm text-[color:var(--color-text-secondary)] transition hover:bg-[rgba(24,29,43,0.72)] hover:text-[color:var(--color-text-primary)]"
            }
            href={href}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-card border border-[color:var(--color-border)] bg-[rgba(24,29,43,0.68)] p-4">
        <p className="text-sm font-medium">Premium Plan</p>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Ad-free streaming
        </p>
        <Button className="mt-4 w-full" size="sm">
          Upgrade
        </Button>
      </div>
      <nav className="absolute bottom-6 left-5 right-5 grid gap-2">
        {utilityRoutes.slice(1, 3).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            className="flex min-h-10 items-center gap-3 rounded-input px-3 text-sm text-[color:var(--color-text-secondary)] hover:bg-[rgba(24,29,43,0.72)]"
            href={href}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
