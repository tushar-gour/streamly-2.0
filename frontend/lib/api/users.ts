import { apiRequest } from "@/lib/api/api-client";
import type { CurrentUser } from "@/lib/api/types";

export type ChannelProfile = CurrentUser &
  Readonly<{
    subscribersCount?: number;
    subscribedToCount?: number;
    isSubscribed?: boolean;
    createdAt?: string;
  }>;

export const usersApi = {
  channel(username: string) {
    return apiRequest<ChannelProfile>(`/api/v1/users/c/${username}`);
  },
  current(accessToken?: string | null) {
    return apiRequest<CurrentUser>("/api/v1/users/current-user", {
      accessToken,
    });
  },
};
