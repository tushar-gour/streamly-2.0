"use client";

import { create } from "zustand";

import { authApi, recoverSession } from "@/lib/api/auth";
import { configureSessionRecovery } from "@/lib/api/client";
import { publishSessionChange } from "@/lib/auth/session-events";
import { mapAuthError, StreamlyApiError } from "@/lib/api/errors";
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

let sessionGeneration = 0;

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "anonymous",
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isLoading: false,
  error: null,

  bootstrapCurrentUser: async () => {
    const generation = sessionGeneration;
    set({ error: null, isBootstrapping: true });
    try {
      const result = await recoverSession();
      if (generation !== sessionGeneration) return;
      set({
        ...result,
        error: null,
        isAuthenticated: true,
        isBootstrapping: false,
        status: "authenticated",
      });
    } catch {
      if (generation !== sessionGeneration) return;
      get().clearSession();
    }
  },

  loginWithPassword: async (payload) => {
    set({ error: null, isLoading: true });

    try {
      const result = await authApi.loginWithPassword(payload);
      sessionGeneration += 1;
      publishSessionChange();
      set({
        accessToken: result.accessToken,
        error: null,
        isAuthenticated: true,
        isLoading: false,
        isBootstrapping: false,
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
      get().clearSession();
      publishSessionChange();
    } finally {
      set({ isLoading: false });
    }
  },

  logoutAll: async () => {
    set({ error: null, isLoading: true });
    try {
      await authApi.logoutAll(get().accessToken);
      get().clearSession();
      publishSessionChange();
    } finally {
      set({ isLoading: false });
    }
  },

  clearAuthError: () => set({ error: null }),

  setAuthUser: (user, accessToken = null) => {
    if (get().user?._id !== user._id) {
      sessionGeneration += 1;
      publishSessionChange();
    }
    set({
      accessToken,
      error: null,
      isAuthenticated: true,
      isBootstrapping: false,
      status: "authenticated",
      user,
    });
  },

  setPartialSession: () => set({ isAuthenticated: false, status: "partial" }),

  clearSession: () => {
    sessionGeneration += 1;
    set({
      accessToken: null,
      error: null,
      isAuthenticated: false,
      isBootstrapping: false,
      status: "anonymous",
      user: null,
    });
  },

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

configureSessionRecovery({
  identity: () => useAuthStore.getState().user?._id,
  recover: async (expectedUserId) => {
    const generation = sessionGeneration;
    try {
      const result = await recoverSession();
      const state = useAuthStore.getState();
      if (generation !== sessionGeneration) return false;
      if (result.user._id !== expectedUserId || state.user?._id !== expectedUserId) {
        state.clearSession();
        return false;
      }
      state.setAuthUser(result.user, result.accessToken);
      return true;
    } catch (error) {
      if (generation === sessionGeneration && error instanceof StreamlyApiError && error.statusCode === 401) {
        useAuthStore.getState().clearSession();
      }
      return false;
    }
  },
  changed: () => useAuthStore.getState().clearSession(),
});
