import { apiRequest } from "@/lib/api/api-client";

export const likesApi = {
  toggleVideoLike(videoId: string) {
    return apiRequest<unknown>(`/api/v1/likes/toggle/v/${videoId}`, {
      method: "POST",
    });
  },
};
