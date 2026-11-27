import { prisma } from "../database/prisma/client.js";
import { toVideo } from "../database/prisma-record.mapper.js";

export class PrismaWatchLaterRepository {
    async list(userId: string, skip: number, take: number) {
        const where = { userId, video: { isPublished: true } };
        const [rows, total] = await prisma.$transaction([
            prisma.watchLater.findMany({
                where,
                include: {
                    video: {
                        include: {
                            owner: {
                                select: {
                                    id: true,
                                    username: true,
                                    fullName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
                orderBy: [{ createdAt: "desc" }, { videoId: "asc" }],
                skip,
                take,
            }),
            prisma.watchLater.count({ where }),
        ]);
        return { videos: rows.map((row) => toVideo(row.video)), total };
    }

    async isSaved(userId: string, videoId: string) {
        return Boolean(
            await prisma.watchLater.findUnique({
                where: { userId_videoId: { userId, videoId } },
                select: { videoId: true },
            })
        );
    }

    async isPublished(videoId: string) {
        return Boolean(
            await prisma.video.findFirst({
                where: { id: videoId, isPublished: true },
                select: { id: true },
            })
        );
    }

    async save(userId: string, videoId: string) {
        await prisma.watchLater.createMany({
            data: { userId, videoId },
            skipDuplicates: true,
        });
    }

    async remove(userId: string, videoId: string) {
        await prisma.watchLater.deleteMany({ where: { userId, videoId } });
    }
}
