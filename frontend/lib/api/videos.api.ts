import { apiRequest } from "@/lib/api/api-client";

export type VideoListItem = Readonly<{
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  owner?: {
    username: string;
    avatar?: string;
  };
}>;

export const videosApi = {
  list() {
    return apiRequest<VideoListItem[]>("/api/v1/videos");
  },
  detail(videoId: string) {
    return apiRequest<VideoListItem>(`/api/v1/videos/${videoId}`);
  },
  streamUrl(videoId: string) {
    return `/api/v1/videos/${videoId}/stream`;
  },
};
