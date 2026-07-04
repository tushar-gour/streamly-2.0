import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const watchHistoryApi = {
  listMine() {
    return apiRequest<ApiResponse<unknown[]>>("/api/v1/users/history");
  },
};
