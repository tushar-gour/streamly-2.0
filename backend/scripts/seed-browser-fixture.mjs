import bcrypt from "bcrypt";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
    CreateBucketCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

import { prisma } from "../src/infrastructure/database/prisma/client.js";
import { createId } from "../src/shared/helpers/id-generator.js";

const url = new URL(process.env.DATABASE_URL || "");
if (
    process.env.NODE_ENV !== "test" ||
    process.env.RUN_DATABASE_TESTS !== "true" ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.pathname !== "/streamly_test"
) {
    throw new Error("Browser fixture requires an isolated local test database");
}

try {
    const role = await prisma.role.findUniqueOrThrow({
        where: { name: "user" },
    });
    const password = await bcrypt.hash("StreamlyBrowserTest123!", 10);
    const user = await prisma.user.create({
        data: {
            id: createId(),
            email: "browser-test@example.com",
            username: "browser-test",
            fullName: "Browser Test",
            avatar: "",
            coverImage: "",
            password,
            onboardingStatus: "active",
            emailVerifiedAt: new Date(),
            userRoles: {
                create: { id: createId(), roleId: role.id },
            },
        },
    });

    const moderator = await prisma.role.findUniqueOrThrow({
        where: { name: "moderator" },
    });
    await prisma.user.create({
        data: {
            id: createId(),
            email: "browser-moderator@example.com",
            username: "browser-moderator",
            fullName: "Browser Moderator",
            avatar: "",
            coverImage: "",
            password,
            onboardingStatus: "active",
            emailVerifiedAt: new Date(),
            userRoles: {
                create: { id: createId(), roleId: moderator.id },
            },
        },
    });

    // Generated test assets, confined to the disposable CI environment.
    mkdirSync("public/browser-fixtures", { recursive: true });
    mkdirSync("../frontend/public/browser-fixtures", { recursive: true });
    execFileSync(ffmpegPath, [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x261f56:s=320x180:r=24",
        "-t",
        "2",
        "-c:v",
        "libvpx",
        "public/browser-fixtures/sample.webm",
    ]);
    writeFileSync(
        "../frontend/public/browser-fixtures/thumbnail.svg",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#17213e"/><stop offset="1" stop-color="#6c5ce7"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="240" cy="55" r="28" fill="#a79cff" opacity=".5"/><path d="M0 180L100 65l70 80 45-50 105 85Z" fill="#0d111b"/></svg>'
    );
    writeFileSync(
        "public/browser-fixtures/thumbnail.png",
        Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kvX8AAAAASUVORK5CYII=",
            "base64"
        )
    );
    // Browser smoke uses the same private storage and streaming path as production.
    const bucket = process.env.AWS_S3_BUCKET;
    if (
        process.env.MEDIA_STORAGE_PROVIDER !== "s3" ||
        process.env.AWS_S3_ENDPOINT !== "http://127.0.0.1:19000" ||
        bucket !== "streamly-browser-test"
    ) {
        throw new Error("Browser fixture requires isolated object storage");
    }
    const storage = new S3Client({
        endpoint: process.env.AWS_S3_ENDPOINT,
        region: "ap-south-1",
        forcePathStyle: true,
        credentials: {
            accessKeyId: "streamlytest",
            secretAccessKey: "streamlytest-secret",
        },
        requestChecksumCalculation: "WHEN_REQUIRED",
    });
    try {
        await storage.send(new CreateBucketCommand({ Bucket: bucket }));
        await storage.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: "fixtures/sample.webm",
                Body: readFileSync("public/browser-fixtures/sample.webm"),
                ContentType: "video/webm",
            })
        );
        await storage.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: "fixtures/thumbnail.png",
                Body: readFileSync("public/browser-fixtures/thumbnail.png"),
                ContentType: "image/png",
            })
        );
    } finally {
        storage.destroy();
    }
    await prisma.video.create({
        data: {
            id: createId(),
            ownerId: user.id,
            title: "Browser fixture video",
            description: "Generated local video for CI integration testing.",
            videoFile: "fixtures/sample.webm",
            thumbnail: "fixtures/thumbnail.png",
            duration: 2,
            isPublished: true,
        },
    });
} finally {
    await prisma.$disconnect();
}
