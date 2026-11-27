import { HttpStatus } from "../constants/index.js";
import { presentMedia } from "./media-presentation.js";

class ApiResponse {
    readonly success: boolean;
    readonly statusCode: number;
    readonly message: string;
    readonly data: unknown;
    readonly timestamp: string;
    readonly meta?: Record<string, unknown>;

    constructor(
        statusCode: number,
        data: unknown,
        message = "Success",
        meta: Record<string, unknown> | null = null
    ) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = presentMedia(data);
        this.timestamp = new Date().toISOString();
        if (meta) this.meta = meta;
    }

    static success(data: unknown, message = "Success") {
        return new ApiResponse(HttpStatus.OK, data, message);
    }

    static created(data: unknown, message = "Resource created successfully") {
        return new ApiResponse(HttpStatus.CREATED, data, message);
    }

    static noContent(message = "No content") {
        return new ApiResponse(HttpStatus.NO_CONTENT, null, message);
    }

    static paginated(data: unknown, pagination: unknown, message = "Success") {
        return new ApiResponse(HttpStatus.OK, data, message, { pagination });
    }

    toJSON() {
        const response = {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            timestamp: this.timestamp,
        };
        return this.meta ? { ...response, meta: this.meta } : response;
    }
}

function parseInteger(value: unknown, fallback: number): number {
    if (typeof value !== "string" && typeof value !== "number") return fallback;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isSafeInteger(parsed) ? parsed : fallback;
}

class PaginationBuilder {
    private page: number;
    private limit: number;
    private totalCount: number;

    constructor(page?: unknown, limit?: unknown, totalCount?: unknown) {
        this.page = Math.max(1, parseInteger(page, 1) || 1);
        this.limit = Math.max(1, Math.min(100, parseInteger(limit, 10) || 10));
        this.totalCount = Math.max(0, parseInteger(totalCount, 0));
    }

    build() {
        const totalPages = Math.ceil(this.totalCount / this.limit);
        return {
            currentPage: this.page,
            totalPages,
            pageSize: this.limit,
            totalCount: this.totalCount,
            hasNextPage: this.page < totalPages,
            hasPreviousPage: this.page > 1,
        };
    }

    setPage(page: unknown) {
        this.page = Math.max(1, parseInteger(page, 1) || 1);
        return this;
    }

    setLimit(limit: unknown) {
        this.limit = Math.max(1, Math.min(100, parseInteger(limit, 10) || 10));
        return this;
    }

    setTotalDocs(totalCount: unknown) {
        this.totalCount = Math.max(0, parseInteger(totalCount, 0));
        return this;
    }

    getSkip() {
        return (this.page - 1) * this.limit;
    }

    getLimit() {
        return this.limit;
    }
}

export { ApiResponse, PaginationBuilder };
