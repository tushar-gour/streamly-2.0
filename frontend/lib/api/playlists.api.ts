import { apiRequest } from "@/lib/api/api-client";
import type { VideoListItem } from "@/lib/api/videos.api";

export type PlaylistSummary = Readonly<{
  _id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  videos?: VideoListItem[];
  videosCount?: number;
  createdAt?: string;
}>;

export type PlaylistDetails = PlaylistSummary &
  Readonly<{
    videos?: VideoListItem[];
    totalViews?: number;
  }>;

export const playlistsApi = {
  listByUser(userId: string) {
    return apiRequest<PlaylistSummary[]>(`/api/v1/playlists/user/${userId}`);
  },
  detail(playlistId: string) {
    return apiRequest<PlaylistDetails>(`/api/v1/playlists/${playlistId}`);
  },
};
