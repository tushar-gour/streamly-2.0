import { apiRequest } from "@/lib/api/api-client";
import type { VideoListItem } from "@/lib/api/videos.api";

export type DashboardStats = Readonly<{
  overview: {
    totalSubscribers: number;
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  metrics: {
    averageViewsPerVideo: number;
    engagementRate: string;
    recentSubscribers: number;
  };
  generatedAt: string;
}>;

export type StudioVideo = VideoListItem & { isPublished: boolean };

export const dashboardApi = {
  stats(accessToken: string | null) {
    return apiRequest<DashboardStats>("/api/v1/dashboard/stats", {
      accessToken,
    });
  },
  videos(page: number, accessToken: string | null) {
    return apiRequest<StudioVideo[]>(
      `/api/v1/dashboard/videos?page=${page}&limit=20`,
      { accessToken }
    );
  },
};
