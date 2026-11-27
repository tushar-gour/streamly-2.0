import { apiRequest } from "@/lib/api/api-client";
import type { VideoListItem } from "@/lib/api/videos.api";

export type PlaylistSummary = Readonly<{
  _id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  thumbnail?: string;
  videos?: VideoListItem[];
  videosCount?: number;
  createdAt?: string;
  owner?: { _id: string; username?: string };
}>;

export type PlaylistDetails = PlaylistSummary &
  Readonly<{
    videos?: VideoListItem[];
    totalViews?: number;
  }>;

type PlaylistInput = Readonly<{ name: string; description: string; isPublic: boolean }>;

export const playlistsApi = {
  create(input: PlaylistInput, accessToken: string | null) {
    return apiRequest<PlaylistDetails>("/api/v1/playlists", {
      method: "POST",
      body: JSON.stringify(input),
      accessToken,
    });
  },
  update(id: string, input: PlaylistInput, accessToken: string | null) {
    return apiRequest<PlaylistDetails>(
      `/api/v1/playlists/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
        accessToken,
      }
    );
  },
  remove(id: string, accessToken: string | null) {
    return apiRequest<unknown>(`/api/v1/playlists/${encodeURIComponent(id)}`, {
      method: "DELETE",
      accessToken,
    });
  },
  addVideo(id: string, videoId: string, accessToken: string | null) {
    return apiRequest<PlaylistDetails>(
      `/api/v1/playlists/add/${encodeURIComponent(videoId)}/${encodeURIComponent(id)}`,
      { method: "PATCH", accessToken }
    );
  },
  removeVideo(id: string, videoId: string, accessToken: string | null) {
    return apiRequest<PlaylistDetails>(
      `/api/v1/playlists/remove/${encodeURIComponent(videoId)}/${encodeURIComponent(id)}`,
      { method: "PATCH", accessToken }
    );
  },
  listByUser(userId: string, accessToken?: string | null) {
    return apiRequest<PlaylistSummary[]>(
      `/api/v1/playlists/user/${encodeURIComponent(userId)}`,
      { accessToken }
    );
  },
  detail(playlistId: string, accessToken?: string | null) {
    return apiRequest<PlaylistDetails>(
      `/api/v1/playlists/${encodeURIComponent(playlistId)}`,
      { accessToken }
    );
  },
};
