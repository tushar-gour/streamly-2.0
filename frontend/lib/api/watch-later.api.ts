import { apiRequest } from "@/lib/api/client";
import type { VideoListItem } from "@/lib/api/videos.api";

export const watchLaterApi = {
  list(page: number, accessToken: string | null) {
    return apiRequest<VideoListItem[]>(`/api/v1/watch-later?page=${page}&limit=20`, { accessToken });
  },
  status(videoId: string, accessToken: string | null) {
    return apiRequest<{ saved: boolean }>(`/api/v1/watch-later/${encodeURIComponent(videoId)}`, { accessToken });
  },
  set(videoId: string, saved: boolean, accessToken: string | null) {
    return apiRequest<unknown>(`/api/v1/watch-later/${encodeURIComponent(videoId)}`, {
      method: saved ? "PUT" : "DELETE",
      accessToken,
    });
  },
};
