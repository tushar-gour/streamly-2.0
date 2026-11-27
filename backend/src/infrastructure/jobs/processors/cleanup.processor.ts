// @ts-nocheck
import { PrismaVideoUploadRepository } from "../../repositories/video-upload.repository.js";
import { mediaStorageService } from "../../media/media-storage.service.js";
import { appConfig } from "../../../config/env.js";
import { prisma } from "../../database/prisma/client.js";
import { JobNames } from "../job.constants.js";

const processCleanupJob = async (job) => {
    if (job.name !== JobNames.CLEANUP_EXPIRED_AUTH) {
        throw new Error(`Unsupported cleanup job: ${job.name}`);
    }

    const now = new Date();
    const [expiredSessions, expiredEmailVerificationTokens] =
        await prisma.$transaction([
            prisma.session.updateMany({
                where: {
                    expiresAt: { lt: now },
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                    revokedReason: "expired",
                },
            }),
            prisma.emailVerificationToken.updateMany({
                where: {
                    expiresAt: { lt: now },
                    usedAt: null,
                },
                data: {
                    usedAt: now,
                },
            }),
        ]);

    const cleanedUploads =
        appConfig.media.storageProvider === "s3"
            ? await new PrismaVideoUploadRepository().cleanupExpired(
                  (key, resource) => mediaStorageService.delete(key, resource)
              )
            : 0;
    return {
        cleanedUploads,
        expiredSessions: expiredSessions.count,
        expiredEmailVerificationTokens: expiredEmailVerificationTokens.count,
    };
};

export { processCleanupJob };
