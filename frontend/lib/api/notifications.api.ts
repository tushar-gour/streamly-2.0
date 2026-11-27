import { apiRequest } from "@/lib/api/client";

export type NotificationItem = {
  id: string;
  kind: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export const notificationsApi = {
  list: (page: number) =>
    apiRequest<{ items: NotificationItem[]; unread: number }>(
      `/api/v1/notifications?page=${page}`
    ),
  markRead: (id: string) =>
    apiRequest<object>(`/api/v1/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    apiRequest<object>("/api/v1/notifications/read-all", { method: "PATCH" }),
};
