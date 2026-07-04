import { apiRequest } from "@/lib/api/api-client";
import type { VideoListItem } from "@/lib/api/videos.api";

export type LikedVideosPayload = Readonly<{
  likedVideos?: VideoListItem[];
}>;

export const likesApi = {
  toggleVideoLike(videoId: string) {
    return apiRequest<unknown>(`/api/v1/likes/toggle/v/${videoId}`, {
      method: "POST",
    });
  },
  listVideos() {
    return apiRequest<LikedVideosPayload | VideoListItem[]>(
      "/api/v1/likes/videos"
    );
  },
};
