import { apiRequest } from "@/lib/api/client";

export type ModerationVideo = {
  id: string;
  title: string;
  isPublished: boolean;
  moderationHeld: boolean;
  owner: { username: string };
};

export type ModerationComment = {
  id: string;
  content: string;
  moderationHeld: boolean;
  owner: { username: string };
  video: { id: string; title: string };
};

export const adminApi = {
  comments: (page: number) =>
    apiRequest<ModerationComment[]>(`/api/v1/admin/comments?page=${page}`),
  setCommentHold: (id: string, held: boolean, reason: string) =>
    apiRequest<Pick<ModerationComment, "id" | "moderationHeld">>(
      `/api/v1/admin/comments/${id}/hold`,
      { method: "PATCH", body: JSON.stringify({ held, reason }) }
    ),
  overview: () =>
    apiRequest<{ published: number; held: number; unpublished: number }>(
      "/api/v1/admin/overview"
    ),
  videos: (page: number) =>
    apiRequest<ModerationVideo[]>(`/api/v1/admin/videos?page=${page}`),
  setHold: (id: string, held: boolean, reason: string) =>
    apiRequest<Pick<ModerationVideo, "id" | "moderationHeld" | "isPublished">>(
      `/api/v1/admin/videos/${id}/hold`,
      {
        method: "PATCH",
        body: JSON.stringify({ held, reason }),
      }
    ),
};
