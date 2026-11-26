import { afterEach, describe, expect, it } from "vitest";

import { container } from "../../src/core/container/index.js";
import { AuthService } from "../../src/application/services/auth.service.js";
import {
    OtpService,
    hashValue,
} from "../../src/application/services/otp.service.js";
import { MfaService } from "../../src/application/services/mfa.service.js";
import { TokenService } from "../../src/application/services/token.service.js";
import { prisma } from "../../src/infrastructure/database/prisma/client.js";
import { PrismaSessionRepository } from "../../src/infrastructure/repositories/session.repository.js";
import { PrismaUserRepository } from "../../src/infrastructure/repositories/user.repository.js";
import { createId } from "../../src/shared/helpers/id-generator.js";
import { createTestUserData } from "../factories/user.factory.js";
import {
    assertSafeTestDatabase,
    canRunDatabaseTests,
} from "../helpers/test-database.js";

const databaseDescribe = canRunDatabaseTests() ? describe : describe.skip;

databaseDescribe("database authentication security", () => {
    const users = new PrismaUserRepository();
    const sessions = new PrismaSessionRepository();
    const tokens = new TokenService();
    const auth = new AuthService({
        userRepository: users,
        sessionRepository: sessions,
        tokenService: tokens,
    });
    const createdIds: string[] = [];

    async function createUser() {
        assertSafeTestDatabase();
        const user = await users.createUser(createTestUserData());
        createdIds.push(user._id);
        return user;
    }

    afterEach(async () => {
        assertSafeTestDatabase();
        await prisma.user.deleteMany({
            where: { id: { in: createdIds } },
        });
        createdIds.length = 0;
    });

    it("rejects access immediately after revocation", async () => {
        const user = await createUser();
        const session = await auth.createLoginSession({
            user,
            userAgent: undefined,
            ipAddress: undefined,
        });
        await expect(
            auth.verifyAccessToken(session.accessToken)
        ).resolves.toMatchObject({
            sessionId: session.sessionId,
        });
        await auth.revokeSession(session.sessionId);
        await expect(
            auth.verifyAccessToken(session.accessToken)
        ).rejects.toThrow("Invalid or expired session");
    });

    it("allows only one competing database refresh rotation", async () => {
        const user = await createUser();
        const session = await auth.createLoginSession({
            user,
            userAgent: undefined,
            ipAddress: undefined,
        });
        const results = await Promise.allSettled([
            auth.refreshSession(session.refreshToken),
            auth.refreshSession(session.refreshToken),
        ]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        const stored = await sessions.findSessionById(session.sessionId);
        expect(stored?.revokedAt).not.toBeNull();
    });

    it("does not accept the same OTP challenge twice", async () => {
        const user = await createUser();
        const id = createId();
        const code = "123456";
        const purpose = "signup_email_verification";
        await prisma.authChallenge.create({
            data: {
                id,
                userId: user._id,
                identifierHash: hashValue(user.email),
                channel: "email",
                purpose,
                codeHash: hashValue(code),
                expiresAt: new Date(Date.now() + 60_000),
            },
        });
        const otp = new OtpService();
        const input = { challengeId: id, code, purpose };
        const results = await Promise.allSettled([
            otp.verifyChallenge(input),
            otp.verifyChallenge(input),
        ]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    });

    it("rejects MFA challenge verification from a different device", async () => {
        const user = await createUser();
        const mfa = new MfaService();
        const challenge = await mfa.createChallenge(
            user._id,
            "email-password",
            { deviceId: "original-device", userAgent: "test-browser" }
        );
        await expect(
            mfa.verifyChallenge(challenge.id, "123456", {
                deviceId: "other-device",
                userAgent: "test-browser",
            })
        ).rejects.toThrow("Invalid MFA challenge");
        const stored = await prisma.mfaChallenge.findUnique({
            where: { id: challenge.id },
        });
        expect(stored?.consumedAt).toBeNull();
    });

    it("rejects unverified email replacement through account details", async () => {
        const user = await createUser();
        await users.markEmailVerified(user._id);
        await expect(
            container.services.userService.updateAccountDetails({
                userId: user._id,
                body: { email: "replacement@example.com" },
            })
        ).rejects.toThrow("verification");
        const stored = await users.findById(user._id);
        expect(stored.email).toBe(user.email);
        expect(stored.emailVerifiedAt).not.toBeNull();
    });

    it("revokes existing sessions after a password change", async () => {
        const user = await createUser();
        const session = await auth.createLoginSession({
            user,
            userAgent: undefined,
            ipAddress: undefined,
        });
        await container.services.userService.changePassword({
            userId: user._id,
            body: {
                oldPassword: "ValidPassword123!",
                newPassword: "UpdatedPassword123!",
            },
        });
        await expect(
            auth.verifyAccessToken(session.accessToken)
        ).rejects.toThrow("Invalid or expired session");
        await expect(
            auth.refreshSession(session.refreshToken)
        ).rejects.toThrow();
        const stored = await users.findByIdWithPassword(user._id);
        expect(await stored.isPasswordCorrect("UpdatedPassword123!")).toBe(
            true
        );
    });

    it("never treats an onboarding credential as an access token", async () => {
        const user = await createUser();
        const onboarding = tokens.generateOnboardingToken({
            id: user._id,
            email: user.email,
        });
        expect(() => tokens.verifyAccessToken(onboarding)).toThrow();
        expect(tokens.verifyOnboardingToken(onboarding)._id).toBe(user._id);
    });
});
