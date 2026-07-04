import { apiRequest } from "@/lib/api/api-client";

export const commentsApi = {
  list(videoId: string) {
    return apiRequest<unknown[]>(`/api/v1/comments/${videoId}`);
  },
};
