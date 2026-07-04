import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const likesApi = {
  toggleVideoLike(videoId: string) {
    return apiRequest<ApiResponse<unknown>>(
      `/api/v1/likes/toggle/v/${videoId}`,
      {
        method: "POST",
      }
    );
  },
};
