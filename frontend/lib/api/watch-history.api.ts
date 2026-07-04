import { apiRequest } from "@/lib/api/api-client";
import type { VideoListItem } from "@/lib/api/videos.api";

export const watchHistoryApi = {
  listMine() {
    return apiRequest<VideoListItem[]>("/api/v1/users/watch-history");
  },
};
