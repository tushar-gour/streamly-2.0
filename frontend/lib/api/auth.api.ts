import { apiRequest } from "@/lib/api/api-client";
import type {
  ApiResponse,
  AuthTokens,
  CurrentUser,
  LoginPayload,
} from "@/lib/api/api.types";

export const authApi = {
  login(payload: LoginPayload) {
    return apiRequest<ApiResponse<AuthTokens>>("/api/v1/users/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  currentUser() {
    return apiRequest<ApiResponse<CurrentUser>>("/api/v1/users/current-user");
  },
  refreshSession() {
    return apiRequest<ApiResponse<AuthTokens>>("/api/v1/users/refresh-token", {
      method: "POST",
    });
  },
  logout() {
    return apiRequest<ApiResponse<null>>("/api/v1/users/logout", {
      method: "POST",
    });
  },
};
