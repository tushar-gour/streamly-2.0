import type { Request, Response } from "express";
import { container } from "../../core/container/index.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";
import { BadRequestError, UnauthorizedError } from "../../shared/errors/api-error.js";
import { ApiResponse } from "../../shared/responses/api-response.js";

const subscriptionService = container.services.subscriptionService;

class SubscriptionController {
    static toggleSubscription = asyncHandler(async (req: Request, res: Response) => {
        if (
            req.method === "PUT" &&
            typeof req.body?.isSubscribed !== "boolean"
        ) {
            throw new BadRequestError("Subscription state is required");
        }
        if (!req.user?._id) throw new UnauthorizedError();
        if (typeof req.params.channelId !== "string") throw new BadRequestError("Invalid channel ID");
        const result = await subscriptionService.toggleSubscription({
            channelId: req.params.channelId,
            userId: req.user._id,
            desired: req.method === "PUT" ? req.body?.isSubscribed : undefined,
        });
        return res
            .status(result.statusCode)
            .json(ApiResponse.success(result.data, result.message));
    });

    static getChannelSubscribers = asyncHandler(async (req: Request, res: Response) => {
        if (typeof req.params.channelId !== "string") throw new BadRequestError("Invalid channel ID");
        const result = await subscriptionService.getChannelSubscribers({
            channelId: req.params.channelId,
            currentUserId: req.user?._id,
            query: req.query,
        });
        return res
            .status(200)
            .json(
                ApiResponse.paginated(
                    result.data,
                    result.pagination,
                    result.message
                )
            );
    });

    static getSubscribedChannels = asyncHandler(async (req: Request, res: Response) => {
        if (typeof req.params.subscriberId !== "string") throw new BadRequestError("Invalid subscriber ID");
        const result = await subscriptionService.getSubscribedChannels({
            subscriberId: req.params.subscriberId,
            query: req.query,
        });
        return res
            .status(200)
            .json(
                ApiResponse.paginated(
                    result.data,
                    result.pagination,
                    result.message
                )
            );
    });
}

export const toggleSubscription = SubscriptionController.toggleSubscription;
export const getUserChannelSubscribers =
    SubscriptionController.getChannelSubscribers;
export const getSubscribedChannels =
    SubscriptionController.getSubscribedChannels;

export { SubscriptionController };
