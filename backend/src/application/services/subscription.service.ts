import type { SubscriptionRepository } from "../../domain/repositories/subscription.repository.js";
import {
    BadRequestError,
    NotFoundError,
} from "../../shared/errors/api-error.js";
import { PaginationDefaults } from "../../shared/constants/index.js";
import { PaginationBuilder } from "../../shared/responses/api-response.js";
import { ObjectIdValidator } from "../../shared/validators/object-id.validator.js";

type UserLookup = { findById(id: string): Promise<unknown> };
type PageQuery = { page?: unknown; limit?: unknown };

class SubscriptionService {
    private readonly subscriptionRepository: SubscriptionRepository;
    private readonly userRepository: UserLookup;
    constructor({
        subscriptionRepository,
        userRepository,
    }: {
        subscriptionRepository: SubscriptionRepository;
        userRepository: UserLookup;
    }) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    async toggleSubscription({
        channelId,
        userId,
        desired,
    }: {
        channelId: string;
        userId: string;
        desired?: unknown;
    }) {
        ObjectIdValidator.ensureValid(channelId, "channel ID");

        if (channelId === userId.toString()) {
            throw new BadRequestError("You cannot subscribe to yourself");
        }

        const channel = await this.userRepository.findById(channelId);
        if (!channel) {
            throw new NotFoundError("Channel", channelId);
        }

        if (desired !== undefined && typeof desired !== "boolean") {
            throw new BadRequestError("Invalid subscription state");
        }
        const { isSubscribed, subscribersCount, created } =
            await this.subscriptionRepository.setSubscription(
                userId,
                channelId,
                desired
            );

        return {
            statusCode: created ? 201 : 200,
            data: { isSubscribed, subscribersCount },
            message: isSubscribed
                ? "Subscribed successfully"
                : "Unsubscribed successfully",
        };
    }

    async getChannelSubscribers({
        channelId,
        currentUserId,
        query,
    }: {
        channelId: string;
        currentUserId?: string | null;
        query: PageQuery;
    }) {
        ObjectIdValidator.ensureValid(channelId, "channel ID");

        const { pageNum, limitNum } = this.#getPagination(
            query.page ?? PaginationDefaults.PAGE,
            query.limit ?? PaginationDefaults.LIMIT
        );

        const { subscribers, totalDocs } =
            await this.subscriptionRepository.getChannelSubscribers({
                channelId,
                currentUserId,
                pageNum,
                limitNum,
            });

        return {
            data: subscribers,
            pagination: new PaginationBuilder(
                pageNum,
                limitNum,
                totalDocs
            ).build(),
            message: "Channel subscribers fetched successfully",
        };
    }

    async getSubscribedChannels({
        subscriberId,
        query,
    }: {
        subscriberId: string;
        query: PageQuery;
    }) {
        ObjectIdValidator.ensureValid(subscriberId, "subscriber ID");

        const { pageNum, limitNum } = this.#getPagination(
            query.page ?? PaginationDefaults.PAGE,
            query.limit ?? PaginationDefaults.LIMIT
        );

        const { channels, totalDocs } =
            await this.subscriptionRepository.getSubscribedChannels({
                subscriberId,
                pageNum,
                limitNum,
            });

        return {
            data: channels,
            pagination: new PaginationBuilder(
                pageNum,
                limitNum,
                totalDocs
            ).build(),
            message: "Subscribed channels fetched successfully",
        };
    }

    #getPagination(page: unknown, limit: unknown) {
        const positiveInteger = (value: unknown, maximum: number) => {
            if (
                (typeof value !== "string" && typeof value !== "number") ||
                !/^\\d+$/.test(String(value))
            ) {
                throw new BadRequestError("Invalid pagination");
            }
            const n = Number(value);
            if (!Number.isSafeInteger(n) || n < 1)
                throw new BadRequestError("Invalid pagination");
            return Math.min(n, maximum);
        };
        return {
            pageNum: positiveInteger(page, 10000),
            limitNum: positiveInteger(limit, PaginationDefaults.MAX_LIMIT),
        };
    }
}

export { SubscriptionService };
