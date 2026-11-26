import { ApiError } from "../../shared/errors/api-error.js";
import { HttpStatus } from "../../shared/constants/index.js";
import type {
    MediaStreamProvider,
    MediaStreamResult,
} from "./media-storage.types.js";

class MediaStreamService {
    readonly #provider: MediaStreamProvider;

    constructor(provider: MediaStreamProvider) {
        this.#provider = provider;
    }

    async streamImage(url: string): Promise<MediaStreamResult> {
        const result = await this.streamVideo(url);
        const type = result.headers["Content-Type"]?.split(";")[0]?.trim();
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type || "")) {
            result.body?.destroy();
            throw new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, "Unsupported stored image");
        }
        return {
            ...result,
            headers: {
                ...result.headers,
                "Cache-Control": "private, no-store",
                "X-Content-Type-Options": "nosniff",
            },
        };
    }

    streamVideo(url: string, range?: string): Promise<MediaStreamResult> {
        if (!url) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Video media not found");
        }

        return this.#provider.stream({ url, range });
    }
}

export { MediaStreamService };
