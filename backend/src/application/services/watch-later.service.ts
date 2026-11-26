import type { PrismaWatchLaterRepository } from "../../infrastructure/repositories/watch-later.repository.js";
import {
    NotFoundError,
    BadRequestError,
} from "../../shared/errors/api-error.js";
import { PaginationBuilder } from "../../shared/responses/api-response.js";
import { ObjectIdValidator } from "../../shared/validators/object-id.validator.js";

type WatchLaterRepository = Pick<
    PrismaWatchLaterRepository,
    "list" | "isSaved" | "isPublished" | "save" | "remove"
>;

export class WatchLaterService {
    constructor(private readonly repository: WatchLaterRepository) {}

    async list(userId: string, page: unknown, limit: unknown) {
        const pageNum = page === undefined ? 1 : Number(page);
        const limitNum = limit === undefined ? 20 : Number(limit);
        if (
            !Number.isSafeInteger(pageNum) ||
            pageNum < 1 ||
            pageNum > 100000 ||
            !Number.isSafeInteger(limitNum) ||
            limitNum < 1 ||
            limitNum > 100
        ) {
            throw new BadRequestError("Invalid pagination");
        }
        const result = await this.repository.list(
            userId,
            (pageNum - 1) * limitNum,
            limitNum
        );
        return {
            data: result.videos,
            pagination: new PaginationBuilder(
                pageNum,
                limitNum,
                result.total
            ).build(),
        };
    }

    async status(userId: string, videoId: string) {
        ObjectIdValidator.ensureValid(videoId, "video ID");
        return { saved: await this.repository.isSaved(userId, videoId) };
    }

    async save(userId: string, videoId: string) {
        ObjectIdValidator.ensureValid(videoId, "video ID");
        if (!(await this.repository.isPublished(videoId))) {
            throw new NotFoundError("Video");
        }
        await this.repository.save(userId, videoId);
    }

    async remove(userId: string, videoId: string) {
        ObjectIdValidator.ensureValid(videoId, "video ID");
        await this.repository.remove(userId, videoId);
    }
}
