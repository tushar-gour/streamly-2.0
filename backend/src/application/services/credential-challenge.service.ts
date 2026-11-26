import crypto from "node:crypto";
import bcrypt from "bcrypt";
import type { AuthChallenge, Prisma, User } from "@prisma/client";

import { appConfig, isProduction } from "../../config/env.js";
import { prisma } from "../../infrastructure/database/prisma/client.js";
import { audit } from "../../infrastructure/logger/audit-logger.js";
import { ApiError } from "../../shared/errors/api-error.js";
import { createId } from "../../shared/helpers/id-generator.js";

type Purpose = "password_recovery" | "email_change";
type Enqueue = (challengeId: string) => Promise<void>;
type VerifyMfa = (userId: string, code: string) => Promise<void>;
type Delivery = (payload: {
    email: string;
    code: string;
    purpose: string;
    expiresInMinutes: number;
}) => Promise<{ delivered: boolean }>;

const hash = (value: string) =>
    crypto.createHash("sha256").update(value).digest("hex");

const codeFor = (id: string, purpose: string) =>
    crypto.createHmac("sha256", appConfig.jwt.refreshTokenSecret)
        .update("streamly-credential-v1:" + purpose + ":" + id)
        .digest("hex").slice(0, 32);

const emailValue = (value: unknown) => {
    if (typeof value !== "string" || value.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value.trim())) {
        throw new ApiError(400, "Invalid email address");
    }
    return value.trim().toLowerCase();
};

const passwordValue = (value: unknown) => {
    if (typeof value !== "string" || value.length < 8 ||
        Buffer.byteLength(value, "utf8") > 72) {
        throw new ApiError(400, "Password must contain 8 characters and at most 72 UTF-8 bytes");
    }
    return value;
};

const invalid = () => new ApiError(400, "Invalid or expired verification challenge");

function metadata(challenge: AuthChallenge) {
    const value = challenge.metadataJson;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    if (typeof value.currentEmail !== "string" ||
        typeof value.targetEmail !== "string" ||
        (value.passwordChangedAt !== null && typeof value.passwordChangedAt !== "string")) return null;
    return {
        currentEmail: value.currentEmail,
        targetEmail: value.targetEmail,
        passwordChangedAt: value.passwordChangedAt,
        sessionId: typeof value.sessionId === "string" ? value.sessionId : null,
    };
}

async function lockUser(tx: Prisma.TransactionClient, id: string) {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR UPDATE`;
    return tx.user.findUnique({ where: { id } });
}

function matchesUser(user: User, details: NonNullable<ReturnType<typeof metadata>>) {
    return user.onboardingStatus === "active" &&
        user.email === details.currentEmail &&
        (user.passwordChangedAt?.toISOString() ?? null) === details.passwordChangedAt;
}

export async function revokeCredentialSessions(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date,
    reason: string
) {
    await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now, revokedReason: reason },
    });
    await tx.mfaTrustToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
    });
    await tx.authChallenge.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: now },
    });
    await tx.mfaChallenge.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: now },
    });
    await tx.emailVerificationToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: now },
    });
}

export class CredentialChallengeService {
    constructor(
        private readonly enqueue: Enqueue,
        private readonly verifyMfa: VerifyMfa
    ) {}

    async startRecovery(email: unknown) {
        const normalized = emailValue(email);
        const identifierHash = hash(normalized);
        const recent = await prisma.authChallenge.findFirst({
            where: {
                identifierHash,
                purpose: "password_recovery",
                createdAt: { gt: new Date(Date.now() - 60_000) },
                consumedAt: null,
            },
            orderBy: { createdAt: "desc" },
        });
        if (recent) {
            await this.enqueue(recent.id);
            return { challengeId: recent.id };
        }

        const user = await prisma.user.findUnique({ where: { email: normalized } });
        const eligible = user?.emailVerifiedAt && user.onboardingStatus === "active" ? user : null;
        // Persist and enqueue an indistinguishable challenge for unknown accounts.
        const challenge = await this.create("password_recovery", normalized, eligible);
        await this.enqueue(challenge.id);
        return { challengeId: challenge.id };
    }

    async startEmailChange(userId: string, sessionId: string, input: {
        email?: unknown;
        password?: unknown;
        mfaCode?: unknown;
    }) {
        const email = emailValue(input.email);
        const password = passwordValue(input.password);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.onboardingStatus !== "active" ||
            !(await bcrypt.compare(password, user.password))) {
            throw new ApiError(403, "Current credentials could not be verified");
        }
        if (email === user.email) throw new ApiError(400, "Enter a different email address");
        if (user.mfaEnabledAt) {
            if (typeof input.mfaCode !== "string") throw new ApiError(400, "Authenticator code required");
            await this.verifyMfa(userId, input.mfaCode);
        }
        const recent = await prisma.authChallenge.findFirst({
            where: { userId, purpose: "email_change", createdAt: { gt: new Date(Date.now() - 60_000) } },
        });
        if (recent) throw new ApiError(429, "Wait before requesting another email change code");

        const challenge = await this.create("email_change", email, user, sessionId);
        await this.enqueue(challenge.id);
        return { challengeId: challenge.id };
    }

    async completeRecovery(input: { challengeId?: unknown; code?: unknown; password?: unknown }) {
        const password = passwordValue(input.password);
        const challenge = await this.check("password_recovery", input.challengeId, input.code);
        const passwordHash = await bcrypt.hash(password, isProduction() ? 12 : 10);
        await this.apply(challenge, { password: passwordHash });
    }

    async completeEmailChange(userId: string, sessionId: string, input: { challengeId?: unknown; code?: unknown }) {
        const challenge = await this.check("email_change", input.challengeId, input.code, userId);
        const details = metadata(challenge);
        if (!details || details.sessionId !== sessionId) throw invalid();
        await this.apply(challenge, { email: details.targetEmail }, sessionId);
    }

    private async create(purpose: Purpose, email: string, user: User | null, sessionId?: string) {
        const id = createId();
        return prisma.authChallenge.create({
            data: {
                id,
                userId: user?.id,
                identifierHash: hash(email),
                channel: "email",
                purpose,
                codeHash: hash(codeFor(id, purpose)),
                expiresAt: new Date(Date.now() + 10 * 60_000),
                maxAttempts: 5,
                ...(user ? { metadataJson: {
                    currentEmail: user.email,
                    targetEmail: email,
                    passwordChangedAt: user.passwordChangedAt?.toISOString() ?? null,
                    ...(sessionId ? { sessionId } : {}),
                } } : {}),
            },
        });
    }

    private async check(purpose: Purpose, id: unknown, code: unknown, userId?: string) {
        if (typeof id !== "string" || !/^[a-f0-9]{24}$/.test(id) ||
            typeof code !== "string" || !/^[a-f0-9]{32}$/i.test(code.trim())) {
            throw invalid();
        }
        const challenge = await prisma.authChallenge.findUnique({ where: { id } });
        if (!challenge || challenge.purpose !== purpose ||
            (userId && challenge.userId !== userId) ||
            challenge.consumedAt || challenge.expiresAt <= new Date() ||
            challenge.failedAttempts >= challenge.maxAttempts) throw invalid();
        if (!crypto.timingSafeEqual(
            Buffer.from(hash(code.trim().toLowerCase()), "hex"),
            Buffer.from(challenge.codeHash, "hex")
        )) {
            await prisma.authChallenge.updateMany({
                where: { id, consumedAt: null, expiresAt: { gt: new Date() }, failedAttempts: { lt: challenge.maxAttempts } },
                data: { failedAttempts: { increment: 1 } },
            });
            throw invalid();
        }
        if (!challenge.userId) throw invalid();
        return challenge;
    }

    private async apply(challenge: AuthChallenge, change: { password: string } | { email: string }, sessionId?: string) {
        const details = metadata(challenge);
        if (!details || !challenge.userId) throw invalid();
        const userId = challenge.userId;
        try {
            await prisma.$transaction(async (tx) => {
                const user = await lockUser(tx, userId);
                if (!user || !matchesUser(user, details)) throw invalid();
                if ("password" in change && !user.emailVerifiedAt) throw invalid();
                const now = new Date();
                if (sessionId && !(await tx.session.findFirst({
                    where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: now } },
                }))) throw invalid();
                const used = await tx.authChallenge.updateMany({
                    where: {
                        id: challenge.id, purpose: challenge.purpose, userId,
                        consumedAt: null, expiresAt: { gt: now },
                        failedAttempts: { lt: challenge.maxAttempts },
                    },
                    data: { consumedAt: now },
                });
                if (used.count !== 1) throw invalid();
                await tx.user.update({
                    where: { id: userId },
                    data: "password" in change
                        ? { password: change.password, passwordChangedAt: now }
                        : { email: change.email, emailVerifiedAt: now },
                });
                await revokeCredentialSessions(tx, userId, now, challenge.purpose);
            });
        } catch (error) {
            if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
                throw invalid();
            }
            throw error;
        }
        audit.info("auth.credential_changed", { userId, purpose: challenge.purpose });
    }
}

// The queue contains only a challenge ID; code derivation happens in the worker.
export async function deliverCredentialChallenge(id: string, deliver: Delivery) {
    const challenge = await prisma.authChallenge.findUnique({ where: { id } });
    if (!challenge || !challenge.userId || challenge.consumedAt ||
        challenge.expiresAt <= new Date() ||
        !["email_change", "password_recovery"].includes(challenge.purpose)) return;
    const details = metadata(challenge);
    if (!details) return;
    const user = await prisma.user.findUnique({ where: { id: challenge.userId } });
    if (!user || !matchesUser(user, details) ||
        (challenge.purpose === "password_recovery" && !user.emailVerifiedAt)) return;
    const code = codeFor(challenge.id, challenge.purpose);
    if (hash(code) !== challenge.codeHash) return;
    const result = await deliver({
        email: details.targetEmail,
        code,
        purpose: challenge.purpose === "email_change" ? "Verify new Streamly email" : "Streamly password recovery",
        expiresInMinutes: Math.max(1, Math.ceil((challenge.expiresAt.getTime() - Date.now()) / 60_000)),
    });
    if (!result.delivered) throw new Error("Credential verification email was not delivered");
}
