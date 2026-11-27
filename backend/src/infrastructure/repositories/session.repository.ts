// @ts-nocheck
import { SessionRepository } from "../../domain/repositories/session.repository.js";
import { UnauthorizedError } from "../../shared/errors/api-error.js";
import { createId } from "../../shared/helpers/id-generator.js";
import { prisma } from "../database/prisma/client.js";

class PrismaSessionRepository extends SessionRepository {
    createSession(sessionData) {
        return prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM users WHERE id = ${sessionData.userId} FOR UPDATE`;
            const user = await tx.user.findUnique({
                where: { id: sessionData.userId },
                select: { credentialVersion: true, onboardingStatus: true },
            });
            if (
                !user ||
                user.onboardingStatus !== "active" ||
                user.credentialVersion !== sessionData.expectedCredentialVersion
            ) {
                throw new UnauthorizedError("Credentials changed; sign in again");
            }
            const session = await tx.session.create({
                data: {
                    id: sessionData.id || createId(),
                    userId: sessionData.userId,
                    refreshTokenHash: sessionData.refreshTokenHash,
                    userAgent: sessionData.userAgent,
                    ipAddress: sessionData.ipAddress,
                    expiresAt: sessionData.expiresAt,
                },
            });
            await tx.user.update({
                where: { id: sessionData.userId },
                data: { lastLoginAt: new Date() },
            });
            return session;
        });
    }

    findSessionById(sessionId) {
        return prisma.session.findUnique({ where: { id: sessionId } });
    }

    findValidSession({ sessionId, userId }) {
        return prisma.session.findFirst({
            where: {
                id: sessionId,
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
    }

    rotateSessionToken({
        sessionId,
        userId,
        expectedHash,
        nextHash,
        expiresAt,
    }) {
        const now = new Date();
        return prisma.session.updateMany({
            where: {
                id: sessionId,
                userId,
                refreshTokenHash: expectedHash,
                revokedAt: null,
                expiresAt: { gt: now },
            },
            data: {
                refreshTokenHash: nextHash,
                expiresAt,
                lastUsedAt: now,
            },
        });
    }

    updateSessionTokenHash(sessionId, refreshTokenHash, expiresAt) {
        return prisma.session.update({
            where: { id: sessionId },
            data: {
                refreshTokenHash,
                expiresAt,
                lastUsedAt: new Date(),
            },
        });
    }

    updateSessionLastUsedAt(sessionId) {
        return prisma.session.update({
            where: { id: sessionId },
            data: { lastUsedAt: new Date() },
        });
    }

    listActiveSessions(userId) {
        return prisma.session.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            select: {
                id: true,
                userAgent: true,
                createdAt: true,
                lastUsedAt: true,
                expiresAt: true,
            },
            orderBy: { lastUsedAt: "desc" },
            take: 100,
        });
    }

    revokeOwnedSession(userId, sessionId) {
        return prisma.session.updateMany({
            where: { id: sessionId, userId, revokedAt: null },
            data: { revokedAt: new Date(), revokedReason: "user-revoked" },
        });
    }

    revokeSession(sessionId, revokedReason = "logout") {
        return prisma.session.updateMany({
            where: { id: sessionId, revokedAt: null },
            data: {
                revokedAt: new Date(),
                revokedReason,
            },
        });
    }

    revokeAllUserSessions(userId, revokedReason = "logout-all") {
        const now = new Date();
        return prisma.$transaction(async (tx) => {
            const result = await tx.session.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: now, revokedReason },
            });
            await tx.mfaTrustToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: now },
            });
            return result;
        });
    }
}

export { PrismaSessionRepository };
