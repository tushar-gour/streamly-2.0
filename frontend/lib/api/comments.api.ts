import { apiRequest } from "@/lib/api/api-client";

export type VideoComment = Readonly<{
  _id: string;
  content: string;
  createdAt?: string;
  isLiked?: boolean;
  likesCount?: number;
  owner?: {
    avatar?: string;
    fullName?: string;
    username?: string;
  };
}>;

export const commentsApi = {
  list(videoId: string) {
    return apiRequest<VideoComment[]>(`/api/v1/comments/${videoId}`);
  },
};
