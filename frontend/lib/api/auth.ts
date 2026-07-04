import { apiRequest } from "@/lib/api/client";
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
      }
    );

    return toAuthResult(response.data);
  },

  async currentUser(accessToken?: string | null) {
    const response = await apiRequest<CurrentUser>(
      "/api/v1/users/current-user",
      { accessToken }
    );

    return response.data;
  },

  async refreshSession() {
    const response = await apiRequest<AuthTokens>(
      "/api/v1/users/refresh-token",
      { method: "POST" }
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
