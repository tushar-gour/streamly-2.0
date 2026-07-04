import type { ReactNode } from "react";

import { AuthRouteGuard } from "@/components/auth/auth-route-guard";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { RoutePermission } from "@/lib/auth/auth.types";

type AppShellProps = Readonly<{
  children: ReactNode;
  permission?: RoutePermission;
}>;

export function AppShell({ children, permission }: AppShellProps) {
  const shell = (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Topbar />
        <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );

  if (!permission) {
    return shell;
  }

  return <AuthRouteGuard permission={permission}>{shell}</AuthRouteGuard>;
}
