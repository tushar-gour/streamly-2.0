import type {
    SubscriptionRepository,
    ChannelSubscribersPage,
    SubscribedChannelsPage,
} from "../../domain/repositories/subscription.repository.js";
import { createId } from "../../shared/helpers/id-generator.js";
import { recordNotification } from "../database/notification-record.js";
import { prisma } from "../database/prisma/client.js";

const ownerSelect = {
    id: true,
    username: true,
    fullName: true,
    avatar: true,
};

class PrismaSubscriptionRepository implements SubscriptionRepository {
    findBySubscriberAndChannel(subscriberId: string, channelId: string) {
        return prisma.subscription
            .findUnique({
                where: {
                    subscriberId_channelId: {
                        subscriberId,
                        channelId,
                    },
                },
            })
            .then((subscription) =>
                subscription
                    ? { ...subscription, _id: subscription.id }
                    : subscription
            );
    }

    create(subscriptionData: { channel: string; subscriber: string }) {
        return prisma.$transaction(async (tx) => {
            const subscription = await tx.subscription.create({
                data: {
                    id: createId(),
                    channelId: subscriptionData.channel,
                    subscriberId: subscriptionData.subscriber,
                },
            });
            await recordNotification(
                tx,
                subscription.channelId,
                "subscription",
                "A viewer subscribed to your channel."
            );
            return subscription;
        });
    }

    async setSubscription(
        subscriberId: string,
        channelId: string,
        desired?: boolean
    ) {
        return prisma.$transaction(async (tx) => {
            // Serialize changes initiated by the same subscriber.
            await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${subscriberId} FOR NO KEY UPDATE`;
            const existing = await tx.subscription.findUnique({
                where: { subscriberId_channelId: { subscriberId, channelId } },
            });
            const isSubscribed = desired ?? !existing;
            if (isSubscribed && !existing) {
                await tx.subscription.create({
                    data: { id: createId(), subscriberId, channelId },
                });
                await recordNotification(
                    tx,
                    channelId,
                    "subscription",
                    "A viewer subscribed to your channel."
                );
            } else if (!isSubscribed && existing) {
                await tx.subscription.delete({ where: { id: existing.id } });
            }
            const subscribersCount = await tx.subscription.count({
                where: { channelId },
            });
            return {
                isSubscribed,
                subscribersCount,
                created: isSubscribed && !existing,
            };
        });
    }

    deleteById(subscriptionId: string) {
        return prisma.subscription.delete({ where: { id: subscriptionId } });
    }

    countByChannel(channelId: string) {
        return prisma.subscription.count({ where: { channelId } });
    }

    countBySubscriber(subscriberId: string) {
        return prisma.subscription.count({ where: { subscriberId } });
    }

    countRecentByChannel(channelId: string, since: Date) {
        return prisma.subscription.count({
            where: {
                channelId,
                createdAt: { gte: since },
            },
        });
    }

    async getChannelSubscribers({
        channelId,
        currentUserId,
        pageNum,
        limitNum,
    }: ChannelSubscribersPage) {
        const where = { channelId };
        const [subscriptions, totalDocs] = await Promise.all([
            prisma.subscription.findMany({
                where,
                include: {
                    subscriber: {
                        select: {
                            ...ownerSelect,
                            _count: { select: { subscribers: true } },
                            subscribers: {
                                where: { subscriberId: currentUserId ?? "" },
                                select: { subscriberId: true },
                                take: 1,
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.subscription.count({ where }),
        ]);

        return {
            subscribers: subscriptions.map((subscription) => ({
                _id: subscription.subscriber.id,
                username: subscription.subscriber.username,
                fullName: subscription.subscriber.fullName,
                avatar: subscription.subscriber.avatar,
                subscribersCount: subscription.subscriber._count.subscribers,
                isSubscribed: currentUserId
                    ? subscription.subscriber.subscribers.some(
                          (subscriber) =>
                              subscriber.subscriberId === currentUserId
                      )
                    : false,
                subscribedAt: subscription.createdAt,
            })),
            totalDocs,
        };
    }

    async getSubscribedChannels({
        subscriberId,
        pageNum,
        limitNum,
    }: SubscribedChannelsPage) {
        const where = { subscriberId };
        const [subscriptions, totalDocs] = await Promise.all([
            prisma.subscription.findMany({
                where,
                include: {
                    channel: {
                        select: {
                            ...ownerSelect,
                            _count: { select: { subscribers: true } },
                            videos: {
                                where: { isPublished: true },
                                orderBy: { createdAt: "desc" },
                                take: 1,
                                select: {
                                    id: true,
                                    title: true,
                                    thumbnail: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.subscription.count({ where }),
        ]);

        return {
            channels: subscriptions.map((subscription) => {
                const latestVideo = subscription.channel.videos[0];
                return {
                    _id: subscription.channel.id,
                    username: subscription.channel.username,
                    fullName: subscription.channel.fullName,
                    avatar: subscription.channel.avatar,
                    subscribersCount: subscription.channel._count.subscribers,
                    latestVideo: latestVideo
                        ? {
                              _id: latestVideo.id,
                              title: latestVideo.title,
                              thumbnail: latestVideo.thumbnail,
                              createdAt: latestVideo.createdAt,
                          }
                        : null,
                    subscribedAt: subscription.createdAt,
                };
            }),
            totalDocs,
        };
    }
}

export { PrismaSubscriptionRepository };
