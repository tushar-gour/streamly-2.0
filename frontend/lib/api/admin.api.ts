import { apiRequest } from "@/lib/api/api-client";

export const adminApi = {
  users() {
    return apiRequest<unknown[]>("/api/v1/admin/users");
  },
  moderationQueue() {
    return apiRequest<unknown[]>("/api/v1/admin/moderation");
  },
};
