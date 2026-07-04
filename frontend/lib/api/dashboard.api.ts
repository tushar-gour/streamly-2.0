import { apiRequest } from "@/lib/api/api-client";

export const dashboardApi = {
  stats() {
    return apiRequest<unknown>("/api/v1/dashboard/stats");
  },
};
