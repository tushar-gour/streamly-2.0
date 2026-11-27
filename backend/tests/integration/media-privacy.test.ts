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
        await prisma.moderationAction.deleteMany({
            where: { actorId: { in: userIds } },
        });
        userIds.length = 0;
    });

    it("enforces moderation permissions, durable holds and release audit", async () => {
        const { owner, viewer, video } = await fixture();
        const mod = await account();
        const role = await prisma.role.findUniqueOrThrow({
            where: { name: "moderator" },
        });
        const userRole = await prisma.role.findUniqueOrThrow({
            where: { name: "user" },
        });
        await prisma.userRole.create({
            data: { id: createId(), userId: mod.user._id, roleId: role.id },
        });
        await prisma.userRole.create({
            data: {
                id: createId(),
                userId: owner.user._id,
                roleId: userRole.id,
            },
        });
        await prisma.video.update({
            where: { id: video.id },
            data: { isPublished: true },
        });
        const path = "/api/v1/admin/videos/" + video.id + "/hold";
        const hold = {
            held: true,
            reason: "Integration test policy violation",
        };
        expect((await request(app).get("/api/v1/admin/overview")).status).toBe(
            401
        );
        expect(
            (
                await request(app)
                    .get("/api/v1/admin/videos")
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", "Bearer " + owner.token)
                    .send(hold)
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .get("/api/v1/admin/overview")
                    .set("Authorization", "Bearer " + mod.token)
            ).status
        ).toBe(200);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", "Bearer " + mod.token)
                    .send(hold)
            ).status
        ).toBe(200);
        expect(
            await prisma.video.findUniqueOrThrow({ where: { id: video.id } })
        ).toMatchObject({ moderationHeld: true, isPublished: false });
        expect(
            (
                await request(app)
                    .get("/api/v1/videos/" + video.id)
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(403);
        const toggle = "/api/v1/videos/toggle/publish/" + video.id;
        expect(
            (
                await request(app)
                    .patch(toggle)
                    .set("Authorization", "Bearer " + owner.token)
            ).status
        ).toBe(409);
        await expect(
            prisma.video.update({
                where: { id: video.id },
                data: { isPublished: true },
            })
        ).rejects.toThrow();
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", "Bearer " + mod.token)
                    .send({ held: false, reason: "Resolved" })
            ).status
        ).toBe(200);
        expect(
            await prisma.video.findUniqueOrThrow({ where: { id: video.id } })
        ).toMatchObject({ moderationHeld: false, isPublished: false });
        expect(
            (
                await request(app)
                    .patch(toggle)
                    .set("Authorization", "Bearer " + owner.token)
            ).status
        ).toBe(200);
        const audit = await prisma.moderationAction.findMany({
            where: { resourceId: video.id },
            orderBy: { createdAt: "asc" },
        });
        expect(audit.map((entry) => entry.action)).toEqual([
            "video_hold",
            "video_release",
        ]);
        expect(audit.every((entry) => entry.actorId === mod.user._id)).toBe(
            true
        );
    });

    it("holds comments without exposing held content or allowing authors to edit it", async () => {
        const { owner, viewer, video } = await fixture();
        const mod = await account();
        const role = await prisma.role.findUniqueOrThrow({
            where: { name: "moderator" },
        });
        const userRole = await prisma.role.findUniqueOrThrow({
            where: { name: "user" },
        });
        await prisma.userRole.createMany({
            data: [
                { id: createId(), userId: mod.user._id, roleId: role.id },
                { id: createId(), userId: owner.user._id, roleId: userRole.id },
            ],
        });
        await prisma.video.update({
            where: { id: video.id },
            data: { isPublished: true },
        });
        const comment = await prisma.comment.findFirstOrThrow({
            where: { videoId: video.id },
        });
        const list = "/api/v1/comments/" + video.id;
        const path = "/api/v1/admin/comments/" + comment.id + "/hold";
        const hold = { held: true, reason: "Policy review" };
        const bearer = "Bearer " + mod.token;
        expect((await request(app).get(list)).body.data).toHaveLength(1);
        expect((await request(app).get("/api/v1/admin/comments")).status).toBe(
            401
        );
        expect(
            (
                await request(app)
                    .get("/api/v1/admin/comments")
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", "Bearer " + owner.token)
                    .send(hold)
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .get("/api/v1/admin/comments")
                    .set("Authorization", bearer)
            ).status
        ).toBe(200);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", bearer)
                    .send(hold)
            ).status
        ).toBe(200);
        expect((await request(app).get(list)).body.data).toEqual([]);
        expect(
            (
                await request(app)
                    .get(list)
                    .set("Authorization", "Bearer " + owner.token)
            ).body.data
        ).toEqual([]);
        expect(
            (
                await request(app)
                    .patch("/api/v1/comments/c/" + comment.id)
                    .set("Authorization", "Bearer " + owner.token)
                    .send({ content: "changed" })
            ).status
        ).toBe(409);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", bearer)
                    .send(hold)
            ).status
        ).toBe(409);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", bearer)
                    .send({ held: false, reason: "Resolved" })
            ).status
        ).toBe(200);
        expect((await request(app).get(list)).body.data).toHaveLength(1);
        const actions = await prisma.moderationAction.findMany({
            where: { resourceId: comment.id },
        });
        expect(actions.map((action) => action.action).sort()).toEqual([
            "comment_hold",
            "comment_release",
        ]);
        expect(actions.every((action) => action.actorId === mod.user._id)).toBe(
            true
        );
    });

    it("persists subscription notifications and scopes read state to the recipient", async () => {
        const owner = await account();
        const viewer = await account();
        const base = "/api/v1/notifications";
        const auth = "Bearer " + owner.token;
        expect((await request(app).get(base)).status).toBe(401);
        const subscribed = await request(app)
            .post("/api/v1/subscriptions/c/" + owner.user._id)
            .set("Authorization", "Bearer " + viewer.token);
        expect(subscribed.status).toBe(201);
        const response = await request(app)
            .get(base)
            .set("Authorization", auth);
        expect(response.status).toBe(200);
        expect(response.body.data.unread).toBe(1);
        expect(response.body.data.items[0].kind).toBe("subscription");
        const id = response.body.data.items[0].id;
        expect(
            (
                await request(app)
                    .patch(base + "/" + id + "/read")
                    .set("Authorization", "Bearer " + viewer.token)
            ).status
        ).toBe(404);
        expect(
            (
                await request(app)
                    .get(base)
                    .set("Authorization", "Bearer " + viewer.token)
            ).body.data.items
        ).toEqual([]);
        expect(
            (
                await request(app)
                    .patch(base + "/" + id + "/read")
                    .set("Authorization", auth)
            ).status
        ).toBe(200);
        expect(
            (await request(app).get(base).set("Authorization", auth)).body.data
                .unread
        ).toBe(0);
        await prisma.notification.create({
            data: {
                id: createId(),
                userId: owner.user._id,
                kind: "security",
                message: "Test security activity",
            },
        });
        await prisma.notification.create({
            data: {
                id: createId(),
                userId: viewer.user._id,
                kind: "security",
                message: "Separate account activity",
            },
        });
        expect(
            (
                await request(app)
                    .patch(base + "/read-all")
                    .set("Authorization", auth)
            ).status
        ).toBe(200);
        expect(
            (await request(app).get(base).set("Authorization", auth)).body.data
                .unread
        ).toBe(0);
        expect(
            (
                await request(app)
                    .get(base)
                    .set("Authorization", "Bearer " + viewer.token)
            ).body.data.unread
        ).toBe(1);
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

    it("defaults new playlists to private and validates visibility changes", async () => {
        const owner = await account();
        const viewer = await account();
        const role = await prisma.role.findUniqueOrThrow({
            where: { name: "user" },
        });
        await prisma.userRole.create({
            data: { id: createId(), userId: owner.user._id, roleId: role.id },
        });
        const auth = "Bearer " + owner.token;
        const other = "Bearer " + viewer.token;
        const created = await request(app)
            .post("/api/v1/playlists")
            .set("Authorization", auth)
            .send({ name: "Private by default" });
        expect(created.status).toBe(201);
        expect(created.body.data.isPublic).toBe(false);
        const path = "/api/v1/playlists/" + created.body.data._id;
        expect(
            (await request(app).get(path).set("Authorization", other)).status
        ).toBe(404);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", auth)
                    .send({ isPublic: "true" })
            ).status
        ).toBe(400);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", auth)
                    .send({ isPublic: true })
            ).status
        ).toBe(200);
        expect(
            (await request(app).get(path).set("Authorization", other)).status
        ).toBe(200);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", other)
                    .send({ isPublic: false })
            ).status
        ).toBe(403);
        expect(
            (
                await request(app)
                    .patch(path)
                    .set("Authorization", auth)
                    .send({ isPublic: false })
            ).status
        ).toBe(200);
        expect(
            (await request(app).get(path).set("Authorization", other)).status
        ).toBe(404);
    });

    it("makes concurrent desired subscription changes idempotent", async () => {
        const owner = await account();
        const viewer = await account();
        const path = "/api/v1/subscriptions/c/" + owner.user._id;
        const auth = "Bearer " + viewer.token;
        const subscribe = () =>
            request(app)
                .put(path)
                .set("Authorization", auth)
                .send({ isSubscribed: true });
        const results = await Promise.all([subscribe(), subscribe()]);
        expect(results.map((r) => r.status).sort()).toEqual([200, 201]);
        expect(results.every((r) => r.body.data.isSubscribed)).toBe(true);
        expect(
            await prisma.subscription.count({
                where: {
                    subscriberId: viewer.user._id,
                    channelId: owner.user._id,
                },
            })
        ).toBe(1);
        expect(
            await prisma.notification.count({
                where: { userId: owner.user._id, kind: "subscription" },
            })
        ).toBe(1);
        expect(
            (await request(app).put(path).set("Authorization", auth).send({}))
                .status
        ).toBe(400);
        const listPath = "/api/v1/subscriptions/u/" + viewer.user._id;
        const list = await request(app)
            .get(listPath)
            .set("Authorization", auth);
        expect(list.status).toBe(200);
        expect(list.body.data).toMatchObject([{ _id: owner.user._id }]);
        expect(
            (await request(app).get(listPath + "?page=1&limit=1")).status
        ).toBe(200);
        expect(
            (await request(app).get(listPath + "?page=invalid")).status
        ).toBe(400);
        const remove = () =>
            request(app)
                .put(path)
                .set("Authorization", auth)
                .send({ isSubscribed: false });
        expect(
            (await Promise.all([remove(), remove()])).every(
                (r) => r.status === 200 && !r.body.data.isSubscribed
            )
        ).toBe(true);
        expect(
            await prisma.subscription.count({
                where: {
                    subscriberId: viewer.user._id,
                    channelId: owner.user._id,
                },
            })
        ).toBe(0);
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

    it("rejects a stale account before executing an authenticated mutation", async () => {
        const { owner, viewer } = await fixture();
        const response = await request(app)
            .post("/api/v1/users/logout-all")
            .set("Cookie", "accessToken=" + viewer.token)
            .set("X-Streamly-Account", owner.user._id);
        expect(response.status).toBe(409);
        expect(response.headers["x-streamly-session"]).toBe("changed");
        await expect(
            container.services.authService.verifyAccessToken(viewer.token)
        ).resolves.toMatchObject({ user: { _id: viewer.user._id } });
    });

    it("marks an invalid session before entering a protected handler", async () => {
        const response = await request(app)
            .post("/api/v1/users/logout-all")
            .set("Authorization", "Bearer invalid-session");
        expect(response.status).toBe(401);
        expect(response.headers["x-streamly-session"]).toBe("expired");
    });
});
