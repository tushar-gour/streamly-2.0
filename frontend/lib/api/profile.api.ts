import { apiRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";

export const profileApi = {
  updateImage(
    kind: "avatar" | "coverImage",
    file: File,
    accessToken: string | null
  ) {
    const body = new FormData();
    body.append(kind, file);
    const path = kind === "avatar" ? "avatar" : "cover-image";
    return apiRequest<CurrentUser>(`/api/v1/users/${path}`, {
      method: "PATCH",
      body,
      accessToken,
    });
  },
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
