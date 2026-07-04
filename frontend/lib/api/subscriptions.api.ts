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
  toggleChannel(channelId: string) {
    return apiRequest<unknown>(`/api/v1/subscriptions/c/${channelId}`, {
      method: "POST",
    });
  },
};
