import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const playlistsApi = {
  listMine() {
    return apiRequest<ApiResponse<unknown[]>>("/api/v1/playlists");
  },
};
