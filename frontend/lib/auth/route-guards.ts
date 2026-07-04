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

  const hasPermissionRequirement = Boolean(permission.anyPermission?.length);
  const hasRoleRequirement = Boolean(permission.anyRole?.length);
  const matchesPermission =
    !hasPermissionRequirement ||
    context.hasAnyPermission(permission.anyPermission ?? []);
  const matchesRole =
    !hasRoleRequirement || context.hasAnyRole(permission.anyRole ?? []);

  if (hasPermissionRequirement && hasRoleRequirement) {
    return matchesPermission || matchesRole;
  }

  return matchesPermission && matchesRole;
}
