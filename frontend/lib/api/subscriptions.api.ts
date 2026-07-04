import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const subscriptionsApi = {
  listMine() {
    return apiRequest<ApiResponse<unknown[]>>("/api/v1/subscriptions/u/me");
  },
};
