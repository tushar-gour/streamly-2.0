import crypto from "node:crypto";
import bcrypt from "bcrypt";
import type { Prisma, User } from "@prisma/client";

import { appConfig } from "../../config/env.js";
import { prisma } from "../../infrastructure/database/prisma/client.js";
import { revokeCredentialSessions } from "../../infrastructure/database/credential-revocation.js";
import { audit } from "../../infrastructure/logger/audit-logger.js";
import { ApiError } from "../../shared/errors/api-error.js";
import { createId } from "../../shared/helpers/id-generator.js";
import { hashValue } from "./otp.service.js";

type Channel = "sms" | "whatsapp";
type Deliver = (input: {
    phoneNumber: string;
    channel: Channel;
    code: string;
    userId: string;
}) => Promise<void>;

const purpose = "phone_enrollment";
const invalid = () => new ApiError(400, "Invalid or expired phone challenge");
const digest = (id: string, code: string) =>
    crypto
        .createHmac("sha256", appConfig.jwt.refreshTokenSecret)
        .update("streamly-phone-v1:" + id + ":" + code)
        .digest("hex");

function normalizePhone(value: unknown) {
    if (typeof value !== "string" || value.length > 40)
        throw new ApiError(400, "Enter an international phone number");
    const normalized = value.trim().replace(/[ ()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalized))
        throw new ApiError(400, "Enter an international phone number");
    return normalized;
}

function snapshot(user: User) {
    return {
        email: user.email,
        passwordChangedAt: user.passwordChangedAt?.toISOString() ?? null,
        mfaEnabledAt: user.mfaEnabledAt?.toISOString() ?? null,
        phoneNumber: user.phoneNumber,
        phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
    };
}

async function lockAccount(
    tx: Prisma.TransactionClient,
    userId: string,
    sessionId: string
) {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId } });
    await tx.$queryRaw`SELECT id FROM sessions WHERE id = ${sessionId} AND "userId" = ${userId} FOR UPDATE`;
    const session = await tx.session.findFirst({
        where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!user || user.onboardingStatus !== "active" || !session) throw invalid();
    return user;
}

export class PhoneEnrollmentService {
    constructor(
        private readonly deliver: Deliver,
        private readonly verifyMfa: (userId: string, code: string) => Promise<void>
    ) {}

    async start(
        userId: string,
        sessionId: string,
        input: { phoneNumber?: unknown; channel?: unknown; password?: unknown; mfaCode?: unknown }
    ) {
        const phoneNumber = normalizePhone(input.phoneNumber);
        const channel = input.channel;
        if (channel !== "sms" && channel !== "whatsapp")
            throw new ApiError(400, "Invalid phone verification channel");
        const password = input.password;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (
            !user ||
            user.onboardingStatus !== "active" ||
            typeof password !== "string" ||
            Buffer.byteLength(password, "utf8") > 72 ||
            !(await bcrypt.compare(password, user.password))
        ) {
            throw new ApiError(403, "Current credentials could not be verified");
        }
        if (user.phoneNumber === phoneNumber && user.phoneVerifiedAt)
            throw new ApiError(400, "This phone number is already verified");
        if (user.mfaEnabledAt) {
            if (typeof input.mfaCode !== "string")
                throw new ApiError(400, "Authenticator code required");
            await this.verifyMfa(userId, input.mfaCode);
        }
        const id = createId();
        const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
        const challenge = await prisma.$transaction(async (tx) => {
            const current = await lockAccount(tx, userId, sessionId);
            if (current.password !== user.password ||
                JSON.stringify(snapshot(current)) !== JSON.stringify(snapshot(user)))
                throw invalid();
            const recent = await tx.authChallenge.count({
                where: { userId, purpose, createdAt: { gt: new Date(Date.now() - 60_000) } },
            });
            if (recent) throw new ApiError(429, "Wait before requesting another phone code");
            await tx.authChallenge.updateMany({
                where: { userId, purpose, consumedAt: null },
                data: { consumedAt: new Date() },
            });
            return tx.authChallenge.create({
                data: {
                    id, userId, channel, purpose,
                    identifierHash: hashValue(phoneNumber),
                    codeHash: digest(id, code),
                    expiresAt: new Date(Date.now() + 5 * 60_000),
                    maxAttempts: 5,
                    metadataJson: { ...snapshot(current), sessionId, targetPhone: phoneNumber },
                },
            });
        });
        try {
            await this.deliver({ phoneNumber, channel, code, userId });
        } catch {
            await prisma.authChallenge.updateMany({
                where: { id, consumedAt: null },
                data: { consumedAt: new Date() },
            });
            throw new ApiError(503, "Phone verification delivery is unavailable");
        }
        return { challengeId: id, channel, purpose, expiresAt: challenge.expiresAt };
    }

    async verify(
        userId: string,
        sessionId: string,
        input: { challengeId?: unknown; code?: unknown; channel?: unknown }
    ) {
        const { challengeId, code, channel } = input;
        if (typeof challengeId !== "string" || !/^[a-f0-9]{24}$/.test(challengeId) ||
            typeof code !== "string" || !/^\d{6}$/.test(code) ||
            (channel !== "sms" && channel !== "whatsapp")) throw invalid();
        try {
            const verified = await prisma.$transaction(async (tx) => {
                const user = await lockAccount(tx, userId, sessionId);
                const challenge = await tx.authChallenge.findFirst({
                    where: { id: challengeId, userId, purpose, channel, consumedAt: null, expiresAt: { gt: new Date() } },
                });
                if (!challenge || challenge.failedAttempts >= challenge.maxAttempts) throw invalid();
                const details = challenge.metadataJson;
                if (!details || typeof details !== "object" || Array.isArray(details) ||
                    details.sessionId !== sessionId || typeof details.targetPhone !== "string" ||
                    hashValue(details.targetPhone) !== challenge.identifierHash ||
                    Object.entries(snapshot(user)).some(([key, value]) => details[key] !== value))
                    throw invalid();
                const now = new Date();
                const available = {
                    id: challenge.id, userId, purpose, channel,
                    consumedAt: null, expiresAt: { gt: now },
                    failedAttempts: { lt: challenge.maxAttempts },
                };
                if (!crypto.timingSafeEqual(Buffer.from(digest(challenge.id, code), "hex"), Buffer.from(challenge.codeHash, "hex"))) {
                    await tx.authChallenge.updateMany({ where: available, data: { failedAttempts: { increment: 1 } } });
                    return false;
                }
                const consumed = await tx.authChallenge.updateMany({
                    where: available, data: { consumedAt: now },
                });
                if (consumed.count !== 1) throw invalid();
                await tx.user.update({
                    where: { id: userId },
                    data: { phoneNumber: details.targetPhone, phoneVerifiedAt: now },
                });
                await revokeCredentialSessions(tx, userId, now, purpose);
                return true;
            });
            if (!verified) throw invalid();
        } catch (error) {
            if (error && typeof error === "object" && "code" in error && error.code === "P2002")
                throw invalid();
            throw error;
        }
        audit.info("auth.credential_changed", { userId, purpose });
    }
}
