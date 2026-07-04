import { apiRequest } from "@/lib/api/api-client";

export const mediaApi = {
  uploadAvatar(formData: FormData) {
    return apiRequest<unknown>("/api/v1/users/avatar", {
      method: "PATCH",
      body: formData,
    });
  },
  uploadCover(formData: FormData) {
    return apiRequest<unknown>("/api/v1/users/cover-image", {
      method: "PATCH",
      body: formData,
    });
  },
};
