import { prisma } from "../database/prisma/client.js";

// Count only; never log actual storage URLs or account information.
export async function assertPrivateMediaRecords(): Promise<void> {
    const [result] = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM (
            SELECT "videoFile" AS media FROM videos
            UNION ALL SELECT thumbnail FROM videos
            UNION ALL SELECT avatar FROM users WHERE avatar <> ''
            UNION ALL SELECT "coverImage" FROM users WHERE "coverImage" <> ''
        ) AS assets
        WHERE media !~ '^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_.-]+)+$'
            OR media ~ '(^|/)[.]{1,2}(/|$)'
    `;
    if (!result || result.count > 0n) {
        throw new Error("Private media migration required before startup");
    }
}
