import { apiRequest } from "@/lib/api/client";

export type ModerationVideo = {
  id: string;
  title: string;
  isPublished: boolean;
  moderationHeld: boolean;
  owner: { username: string };
};

export const adminApi = {
  overview: () => apiRequest<{ published: number; held: number; unpublished: number }>("/api/v1/admin/overview"),
  videos: (page: number) => apiRequest<ModerationVideo[]>(`/api/v1/admin/videos?page=${page}`),
  setHold: (id: string, held: boolean, reason: string) =>
    apiRequest<ModerationVideo>(`/api/v1/admin/videos/${id}/hold`, {
      method: "PATCH",
      body: JSON.stringify({ held, reason }),
    }),
};
