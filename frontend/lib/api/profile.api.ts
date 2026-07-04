import { apiRequest } from "@/lib/api/api-client";
import type { CurrentUser } from "@/lib/api/api.types";

export const profileApi = {
  updateAccount(payload: Partial<CurrentUser>) {
    return apiRequest<CurrentUser>("/api/v1/users/update-account-details", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
