import { apiRequest } from "@/lib/api/api-client";
import { frontendConfig } from "@/lib/config/env";

export type VideoListItem = Readonly<{
  _id: string;
  title: string;
  description?: string;
  videoFile?: string;
  thumbnail?: string;
  duration?: number | string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    _id?: string;
    id?: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
}>;

export type VideoListFilters = Readonly<{
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "views" | "duration";
  sortType?: "asc" | "desc";
  userId?: string;
}>;

function toSearchParams(filters: VideoListFilters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const videosApi = {
  list(filters: VideoListFilters = {}) {
    return apiRequest<VideoListItem[]>(
      `/api/v1/videos${toSearchParams(filters)}`
    );
  },
  detail(videoId: string) {
    return apiRequest<VideoListItem>(`/api/v1/videos/${videoId}`);
  },
  streamUrl(videoId: string) {
    return `${frontendConfig.apiBaseUrl}/api/v1/videos/${videoId}/stream`;
  },
};
