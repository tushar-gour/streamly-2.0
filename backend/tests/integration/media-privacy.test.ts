import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import { container } from "../../src/core/container/index.js";
import { prisma } from "../../src/infrastructure/database/prisma/client.js";
import { createId } from "../../src/shared/helpers/id-generator.js";
import { createTestUserData } from "../factories/user.factory.js";
import {
    assertSafeTestDatabase,
    canRunDatabaseTests,
} from "../helpers/test-database.js";

const databaseDescribe = canRunDatabaseTests() ? describe : describe.skip;

databaseDescribe("media and object privacy", () => {
    const userIds: string[] = [];

    async function account() {
        assertSafeTestDatabase();
        const user =
            await container.repositories.userRepository.createUser(
                createTestUserData()
            );
        userIds.push(user._id);
        const session = await container.services.authService.createLoginSession(
            {
                user,
                userAgent: undefined,
                ipAddress: undefined,
            }
        );
        return { user, token: session.accessToken };
    }

    async function fixture() {
        const owner = await account();
        const viewer = await account();
        const video = await prisma.video.create({
            data: {
                id: createId(),
                ownerId: owner.user._id,
                title: "Private test video",
                description: "Private test description",
                videoFile: "https://example.com/private.webm",
                thumbnail: "https://example.com/private.png",
                duration: 2,
                isPublished: false,
            },
        });
        const playlist = await prisma.playlist.create({
            data: {
                id: createId(),
                ownerId: owner.user._id,
                name: "Private test playlist",
                isPublic: false,
                videos: { create: { videoId: video.id } },
            },
        });
        await prisma.comment.create({
            data: {
                id: createId(),
                videoId: video.id,
                ownerId: owner.user._id,
                content: "Private test comment",
            },
        });
        await prisma.watchHistory.create({
            data: { userId: viewer.user._id, videoId: video.id },
        });
        return { owner, viewer, video, playlist };
    }

    afterEach(async () => {
        assertSafeTestDatabase();
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        userIds.length = 0;
    });

    it("denies unpublished details to guests and other accounts", async () => {
        const { owner, viewer, video } = await fixture();
        const path = "/api/v1/videos/" + video.id;
        expect((await request(app).get(path)).status).toBe(401);
        expect(
            (
                await request(app)
                    .get(path)
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .get(path)
                    .set("Authorization", "Bearer " + owner.token)
            ).status
        ).toBe(200);
    });

    it("denies unpublished comments to guests and other accounts", async () => {
        const { owner, viewer, video } = await fixture();
        const path = "/api/v1/comments/" + video.id;
        expect((await request(app).get(path)).status).toBe(404);
        expect(
            (
                await request(app)
                    .get(path)
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(404);
        expect(
            (
                await request(app)
                    .get(path)
                    .set("Authorization", "Bearer " + owner.token)
            ).status
        ).toBe(200);
    });

    it("restricts private playlists to their owner", async () => {
        const { owner, viewer, playlist } = await fixture();
        const path = "/api/v1/playlists/" + playlist.id;
        expect(
            (
                await request(app)
                    .get(path)
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(404);
        expect(
            (
                await request(app)
                    .get(path)
                    .set("Authorization", "Bearer " + owner.token)
            ).status
        ).toBe(200);
        const response = await request(app)
            .get("/api/v1/playlists/user/" + owner.user._id)
            .set("Authorization", "Bearer " + viewer.token);
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    it("hides unpublished videos from another account's history", async () => {
        const { viewer } = await fixture();
        const response = await request(app)
            .get("/api/v1/users/watch-history")
            .set("Authorization", "Bearer " + viewer.token);
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    it("does not disclose private email addresses through channel profiles", async () => {
        const { owner, viewer } = await fixture();
        const response = await request(app)
            .get("/api/v1/users/c/" + owner.user.username)
            .set("Authorization", "Bearer " + viewer.token);
        expect(response.status).toBe(200);
        expect(response.body.data).not.toHaveProperty("email");
    });
});
