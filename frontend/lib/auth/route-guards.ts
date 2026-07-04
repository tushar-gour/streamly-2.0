import type { RoutePermission } from "@/lib/auth/auth.types";

export function canAccessRoute(
  permission: RoutePermission,
  context: {
    status: "anonymous" | "partial" | "authenticated";
    hasAnyPermission: (permissions: readonly string[]) => boolean;
    hasAnyRole: (roles: readonly string[]) => boolean;
  }
) {
  if (permission.authenticated && context.status !== "authenticated") {
    return false;
  }

  if (
    permission.anyPermission?.length &&
    !context.hasAnyPermission(permission.anyPermission)
  ) {
    return false;
  }

  if (permission.anyRole?.length && !context.hasAnyRole(permission.anyRole)) {
    return false;
  }

  return true;
}
