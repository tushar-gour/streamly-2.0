import { apiRequest } from "@/lib/api/api-client";

export const playlistsApi = {
  listByUser(userId: string) {
    return apiRequest<unknown[]>(`/api/v1/playlists/user/${userId}`);
  },
};
