import crypto from "node:crypto";
import type { VideoUploadAttempt } from "@prisma/client";
import { prisma } from "../database/prisma/client.js";
import { createId } from "../../shared/helpers/id-generator.js";
import { FileUploadConfig } from "../../shared/constants/index.js";
import { ApiError } from "../../shared/errors/api-error.js";

const active = ["validating", "storing"];
const requestIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
type Cleanup = (key: string, resource: "image" | "video") => Promise<boolean>;

function publicAttempt(attempt: VideoUploadAttempt) {
    const interrupted = active.includes(attempt.status) && attempt.expiresAt <= new Date();
    return {
        requestId: attempt.requestId,
        title: attempt.title,
        status: interrupted ? "interrupted" : attempt.status,
        error: interrupted ? "Processing was interrupted. Start a new upload." : attempt.error,
        videoId: attempt.videoId,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt,
    };
}

export class PrismaVideoUploadRepository {
    async begin(ownerId: string, title: string, input: unknown, privateStorage: boolean) {
        const requestId = input === undefined ? crypto.randomUUID() : input;
        if (typeof requestId !== "string" || !requestIdPattern.test(requestId))
            throw new ApiError(400, "Invalid upload request identifier");
        const normalized = requestId.toLowerCase();
        const id = createId();
        const folder = FileUploadConfig.UPLOAD_FOLDER + "/attempts/" + id;
        const inserted = await prisma.videoUploadAttempt.createMany({
            data: {
                id, ownerId, title, requestId: normalized,
                status: "validating",
                expiresAt: new Date(Date.now() + 30 * 60_000),
                videoKey: privateStorage ? folder + "/video" : null,
                thumbnailKey: privateStorage ? folder + "/thumbnail" : null,
            },
            skipDuplicates: true,
        });
        const attempt = await prisma.videoUploadAttempt.findUniqueOrThrow({
            where: { ownerId_requestId: { ownerId, requestId: normalized } },
        });
        return { attempt, started: inserted.count === 1 };
    }

    async markStoring(id: string) {
        const result = await prisma.videoUploadAttempt.updateMany({
            where: { id, status: "validating", expiresAt: { gt: new Date() } },
            data: { status: "storing" },
        });
        if (result.count !== 1) throw new ApiError(409, "Upload attempt is no longer active");
    }

    async complete(id: string, ownerId: string, video: {
        title: string;
        description: string;
        videoFile: string;
        thumbnail: string;
        duration: number;
    }) {
        return prisma.$transaction(async (tx) => {
            const claimed = await tx.videoUploadAttempt.updateMany({
                where: { id, ownerId, status: "storing", expiresAt: { gt: new Date() } },
                data: { status: "ready" },
            });
            if (claimed.count !== 1) throw new ApiError(409, "Upload attempt is no longer active");
            const record = await tx.video.create({
                data: { id: createId(), ownerId, ...video, isPublished: true },
            });
            await tx.videoUploadAttempt.update({
                where: { id },
                data: { videoId: record.id, cleanedAt: new Date() },
            });
            return record.id;
        });
    }

    async fail(id: string, message: string) {
        return prisma.videoUploadAttempt.updateMany({
            where: { id, status: { in: active } },
            data: { status: "failed", error: message },
        });
    }

    async status(ownerId: string, requestId: string) {
        if (!requestIdPattern.test(requestId)) throw new ApiError(400, "Invalid upload request identifier");
        const record = await prisma.videoUploadAttempt.findUnique({
            where: { ownerId_requestId: { ownerId, requestId: requestId.toLowerCase() } },
        });
        if (!record) throw new ApiError(404, "Upload attempt not found");
        return publicAttempt(record);
    }

    async list(ownerId: string) {
        const rows = await prisma.videoUploadAttempt.findMany({
            where: { ownerId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return rows.map(publicAttempt);
    }

    async cleanupFailed(id: string, remove: Cleanup) {
        const attempt = await prisma.videoUploadAttempt.findFirst({
            where: { id, status: "failed", cleanedAt: null },
        });
        if (!attempt) return false;
        const results = await Promise.allSettled([
            attempt.videoKey ? remove(attempt.videoKey, "video") : Promise.resolve(true),
            attempt.thumbnailKey ? remove(attempt.thumbnailKey, "image") : Promise.resolve(true),
        ]);
        if (!results.every((result) => result.status === "fulfilled" && result.value))
            return false;
        await prisma.videoUploadAttempt.updateMany({
            where: { id, status: "failed" },
            data: { cleanedAt: new Date() },
        });
        return true;
    }

    async cleanupExpired(remove: Cleanup) {
        const expired = await prisma.videoUploadAttempt.findMany({
            where: {
                status: { in: active },
                expiresAt: { lte: new Date() },
            },
            select: { id: true },
            take: 100,
        });
        for (const attempt of expired) {
            await this.fail(attempt.id, "Processing was interrupted. Start a new upload.");
        }
        const failed = await prisma.videoUploadAttempt.findMany({
            where: { status: "failed", cleanedAt: null },
            select: { id: true },
            take: 100,
            orderBy: { createdAt: "asc" },
        });
        let cleaned = 0;
        for (const attempt of failed) {
            if (await this.cleanupFailed(attempt.id, remove)) cleaned += 1;
        }
        return cleaned;
    }
}
