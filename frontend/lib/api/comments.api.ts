import { apiRequest } from "@/lib/api/api-client";

export type VideoComment = Readonly<{
  _id: string;
  content: string;
  createdAt?: string;
  isLiked?: boolean;
  likesCount?: number;
  owner?: {
    _id?: string;
    avatar?: string;
    fullName?: string;
    username?: string;
  };
}>;

export const commentsApi = {
  list(videoId: string, page = 1, accessToken?: string | null) {
    return apiRequest<VideoComment[]>(
      `/api/v1/comments/${encodeURIComponent(videoId)}?page=${page}&limit=20`,
      { accessToken }
    );
  },
  add(videoId: string, content: string, accessToken: string | null) {
    return apiRequest<VideoComment>(
      `/api/v1/comments/${encodeURIComponent(videoId)}`,
      { method: "POST", body: JSON.stringify({ content }), accessToken }
    );
  },
  update(commentId: string, content: string, accessToken: string | null) {
    return apiRequest<VideoComment>(
      `/api/v1/comments/c/${encodeURIComponent(commentId)}`,
      { method: "PATCH", body: JSON.stringify({ content }), accessToken }
    );
  },
  remove(commentId: string, accessToken: string | null) {
    return apiRequest<Record<string, never>>(
      `/api/v1/comments/c/${encodeURIComponent(commentId)}`,
      { method: "DELETE", accessToken }
    );
  },
};
