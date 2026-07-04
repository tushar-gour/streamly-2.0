import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse, CurrentUser } from "@/lib/api/api.types";

export const profileApi = {
  updateAccount(payload: Partial<CurrentUser>) {
    return apiRequest<ApiResponse<CurrentUser>>(
      "/api/v1/users/update-account",
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },
};
