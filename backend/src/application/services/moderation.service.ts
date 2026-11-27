import { recordNotification } from "../../infrastructure/database/notification-record.js";
import { prisma } from "../../infrastructure/database/prisma/client.js";
import { ApiError } from "../../shared/errors/api-error.js";
import { createId } from "../../shared/helpers/id-generator.js";
import { audit } from "../../infrastructure/logger/audit-logger.js";

export class ModerationService {
    async overview() {
        const [published, held, unpublished] = await Promise.all([
            prisma.video.count({ where: { isPublished: true } }),
            prisma.video.count({ where: { moderationHeld: true } }),
            prisma.video.count({
                where: { isPublished: false, moderationHeld: false },
            }),
        ]);
        return { published, held, unpublished };
    }

    async list(page: number) {
        return prisma.video.findMany({
            select: {
                id: true,
                title: true,
                isPublished: true,
                moderationHeld: true,
                createdAt: true,
                owner: { select: { username: true } },
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            skip: (page - 1) * 25,
            take: 25,
        });
    }

    async setHold(
        actorId: string,
        videoId: string,
        held: unknown,
        reason: unknown
    ) {
        if (
            !/^[a-f0-9]{24}$/i.test(videoId) ||
            typeof held !== "boolean" ||
            typeof reason !== "string" ||
            !reason.trim() ||
            reason.trim().length > 500
        ) {
            throw new ApiError(
                400,
                "A video, hold state and reason are required"
            );
        }
        const result = await prisma.$transaction(async (tx) => {
            const changed = await tx.video.updateMany({
                where: { id: videoId, moderationHeld: !held },
                data: { moderationHeld: held, isPublished: false },
            });
            if (changed.count !== 1)
                throw new ApiError(
                    409,
                    "Video unavailable or moderation state unchanged"
                );
            await tx.moderationAction.create({
                data: {
                    id: createId(),
                    actorId,
                    resourceId: videoId,
                    action: held ? "video_hold" : "video_release",
                    reason: reason.trim(),
                },
            });
            const video = await tx.video.findUniqueOrThrow({
                where: { id: videoId },
                select: { ownerId: true },
            });
            await recordNotification(
                tx,
                video.ownerId,
                "moderation",
                held
                    ? "A moderation hold was placed on one of your videos."
                    : "A moderation hold on one of your videos was released. It remains unpublished."
            );
            return { id: videoId, moderationHeld: held, isPublished: false };
        });
        audit.info("moderation.video_visibility", { actorId, videoId, held });
        return result;
    }
    async listComments(page: number) {
        return prisma.comment.findMany({
            select: {
                id: true,
                content: true,
                moderationHeld: true,
                createdAt: true,
                owner: { select: { username: true } },
                video: { select: { id: true, title: true } },
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            skip: (page - 1) * 25,
            take: 25,
        });
    }

    async setCommentHold(
        actorId: string,
        commentId: string,
        held: unknown,
        reason: unknown
    ) {
        if (
            !/^[a-f0-9]{24}$/i.test(commentId) ||
            typeof held !== "boolean" ||
            typeof reason !== "string" ||
            !reason.trim() ||
            reason.trim().length > 500
        ) {
            throw new ApiError(400, "A comment, hold state and reason are required");
        }
        const result = await prisma.$transaction(async (tx) => {
            const changed = await tx.comment.updateMany({
                where: { id: commentId, moderationHeld: !held },
                data: { moderationHeld: held },
            });
            if (changed.count !== 1)
                throw new ApiError(409, "Comment unavailable or moderation state unchanged");
            const comment = await tx.comment.findUniqueOrThrow({
                where: { id: commentId },
                select: { ownerId: true },
            });
            await tx.moderationAction.create({
                data: {
                    id: createId(),
                    actorId,
                    resourceId: commentId,
                    action: held ? "comment_hold" : "comment_release",
                    reason: reason.trim(),
                },
            });
            await recordNotification(
                tx,
                comment.ownerId,
                "moderation",
                held
                    ? "A moderation hold was placed on one of your comments."
                    : "A moderation hold on one of your comments was released."
            );
            return { id: commentId, moderationHeld: held };
        });
        audit.info("moderation.comment_visibility", { actorId, commentId, held });
        return result;
    }
}
