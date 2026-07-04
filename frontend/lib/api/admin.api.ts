import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const adminApi = {
  users() {
    return apiRequest<ApiResponse<unknown[]>>("/api/v1/admin/users");
  },
  moderationQueue() {
    return apiRequest<ApiResponse<unknown[]>>("/api/v1/admin/moderation");
  },
};
