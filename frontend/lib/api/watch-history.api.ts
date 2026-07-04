import { apiRequest } from "@/lib/api/api-client";

export const watchHistoryApi = {
  listMine() {
    return apiRequest<unknown[]>("/api/v1/users/watch-history");
  },
};
