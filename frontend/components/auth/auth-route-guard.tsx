"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import type { RoutePermission } from "@/lib/auth/auth.types";
import { canAccessRoute } from "@/lib/auth/route-guards";
import { useAuthStore } from "@/stores/auth-store";

type AuthRouteGuardProps = Readonly<{
  children: ReactNode;
  permission?: RoutePermission;
  guestOnly?: boolean;
}>;

export function AuthRouteGuard({
  children,
  guestOnly = false,
  permission,
}: AuthRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  const canAccess = permission
    ? canAccessRoute(permission, {
        hasAnyPermission,
        hasAnyRole,
        status,
      })
    : true;

  useEffect(() => {
    if (isBootstrapping) return;

    if (guestOnly && isAuthenticated) {
      router.replace("/home");
      return;
    }

    if (permission?.authenticated && !isAuthenticated) {
      const nextPath = encodeURIComponent(pathname);
      router.replace(`/login?next=${nextPath}`);
    }
  }, [
    guestOnly,
    isAuthenticated,
    isBootstrapping,
    pathname,
    permission,
    router,
  ]);

  if (isBootstrapping) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Checking session" />
      </div>
    );
  }

  if (guestOnly && isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Opening Streamly" />
      </div>
    );
  }

  if (permission?.authenticated && !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Opening sign in" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <EmptyState
          eyebrow="Access"
          title="Access unavailable."
          description="Your account does not have permission to open this page."
        />
      </div>
    );
  }

  return children;
}
