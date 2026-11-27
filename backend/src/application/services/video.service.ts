// @ts-nocheck
import {
    ApiError,
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "../../shared/errors/api-error.js";
import {
    PaginationDefaults,
    SuccessMessages,
} from "../../shared/constants/index.js";
import { PaginationBuilder } from "../../shared/responses/api-response.js";
import { ObjectIdValidator } from "../../shared/validators/object-id.validator.js";
import { createLogger } from "../../infrastructure/logger/logger.js";
import { appConfig } from "../../config/env.js";
import { CacheKeys } from "../../infrastructure/cache/cache.keys.js";
import { probeVideoDuration } from "../../infrastructure/media/probe-video.js";

const videoServiceLogger = createLogger("video-service");

class VideoService {
    constructor({
        videoRepository,
        videoUploadRepository,
        userRepository,
        likeRepository,
        commentRepository,
        cloudinaryService,
        mediaStorageService,
        cacheService,
        authorizationService,
        mediaStreamService,
        thumbnailJobProducer,
    }) {
        this.videoRepository = videoRepository;
        this.videoUploadRepository = videoUploadRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.cloudinaryService = cloudinaryService;
        this.mediaStorageService = mediaStorageService || cloudinaryService;
        this.cacheService = cacheService;
        this.authorizationService = authorizationService;
        this.mediaStreamService = mediaStreamService;
        this.thumbnailJobProducer = thumbnailJobProducer;
    }

    async getAll(queryParams) {
        const {
            page = PaginationDefaults.PAGE,
            limit = PaginationDefaults.LIMIT,
            query,
            sortBy = "createdAt",
            sortType = "desc",
            userId,
        } = queryParams;

        const { pageNum, limitNum } = this.#getPagination(page, limit);
        if (userId) ObjectIdValidator.ensureValid(userId, "user ID");

        // Visibility cannot depend on eventually invalidated cache entries.
        const { videos, totalDocs } =
            await this.videoRepository.getPublishedVideos({
                pageNum,
                limitNum,
                query,
                sortBy,
                sortType,
                userId,
            });

        return {
            data: videos,
            pagination: new PaginationBuilder()
                .setPage(pageNum)
                .setLimit(limitNum)
                .setTotalDocs(totalDocs)
                .build(),
            message: SuccessMessages.VIDEO_FETCHED,
        };
    }

    async getById({ videoId, currentUserId }) {
        ObjectIdValidator.ensureValid(videoId, "video ID");

        const loadVideoDetails = async () => {
            const videos = await this.videoRepository.getVideoDetails(
                videoId,
                currentUserId
            );

            if (!videos?.length) {
                throw new NotFoundError("Video", videoId);
            }

            return videos[0];
        };

        const video = await loadVideoDetails();
        await this.#ensureViewAccess(video, currentUserId);

        await this.videoRepository.incrementViews(videoId);

        if (currentUserId) {
            await this.userRepository.addToWatchHistory(currentUserId, videoId);
        }

        return { data: video, message: SuccessMessages.VIDEO_FETCHED };
    }

    async #invalidateVideoCache(videoId) {
        await Promise.all([
            this.cacheService.deleteByPattern(CacheKeys.videoListPattern()),
            this.cacheService.deleteByPattern(
                CacheKeys.videoDetailPattern(videoId)
            ),
            this.cacheService.deleteByPattern(
                CacheKeys.videoCommentsPattern(videoId)
            ),
        ]);
    }

    async #invalidateAllVideoCache() {
        await Promise.all([
            this.cacheService.deleteByPattern(CacheKeys.videoListPattern()),
            this.cacheService.deleteByPattern(CacheKeys.videoDetailPattern()),
            this.cacheService.deleteByPattern(CacheKeys.videoCommentsPattern()),
        ]);
    }

    async publish({ body, files, ownerId }) {
        const { title, description } = body;

        if (!title?.trim() || !description?.trim()) {
            throw new BadRequestError("Title and description are required");
        }

        const videoFile = files?.videoFile?.[0];
        const thumbnailFile = files?.thumbnail?.[0];

        if (!videoFile) {
            throw new BadRequestError("Video file is required");
        }

        if (!thumbnailFile) {
            throw new BadRequestError("Thumbnail image is required");
        }

        const { attempt, started } = await this.videoUploadRepository.begin(
            ownerId, title.trim(), body.requestId,
            appConfig.media.storageProvider === "s3"
        );
        if (!started) {
            if (attempt.status === "ready" && attempt.videoId) {
                const existing = await this.videoRepository.findByIdWithOwner(attempt.videoId);
                if (existing) return { statusCode: 201, data: existing, message: SuccessMessages.VIDEO_CREATED };
            }
            throw new ApiError(409, "Upload identifier already used. Check Creator Studio.");
        }

        let videoUpload, thumbnailUpload, videoId;
        try {
            const duration = await probeVideoDuration(videoFile.path);
            await this.videoUploadRepository.markStoring(attempt.id);
            const outcomes = await Promise.allSettled([
                this.mediaStorageService.upload(videoFile.path, {
                    resource_type: "video",
                    contentType: videoFile.mimetype,
                    ...(attempt.videoKey ? { objectKey: attempt.videoKey } : {}),
                }),
                this.mediaStorageService.upload(thumbnailFile.path, {
                    contentType: thumbnailFile.mimetype,
                    ...(attempt.thumbnailKey ? { objectKey: attempt.thumbnailKey } : {}),
                }),
            ]);
            videoUpload = outcomes[0].status === "fulfilled" ? outcomes[0].value : null;
            thumbnailUpload = outcomes[1].status === "fulfilled" ? outcomes[1].value : null;
            if (!videoUpload || !thumbnailUpload) throw new ApiError(503, "Media storage is unavailable");
            videoId = await this.videoUploadRepository.complete(attempt.id, ownerId, {
                title: title.trim(),
                description: description.trim(),
                videoFile: videoUpload.secureUrl || videoUpload.url,
                thumbnail: thumbnailUpload.secureUrl || thumbnailUpload.url,
                duration: videoUpload.duration || duration,
            });
        } catch (error) {
            // Only clean failed attempts, never an ambiguously committed published video.
            const failed = await this.videoUploadRepository.fail(attempt.id,
                error?.statusCode === 422 ? "Invalid or unsupported video file" : "Processing failed. Start a new upload."
            );
            if (failed.count === 1) {
                if (attempt.videoKey) {
                    await this.videoUploadRepository.cleanupFailed(attempt.id,
                        (key, resource) => this.mediaStorageService.delete(key, resource)
                    );
                } else {
                    await Promise.allSettled([
                        videoUpload && this.mediaStorageService.delete(videoUpload.publicId, "video"),
                        thumbnailUpload && this.mediaStorageService.delete(thumbnailUpload.publicId),
                    ]);
                }
            }
            throw error;
        }
        // The supplied thumbnail is intentional; do not overwrite it with a generated frame.
        const publishedVideo = await this.videoRepository.findByIdWithOwner(videoId);
        await this.#invalidateAllVideoCache();
        return { statusCode: 201, data: publishedVideo, message: SuccessMessages.VIDEO_CREATED };
    }

    async update({ videoId, body, file, userId }) {
        ObjectIdValidator.ensureValid(videoId, "video ID");

        const video = await this.#findVideoOrFail(videoId);
        this.#verifyOwnership(video, userId);

        const updateData = {};
        if (body.title?.trim()) updateData.title = body.title.trim();
        if (body.description?.trim())
            updateData.description = body.description.trim();

        let oldThumbnailPublicId;
        if (file) {
            oldThumbnailPublicId = this.mediaStorageService.extractPublicId(
                video.thumbnail
            );
            const thumbnailUpload = await this.mediaStorageService.upload(
                file.path,
                { contentType: file.mimetype }
            );

            if (!thumbnailUpload) {
                throw new ApiError(500, "Failed to upload new thumbnail");
            }

            updateData.thumbnail =
                thumbnailUpload.secureUrl || thumbnailUpload.url;
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestError(
                "At least one field is required to update"
            );
        }

        const updatedVideo = await this.videoRepository.updateByIdWithOwner(
            videoId,
            updateData
        );

        if (oldThumbnailPublicId) {
            this.mediaStorageService
                .delete(oldThumbnailPublicId)
                .catch((error) =>
                    videoServiceLogger.warn(
                        { error: { message: error.message } },
                        "failed to delete old thumbnail"
                    )
                );
        }

        await this.#invalidateVideoCache(videoId);

        return { data: updatedVideo, message: SuccessMessages.VIDEO_UPDATED };
    }

    async delete({ videoId, userId }) {
        ObjectIdValidator.ensureValid(videoId, "video ID");

        const video = await this.#findVideoOrFail(videoId);
        this.#verifyOwnership(video, userId);

        const videoPublicId = this.mediaStorageService.extractPublicId(
            video.videoFile
        );
        const thumbnailPublicId = this.mediaStorageService.extractPublicId(
            video.thumbnail
        );

        await this.videoRepository.deleteById(videoId);
        await Promise.all([
            this.likeRepository.deleteMany({ video: videoId }),
            this.commentRepository.deleteByVideo(videoId),
        ]);

        Promise.all([
            videoPublicId &&
                this.mediaStorageService.delete(videoPublicId, "video"),
            thumbnailPublicId &&
                this.mediaStorageService.delete(thumbnailPublicId),
        ]).catch((error) =>
            videoServiceLogger.warn(
                { error: { message: error.message } },
                "failed to cleanup video files"
            )
        );

        await this.#invalidateVideoCache(videoId);

        return { data: {}, message: SuccessMessages.VIDEO_DELETED };
    }

    async togglePublish({ videoId, userId }) {
        ObjectIdValidator.ensureValid(videoId, "video ID");

        const video = await this.#findVideoOrFail(videoId);
        this.#verifyOwnership(video, userId);

        const updatedVideo = await this.videoRepository.toggleOwnedPublication(
            videoId,
            userId,
            !video.isPublished
        );
        if (!updatedVideo) {
            throw new ApiError(
                409,
                "Publication changed or is held by moderation"
            );
        }

        const message = updatedVideo.isPublished
            ? "Video published successfully"
            : "Video unpublished successfully";

        await this.#invalidateVideoCache(videoId);

        return { data: updatedVideo, message };
    }

    async stream({ videoId, currentUserId, range }) {
        ObjectIdValidator.ensureValid(videoId, "video ID");

        if (!appConfig.media.videoStreamingEnabled) {
            throw new ApiError(503, "Video streaming is disabled");
        }

        const video = await this.#findVideoOrFail(videoId);

        await this.#ensureViewAccess(video, currentUserId);
        const result = await this.mediaStreamService.streamVideo(
            video.videoFile,
            range
        );
        return {
            ...result,
            headers: {
                ...result.headers,
                "Cache-Control": "private, no-store",
            },
        };
    }

    async streamThumbnail({ videoId, currentUserId }) {
        ObjectIdValidator.ensureValid(videoId, "video ID");
        const video = await this.#findVideoOrFail(videoId);
        await this.#ensureViewAccess(video, currentUserId);
        return this.mediaStreamService.streamImage(video.thumbnail);
    }

    async #ensureViewAccess(video, currentUserId) {
        if (video.isPublished) return;
        if (!currentUserId) {
            throw new UnauthorizedError(
                "Authentication required to view this video"
            );
        }
        const ownerId = video.owner?._id ?? video.owner;
        if (ownerId === currentUserId) return;
        if (
            !(await this.authorizationService.hasAnyPermission(currentUserId, [
                "video:update:any",
                "video:delete:any",
                "video:publish:any",
            ]))
        ) {
            throw new ForbiddenError(
                "You are not authorized to view this video"
            );
        }
    }

    async #findVideoOrFail(videoId) {
        const video = await this.videoRepository.findById(videoId);
        if (!video) {
            throw new NotFoundError("Video", videoId);
        }
        return video;
    }

    #verifyOwnership(video, userId) {
        if (video.owner.toString() !== userId.toString()) {
            throw new ForbiddenError(
                "You are not authorized to modify this video"
            );
        }
    }

    #getPagination(page, limit) {
        return {
            pageNum: Math.max(1, parseInt(page, 10)),
            limitNum: Math.min(
                Math.max(1, parseInt(limit, 10)),
                PaginationDefaults.MAX_LIMIT
            ),
        };
    }
}

export { VideoService };
