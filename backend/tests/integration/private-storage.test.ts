import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import {
    CreateBucketCommand,
    HeadObjectCommand,
    S3Client,
    ListObjectsV2Command,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import ffmpegPath from "ffmpeg-static";
import { app } from "../../src/app.js";
import { appConfig } from "../../src/config/env.js";
import { container } from "../../src/core/container/index.js";
import { prisma } from "../../src/infrastructure/database/prisma/client.js";
import { createId } from "../../src/shared/helpers/id-generator.js";
import { createTestUserData } from "../factories/user.factory.js";

const enabled = process.env.RUN_STORAGE_TESTS === "true";
const storageDescribe = enabled ? describe : describe.skip;

storageDescribe("private media through real isolated object storage", () => {
    const bucket = "streamly-storage-test";
    const endpoint = "http://127.0.0.1:19000";
    const client = new S3Client({
        endpoint,
        region: "ap-south-1",
        forcePathStyle: true,
        credentials: {
            accessKeyId: "streamlytest",
            secretAccessKey: "streamlytest-secret",
        },
    });
    const users: string[] = [];
    let directory: string;
    let video: Buffer;
    let thumbnail: Buffer;

    beforeAll(async () => {
        const db = new URL(appConfig.database.url);
        if (
            !["localhost", "127.0.0.1"].includes(db.hostname) ||
            db.pathname !== "/streamly_test" ||
            appConfig.aws.s3Bucket !== bucket ||
            appConfig.aws.s3Endpoint !== endpoint ||
            appConfig.media.storageProvider !== "s3"
        )
            throw new Error("Refusing non-isolated storage test configuration");
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
        directory = mkdtempSync(join(tmpdir(), "streamly-storage-test-"));
        execFileSync(ffmpegPath || "ffmpeg", [
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=blue:s=160x90:r=24",
            "-t",
            "2",
            "-c:v",
            "libvpx",
            join(directory, "video.webm"),
        ]);
        video = readFileSync(join(directory, "video.webm"));
        thumbnail = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kvX8AAAAASUVORK5CYII=",
            "base64"
        );
    });

    afterAll(async () => {
        if (!directory) return;
        await prisma.user.deleteMany({ where: { id: { in: users } } });
        const objects = await client.send(
            new ListObjectsV2Command({ Bucket: bucket })
        );
        for (const object of objects.Contents || []) {
            await client.send(
                new DeleteObjectCommand({ Bucket: bucket, Key: object.Key })
            );
        }
        rmSync(directory, { recursive: true, force: true });
        client.destroy();
    });

    async function account() {
        const user =
            await container.repositories.userRepository.createUser(
                createTestUserData()
            );
        users.push(user._id);
        const role = await prisma.role.findUniqueOrThrow({
            where: { name: "user" },
        });
        await prisma.userRole.create({
            data: { id: createId(), userId: user._id, roleId: role.id },
        });
        const session = await container.services.authService.createLoginSession(
            { user, userAgent: undefined, ipAddress: undefined }
        );
        return { id: user._id, bearer: "Bearer " + session.accessToken };
    }

    it("uploads, proxies ranges and images, enforces privacy after unpublish, and deletes media", async () => {
        const owner = await account();
        const viewer = await account();
        const requestId = randomUUID();
        const upload = await request(app)
            .post("/api/v1/videos")
            .set("Authorization", owner.bearer)
            .field("requestId", requestId)
            .field("title", "Private origin integration")
            .field("description", "Real generated WebM")
            .attach("videoFile", video, {
                filename: "video.webm",
                contentType: "video/webm",
            })
            .attach("thumbnail", thumbnail, {
                filename: "thumb.png",
                contentType: "image/png",
            });
        expect(upload.status, JSON.stringify(upload.body)).toBe(201);
        const id = upload.body.data._id;
        const replay = await request(app).post("/api/v1/videos").set("Authorization", owner.bearer)
            .field("requestId", requestId).field("title", "Private origin integration").field("description", "Real generated WebM")
            .attach("videoFile", video, { filename: "video.webm", contentType: "video/webm" })
            .attach("thumbnail", thumbnail, { filename: "thumb.png", contentType: "image/png" });
        expect(replay.status).toBe(201);
        expect(replay.body.data._id).toBe(id);
        expect(await prisma.video.count({ where: { ownerId: owner.id } })).toBe(1);
        const statusPath = "/api/v1/videos/uploads/" + requestId;
        const status = await request(app).get(statusPath).set("Authorization", owner.bearer);
        expect(status.body.data).toMatchObject({ status: "ready", videoId: id });
        expect(status.body.data).not.toHaveProperty("videoKey");
        expect((await request(app).get(statusPath).set("Authorization", viewer.bearer)).status).toBe(404);
        expect((await request(app).get(statusPath)).status).toBe(401);
        const base = "/api/v1/videos/" + id;
        const stored = await prisma.video.findUniqueOrThrow({ where: { id } });
        expect(stored.duration).toBeGreaterThan(0);
        expect(upload.body.data.videoFile).toBe(base + "/stream");
        expect(upload.body.data.thumbnail).toBe(base + "/thumbnail");
        expect(stored.videoFile).not.toContain("://");
        expect(
            (await fetch(endpoint + "/" + bucket + "/" + stored.videoFile))
                .status
        ).toBe(403);
        expect(
            (await fetch(endpoint + "/" + bucket + "/" + stored.thumbnail))
                .status
        ).toBe(403);
        const range = await request(app)
            .get(base + "/stream")
            .set("Range", "bytes=0-31");
        expect(range.status).toBe(206);
        expect(range.headers["content-range"]).toBe(
            "bytes 0-31/" + video.length
        );
        expect(range.headers["cache-control"]).toContain("no-store");
        const image = await request(app).get(base + "/thumbnail");
        expect(image.status).toBe(200);
        expect(image.headers["content-type"]).toContain("image/png");
        expect(image.body).toEqual(thumbnail);
        const toggle = "/api/v1/videos/toggle/publish/" + id;
        expect(
            (
                await request(app)
                    .patch(toggle)
                    .set("Authorization", owner.bearer)
            ).status
        ).toBe(200);
        for (const path of [base, base + "/stream", base + "/thumbnail"]) {
            expect((await request(app).get(path)).status).toBe(401);
            expect(
                (
                    await request(app)
                        .get(path)
                        .set("Authorization", viewer.bearer)
                ).status
            ).toBe(403);
            expect(
                (
                    await request(app)
                        .get(path)
                        .set("Authorization", owner.bearer)
                ).status
            ).toBe(200);
        }
        expect(
            (
                await request(app)
                    .patch(toggle)
                    .set("Authorization", viewer.bearer)
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .delete(base)
                    .set("Authorization", viewer.bearer)
            ).status
        ).toBe(403);
        const replaced = await request(app)
            .patch(base)
            .set("Authorization", owner.bearer)
            .attach("thumbnail", thumbnail, {
                filename: "replacement.png",
                contentType: "image/png",
            });
        expect(replaced.status).toBe(200);
        const newVideo = await prisma.video.findUniqueOrThrow({
            where: { id },
        });
        expect(newVideo.thumbnail).not.toBe(stored.thumbnail);
        for (const [route, field, kind] of [
            ["avatar", "avatar", "avatar"],
            ["cover-image", "coverImage", "cover"],
        ]) {
            const result = await request(app)
                .patch("/api/v1/users/" + route)
                .set("Authorization", owner.bearer)
                .attach(field, thumbnail, {
                    filename: "profile.png",
                    contentType: "image/png",
                });
            expect(result.status, JSON.stringify(result.body)).toBe(200);
            const media = "/api/v1/users/" + owner.id + "/media/" + kind;
            expect(result.body.data[field]).toBe(media);
            expect((await request(app).get(media)).body).toEqual(thumbnail);
        }
        expect(
            (await request(app).delete(base).set("Authorization", owner.bearer))
                .status
        ).toBe(200);
        expect((await request(app).get(base + "/stream")).status).toBe(404);
        await expect
            .poll(async () => {
                try {
                    await client.send(
                        new HeadObjectCommand({
                            Bucket: bucket,
                            Key: stored.videoFile,
                        })
                    );
                    return true;
                } catch (error) {
                    if (error instanceof Error && error.name === "NotFound")
                        return false;
                    throw error;
                }
            })
            .toBe(false);
        const forged = await request(app)
            .patch("/api/v1/users/avatar")
            .set("Authorization", owner.bearer)
            .attach("avatar", Buffer.from("<html>not an image</html>"), {
                filename: "fake.png",
                contentType: "image/png",
            });
        expect(forged.status).toBe(400);
    });
    it("persists failed processing and cleans expired private staging objects", async () => {
        const owner = await account();
        const requestId = randomUUID();
        const failed = await request(app).post("/api/v1/videos").set("Authorization", owner.bearer)
            .field("requestId", requestId).field("title", "Invalid video").field("description", "Invalid but matching signature")
            .attach("videoFile", Buffer.from([26, 69, 223, 163, 0, 0, 0, 0]), { filename: "bad.webm", contentType: "video/webm" })
            .attach("thumbnail", thumbnail, { filename: "thumb.png", contentType: "image/png" });
        expect(failed.status).toBe(422);
        const state = await request(app).get("/api/v1/videos/uploads/" + requestId).set("Authorization", owner.bearer);
        expect(state.body.data).toMatchObject({ status: "failed", videoId: null });
        const repository = container.repositories.videoUploadRepository;
        const { attempt } = await repository.begin(owner.id, "Interrupted", randomUUID(), true);
        if (!attempt.videoKey || !attempt.thumbnailKey) throw new Error("Missing staging keys");
        for (const key of [attempt.videoKey, attempt.thumbnailKey]) {
            await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: thumbnail }));
        }
        await prisma.videoUploadAttempt.update({ where: { id: attempt.id }, data: { expiresAt: new Date(0) } });
        const interrupted = await repository.status(owner.id, attempt.requestId);
        expect(interrupted.status).toBe("interrupted");
        await repository.cleanupExpired((key, resource) => container.services.mediaStorageService.delete(key, resource));
        const cleaned = await prisma.videoUploadAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
        expect(cleaned.status).toBe("failed");
        expect(cleaned.cleanedAt).not.toBeNull();
        for (const key of [attempt.videoKey, attempt.thumbnailKey]) {
            await expect(client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))).rejects.toThrow();
        }
        expect(await prisma.video.count({ where: { ownerId: owner.id } })).toBe(0);
    });

});
