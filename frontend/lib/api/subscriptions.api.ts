import { apiRequest } from "@/lib/api/api-client";

export type SubscribedChannel = Readonly<{
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  subscribersCount?: number;
  subscribedAt?: string;
  latestVideo?: {
    _id: string;
    title: string;
    thumbnail?: string;
    createdAt?: string;
  } | null;
}>;

export const subscriptionsApi = {
  listBySubscriber(subscriberId: string) {
    return apiRequest<{ channels?: SubscribedChannel[] } | SubscribedChannel[]>(
      `/api/v1/subscriptions/u/${subscriberId}`
    );
  },
  setChannel(channelId: string, isSubscribed: boolean) {
    return apiRequest<unknown>(
      `/api/v1/subscriptions/c/${encodeURIComponent(channelId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ isSubscribed }),
      }
    );
  },
  toggleChannel(channelId: string) {
    return apiRequest<unknown>(`/api/v1/subscriptions/c/${channelId}`, {
      method: "POST",
    });
  },
};
