import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { ApiError } from "../../shared/errors/api-error.js";

const execute = promisify(execFile);

export async function probeVideoDuration(path: string): Promise<number> {
    try {
        const { stderr } = await execute(
            ffmpegPath || "ffmpeg",
            [
                "-hide_banner", "-nostats", "-protocol_whitelist", "file,pipe",
                "-i", path, "-map", "0:v:0", "-c", "copy", "-f", "null", "-",
            ],
            { timeout: 20_000, maxBuffer: 256 * 1024 }
        );
        const match = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
        if (!match) throw new Error("Missing duration");
        const duration = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
        if (!Number.isFinite(duration) || duration <= 0) throw new Error("Invalid duration");
        return duration;
    } catch {
        throw new ApiError(422, "Invalid or unsupported video file");
    }
}
