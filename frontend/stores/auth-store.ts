"use client";

import { create } from "zustand";

import { authApi } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/api/errors";
import type { LoginPayload } from "@/lib/api/types";
import type { AuthSession } from "@/lib/auth/auth.types";
import type { CurrentUser } from "@/lib/api/types";

type AuthStore = AuthSession & {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  error: string | null;
  bootstrapCurrentUser: () => Promise<void>;
  loginWithPassword: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearAuthError: () => void;
  setAuthUser: (user: CurrentUser, accessToken?: string | null) => void;
  setPartialSession: () => void;
  clearSession: () => void;
  hasAnyPermission: (permissions: readonly string[]) => boolean;
  hasAnyRole: (roles: readonly string[]) => boolean;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "anonymous",
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isLoading: false,
  error: null,

  bootstrapCurrentUser: async () => {
    set({ error: null, isBootstrapping: true });

    try {
      let accessToken = get().accessToken;

      if (!accessToken) {
        const refreshedSession = await authApi.refreshSession();
        accessToken = refreshedSession.accessToken;
      }

      const user = await authApi.currentUser(accessToken);
      set({
        accessToken,
        error: null,
        isAuthenticated: true,
        isBootstrapping: false,
        status: "authenticated",
        user,
      });
    } catch {
      set({
        accessToken: null,
        error: null,
        isAuthenticated: false,
        isBootstrapping: false,
        status: "anonymous",
        user: null,
      });
    }
  },

  loginWithPassword: async (payload) => {
    set({ error: null, isLoading: true });

    try {
      const result = await authApi.loginWithPassword(payload);
      set({
        accessToken: result.accessToken,
        error: null,
        isAuthenticated: true,
        isLoading: false,
        status: "authenticated",
        user: result.user,
      });
    } catch (error) {
      set({
        error: mapAuthError(error),
        isAuthenticated: false,
        isLoading: false,
        status: "anonymous",
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ error: null, isLoading: true });

    try {
      await authApi.logout(get().accessToken);
    } finally {
      set({
        accessToken: null,
        error: null,
        isAuthenticated: false,
        isLoading: false,
        status: "anonymous",
        user: null,
      });
    }
  },

  logoutAll: async () => {
    set({ error: null, isLoading: true });

    try {
      await authApi.logoutAll(get().accessToken);
    } finally {
      set({
        accessToken: null,
        error: null,
        isAuthenticated: false,
        isLoading: false,
        status: "anonymous",
        user: null,
      });
    }
  },

  clearAuthError: () => set({ error: null }),

  setAuthUser: (user, accessToken = null) =>
    set({
      accessToken,
      error: null,
      isAuthenticated: true,
      status: "authenticated",
      user,
    }),

  setPartialSession: () => set({ isAuthenticated: false, status: "partial" }),

  clearSession: () =>
    set({
      accessToken: null,
      error: null,
      isAuthenticated: false,
      status: "anonymous",
      user: null,
    }),

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
