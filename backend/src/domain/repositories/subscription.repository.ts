export type SubscriptionPage = Readonly<{
    pageNum: number;
    limitNum: number;
}>;

export type ChannelSubscribersPage = SubscriptionPage &
    Readonly<{
        channelId: string;
        currentUserId?: string | null;
    }>;

export type SubscribedChannelsPage = SubscriptionPage &
    Readonly<{
        subscriberId: string;
    }>;

type ChannelSummary = {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
    subscribersCount: number;
    subscribedAt: Date;
};

export interface SubscriptionRepository {
    countByChannel(channelId: string): Promise<number>;
    countBySubscriber(subscriberId: string): Promise<number>;
    countRecentByChannel(channelId: string, since: Date): Promise<number>;
    setSubscription(
        subscriberId: string,
        channelId: string,
        desired?: boolean
    ): Promise<{
        isSubscribed: boolean;
        subscribersCount: number;
        created: boolean;
    }>;
    getChannelSubscribers(input: ChannelSubscribersPage): Promise<{
        subscribers: (ChannelSummary & { isSubscribed: boolean })[];
        totalDocs: number;
    }>;
    getSubscribedChannels(input: SubscribedChannelsPage): Promise<{
        channels: (ChannelSummary & {
            latestVideo: {
                _id: string;
                title: string;
                thumbnail: string;
                createdAt: Date;
            } | null;
        })[];
        totalDocs: number;
    }>;
}
