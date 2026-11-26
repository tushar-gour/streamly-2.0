import type { RequestHandler } from "express";
import { open, rm } from "node:fs/promises";
import { ApiError } from "../../shared/errors/api-error.js";

function matchesSignature(type: string, header: Buffer): boolean {
    const text = header.toString("ascii");
    switch (type) {
        case "image/png": return header.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        case "image/jpeg": return header[0] === 255 && header[1] === 216 && header[2] === 255;
        case "image/gif": return text.startsWith("GIF87a") || text.startsWith("GIF89a");
        case "image/webp": return text.startsWith("RIFF") && text.slice(8, 12) === "WEBP";
        case "video/webm": return header.subarray(0, 4).equals(Buffer.from([26,69,223,163]));
        case "video/mp4":
        case "video/quicktime": return text.slice(4, 8) === "ftyp";
        case "video/mpeg": return header.subarray(0, 3).equals(Buffer.from([0,0,1]));
        default: return false;
    }
}

export const validateStagedMedia: RequestHandler = async (req, res, next) => {
    const files = [
        ...(req.file ? [req.file] : []),
        ...(Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat()),
    ];
    const cleanup = () => {
        void Promise.allSettled(files.map((file) => rm(file.path, { force: true })));
    };
    res.once("finish", cleanup);
    res.once("close", cleanup);
    try {
        for (const file of files) {
            if (file.size === 0 || (file.mimetype.startsWith("image/") && file.size > 10 * 1024 * 1024)) {
                throw new ApiError(400, "Invalid media size");
            }
            const handle = await open(file.path, "r");
            try {
                const bytes = Buffer.alloc(16);
                const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0);
                if (!matchesSignature(file.mimetype, bytes.subarray(0, bytesRead))) {
                    throw new ApiError(400, "File contents do not match the declared media type");
                }
            } finally {
                await handle.close();
            }
        }
        next();
    } catch (error) {
        cleanup();
        next(error);
    }
};
