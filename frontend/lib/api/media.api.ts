import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const mediaApi = {
  uploadAvatar(formData: FormData) {
    return apiRequest<ApiResponse<unknown>>("/api/v1/users/avatar", {
      method: "PATCH",
      body: formData,
    });
  },
  uploadCover(formData: FormData) {
    return apiRequest<ApiResponse<unknown>>("/api/v1/users/cover-image", {
      method: "PATCH",
      body: formData,
    });
  },
};
