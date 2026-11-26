import { prisma } from "../../infrastructure/database/prisma/client.js";
import { ApiError } from "../../shared/errors/api-error.js";
import { createId } from "../../shared/helpers/id-generator.js";
import { audit } from "../../infrastructure/logger/audit-logger.js";

export class ModerationService {
    async overview() {
        const [published, held, unpublished] = await Promise.all([
            prisma.video.count({ where: { isPublished: true } }),
            prisma.video.count({ where: { moderationHeld: true } }),
            prisma.video.count({ where: { isPublished: false, moderationHeld: false } }),
        ]);
        return { published, held, unpublished };
    }

    async list(page: number) {
        return prisma.video.findMany({
            select: {
                id: true, title: true, isPublished: true, moderationHeld: true,
                createdAt: true, owner: { select: { username: true } },
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            skip: (page - 1) * 25,
            take: 25,
        });
    }

    async setHold(actorId: string, videoId: string, held: unknown, reason: unknown) {
        if (!/^[a-f0-9]{24}$/i.test(videoId) ||
            typeof held !== "boolean" ||
            typeof reason !== "string" || !reason.trim() || reason.trim().length > 500) {
            throw new ApiError(400, "A video, hold state and reason are required");
        }
        const result = await prisma.$transaction(async (tx) => {
            const changed = await tx.video.updateMany({
                where: { id: videoId, moderationHeld: !held },
                data: { moderationHeld: held, isPublished: false },
            });
            if (changed.count !== 1) throw new ApiError(409, "Video unavailable or moderation state unchanged");
            await tx.moderationAction.create({
                data: { id: createId(), actorId, resourceId: videoId, action: held ? "video_hold" : "video_release", reason: reason.trim() },
            });
            return { id: videoId, moderationHeld: held, isPublished: false };
        });
        audit.info("moderation.video_visibility", { actorId, videoId, held });
        return result;
    }
}
