import { apiRequest } from "@/lib/api/client";
import { createSessionCoordinator, withSessionLock } from "@/lib/auth/session-coordinator";
import type {
  AuthenticatedUserPayload,
  AuthResult,
  AuthTokens,
  CurrentUser,
  LoginPayload,
} from "@/lib/api/types";

function toAuthResult(payload: AuthenticatedUserPayload): AuthResult {
  return {
    user: payload.user,
    accessToken: payload.accessToken ?? null,
  };
}

export const authApi = {
  async loginWithPassword(payload: LoginPayload) {
    const response = await apiRequest<AuthenticatedUserPayload>(
      "/api/v1/users/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
        skipSessionRecovery: true,
      }
    );

    return toAuthResult(response.data);
  },

  async currentUser(accessToken?: string | null) {
    const response = await apiRequest<CurrentUser>(
      "/api/v1/users/current-user",
      { accessToken, skipSessionRecovery: true, cache: "no-store" }
    );

    return response.data;
  },

  async refreshSession() {
    const response = await apiRequest<AuthTokens>(
      "/api/v1/users/refresh-token",
      { method: "POST", skipSessionRecovery: true }
    );

    return {
      accessToken: response.data.accessToken ?? null,
    };
  },

  async logout(accessToken?: string | null) {
    await apiRequest<Record<string, never>>("/api/v1/users/logout", {
      accessToken,
      method: "POST",
    });
  },

  async logoutAll(accessToken?: string | null) {
    await apiRequest<Record<string, never>>("/api/v1/users/logout-all", {
      accessToken,
      method: "POST",
    });
  },
};

export const recoverSession = createSessionCoordinator({
  load: authApi.currentUser,
  rotate: authApi.refreshSession,
  exclusive: withSessionLock,
});
