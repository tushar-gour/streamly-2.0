"use client";

import { create } from "zustand";

import type { AuthSession } from "@/lib/auth/auth.types";
import type { CurrentUser } from "@/lib/api/api.types";

type AuthStore = AuthSession & {
  setAuthenticatedUser: (user: CurrentUser, accessToken?: string) => void;
  setPartialSession: () => void;
  clearSession: () => void;
  hasAnyPermission: (permissions: readonly string[]) => boolean;
  hasAnyRole: (roles: readonly string[]) => boolean;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "anonymous",
  user: null,
  accessToken: null,
  setAuthenticatedUser: (user, accessToken) =>
    set({ status: "authenticated", user, accessToken: accessToken ?? null }),
  setPartialSession: () => set({ status: "partial" }),
  clearSession: () =>
    set({ status: "anonymous", user: null, accessToken: null }),
  hasAnyPermission: (permissions) => {
    const userPermissions = get().user?.permissions ?? [];
    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  },
  hasAnyRole: (roles) => {
    const userRoles = get().user?.roles ?? [];
    return roles.some((role) => userRoles.includes(role));
  },
}));
