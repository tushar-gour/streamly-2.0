import { describe, expect, it } from "vitest";

import { canAccessRoute } from "@/lib/auth/route-guards";

describe("canAccessRoute", () => {
  it("rejects anonymous protected routes", () => {
    expect(
      canAccessRoute(
        { authenticated: true },
        {
          hasAnyPermission: () => false,
          hasAnyRole: () => false,
          status: "anonymous",
        }
      )
    ).toBe(false);
  });

  it("accepts authenticated permission match", () => {
    expect(
      canAccessRoute(
        { authenticated: true, anyPermission: ["user:admin"] },
        {
          hasAnyPermission: (permissions) => permissions.includes("user:admin"),
          hasAnyRole: () => false,
          status: "authenticated",
        }
      )
    ).toBe(true);
  });

  it("accepts role match when role and permission options exist", () => {
    expect(
      canAccessRoute(
        {
          authenticated: true,
          anyPermission: ["user:admin"],
          anyRole: ["admin"],
        },
        {
          hasAnyPermission: () => false,
          hasAnyRole: (roles) => roles.includes("admin"),
          status: "authenticated",
        }
      )
    ).toBe(true);
  });
});
