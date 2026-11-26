import { apiRequest } from "@/lib/api/api-client";
import type { VideoListItem } from "@/lib/api/videos.api";

export type LikedVideosPayload = Readonly<{
  likedVideos?: VideoListItem[];
}>;

type LikeResult = Readonly<{ isLiked: boolean; likesCount: number }>;

export const likesApi = {
  toggleVideoLike(videoId: string, accessToken?: string | null) {
    return apiRequest<LikeResult>(
      `/api/v1/likes/toggle/v/${encodeURIComponent(videoId)}`,
      { method: "POST", accessToken }
    );
  },
  toggleCommentLike(commentId: string, accessToken: string | null) {
    return apiRequest<LikeResult>(
      `/api/v1/likes/toggle/c/${encodeURIComponent(commentId)}`,
      { method: "POST", accessToken }
    );
  },
  listVideos() {
    return apiRequest<LikedVideosPayload | VideoListItem[]>(
      "/api/v1/likes/videos"
    );
  },
};
