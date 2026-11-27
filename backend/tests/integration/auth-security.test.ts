import { afterEach, describe, expect, it } from "vitest";

import { container } from "../../src/core/container/index.js";
import {
    CredentialChallengeService,
    deliverCredentialChallenge,
} from "../../src/application/services/credential-challenge.service.js";
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
    const queued: string[] = [];
    const credentials = new CredentialChallengeService(
        async (id) => {
            queued.push(id);
        },
        async () => {
            throw new Error("MFA verification required");
        }
    );
    async function deliveredCode(id: string) {
        let code = "";
        await deliverCredentialChallenge(id, async (message) => {
            code = message.code;
            return { delivered: true };
        });
        return code;
    }

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
        await prisma.authChallenge.deleteMany({
            where: { id: { in: queued } },
        });
        queued.length = 0;
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

    it("requires verified email recovery, consumes codes once and revokes sessions", async () => {
        const user = await createUser();
        await users.markEmailVerified(user._id);
        const session = await auth.createLoginSession({
            user,
            userAgent: undefined,
            ipAddress: undefined,
        });
        const unknown = await credentials.startRecovery(
            `${createId()}@example.com`
        );
        expect(Object.keys(unknown)).toEqual(["challengeId"]);
        expect(await deliveredCode(unknown.challengeId)).toBe("");
        const challenge = await credentials.startRecovery(user.email);
        expect(Object.keys(challenge)).toEqual(Object.keys(unknown));
        expect(await credentials.startRecovery(user.email)).toEqual(challenge);
        const code = await deliveredCode(challenge.challengeId);
        expect(code).toMatch(/^[a-f0-9]{32}$/);
        const wrong = code === "0".repeat(32) ? "1".repeat(32) : "0".repeat(32);
        await expect(
            credentials.completeRecovery({
                ...challenge,
                code: wrong,
                password: "NewPassword123!",
            })
        ).rejects.toThrow("Invalid or expired");
        const attempts = await prisma.authChallenge.findUniqueOrThrow({
            where: { id: challenge.challengeId },
        });
        expect(attempts.failedAttempts).toBe(1);
        const input = { ...challenge, code, password: "NewPassword123!" };
        const results = await Promise.allSettled([
            credentials.completeRecovery(input),
            credentials.completeRecovery(input),
        ]);
        expect(
            results.filter((result) => result.status === "fulfilled")
        ).toHaveLength(1);
        await expect(
            auth.verifyAccessToken(session.accessToken)
        ).rejects.toThrow();
        await expect(
            auth.refreshSession(session.refreshToken)
        ).rejects.toThrow();
        const stored = await users.findByIdWithPassword(user._id);
        expect(await stored.isPasswordCorrect(input.password)).toBe(true);
        expect(await stored.isPasswordCorrect("ValidPassword123!")).toBe(false);
    });

    it("binds email change to the reauthenticated account and session", async () => {
        const user = await createUser();
        const other = await createUser();
        const session = await auth.createLoginSession({
            user,
            userAgent: undefined,
            ipAddress: undefined,
        });
        const otherSession = await auth.createLoginSession({
            user: other,
            userAgent: undefined,
            ipAddress: undefined,
        });
        const target = `${createId()}@example.com`;
        await expect(
            credentials.startEmailChange(user._id, session.sessionId, {
                email: target,
                password: "wrong-password",
            })
        ).rejects.toThrow("Current credentials");
        const challenge = await credentials.startEmailChange(
            user._id,
            session.sessionId,
            { email: target, password: "ValidPassword123!" }
        );
        const code = await deliveredCode(challenge.challengeId);
        expect((await users.findById(user._id)).email).toBe(user.email);
        await expect(
            credentials.completeEmailChange(other._id, otherSession.sessionId, {
                ...challenge,
                code,
            })
        ).rejects.toThrow("Invalid or expired");
        await expect(
            credentials.completeEmailChange(user._id, otherSession.sessionId, {
                ...challenge,
                code,
            })
        ).rejects.toThrow("Invalid or expired");
        await credentials.completeEmailChange(user._id, session.sessionId, {
            ...challenge,
            code,
        });
        expect((await users.findById(user._id)).email).toBe(target);
        expect((await users.findById(user._id)).emailVerifiedAt).not.toBeNull();
        await expect(
            auth.verifyAccessToken(session.accessToken)
        ).rejects.toThrow();
        await expect(
            credentials.completeEmailChange(user._id, session.sessionId, {
                ...challenge,
                code,
            })
        ).rejects.toThrow("Invalid or expired");
        await expect(
            auth.verifyAccessToken(otherSession.accessToken)
        ).resolves.toBeDefined();
    });

    it("rejects expired recovery codes", async () => {
        const user = await createUser();
        await users.markEmailVerified(user._id);
        const challenge = await credentials.startRecovery(user.email);
        const code = await deliveredCode(challenge.challengeId);
        await prisma.authChallenge.update({
            where: { id: challenge.challengeId },
            data: { expiresAt: new Date(0) },
        });
        await expect(
            credentials.completeRecovery({
                ...challenge,
                code,
                password: "NewPassword123!",
            })
        ).rejects.toThrow("Invalid or expired");
    });

    it("rejects a session issued from a stale credential proof", async () => {
        const user = await createUser();
        await container.services.userService.changePassword({
            userId: user._id,
            body: {
                oldPassword: "ValidPassword123!",
                newPassword: "UpdatedPassword123!",
            },
        });
        await expect(
            auth.createLoginSession({
                user,
                userAgent: undefined,
                ipAddress: undefined,
            })
        ).rejects.toThrow("Credentials changed");
        const current = await users.findPublicById(user._id);
        await expect(
            auth.createLoginSession({
                user: current,
                userAgent: undefined,
                ipAddress: undefined,
            })
        ).resolves.toHaveProperty("accessToken");
    });

    it("does not issue an MFA challenge after the primary credential has changed", async () => {
        const user = await createUser();
        await container.services.userService.changePassword({
            userId: user._id,
            body: {
                oldPassword: "ValidPassword123!",
                newPassword: "UpdatedPassword123!",
            },
        });
        const mfa = new MfaService();
        await expect(
            mfa.createChallenge(
                user._id,
                "email-password",
                { deviceId: "test" },
                user.credentialVersion
            )
        ).rejects.toThrow("Credentials changed");
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
