import { appConfig } from "../../config/env.js";

// Keep storage locators internal. Only API resource IDs identify deliverable media.
export function presentMedia(data: unknown): unknown {
    if (appConfig.media.storageProvider !== "s3") return data;
    if (Array.isArray(data)) return data.map(presentMedia);
    if (!data || typeof data !== "object" || data instanceof Date) return data;

    const record = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, presentMedia(value)])
    );
    const id = record._id ?? record.id;
    if (typeof id !== "string" || !/^[a-f0-9]{24}$/.test(id)) return record;

    if (typeof record.videoFile === "string") {
        record.videoFile = `/api/v1/videos/${id}/stream`;
    }
    if (typeof record.thumbnail === "string" && record.thumbnail) {
        const videoId = record.thumbnailVideoId ?? id;
        record.thumbnail = `/api/v1/videos/${videoId}/thumbnail`;
    }
    if (typeof record.avatar === "string" && record.avatar) {
        record.avatar = `/api/v1/users/${id}/media/avatar`;
    }
    if (typeof record.coverImage === "string" && record.coverImage) {
        record.coverImage = `/api/v1/users/${id}/media/cover`;
    }
    delete record.thumbnailVideoId;
    return record;
}
