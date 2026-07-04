import { apiRequest } from "@/lib/api/api-client";
import type { ApiResponse } from "@/lib/api/api.types";

export const commentsApi = {
  list(videoId: string) {
    return apiRequest<ApiResponse<unknown[]>>(`/api/v1/comments/${videoId}`);
  },
};
