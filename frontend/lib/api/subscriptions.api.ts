import { apiRequest } from "@/lib/api/api-client";

export const subscriptionsApi = {
  listBySubscriber(subscriberId: string) {
    return apiRequest<unknown[]>(`/api/v1/subscriptions/u/${subscriberId}`);
  },
};
