import { apiRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";

export const profileApi = {
  updateAccount(
    payload: Pick<CurrentUser, "fullName">,
    accessToken?: string | null
  ) {
    return apiRequest<CurrentUser>("/api/v1/users/update-account-details", {
      method: "PATCH",
      body: JSON.stringify(payload),
      accessToken,
    });
  },
  changePassword(
    payload: { oldPassword: string; newPassword: string },
    accessToken: string | null
  ) {
    return apiRequest<Record<string, never>>("/api/v1/users/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
      accessToken,
    });
  },
};
