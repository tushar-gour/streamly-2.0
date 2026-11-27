import { afterEach, describe, expect, it } from "vitest";

import { PhoneEnrollmentService } from "../../src/application/services/phone-enrollment.service.js";
import { container } from "../../src/core/container/index.js";
import { prisma } from "../../src/infrastructure/database/prisma/client.js";
import { createTestUserData } from "../factories/user.factory.js";
import {
    assertSafeTestDatabase,
    canRunDatabaseTests,
} from "../helpers/test-database.js";

const databaseDescribe = canRunDatabaseTests() ? describe : describe.skip;

databaseDescribe("secure phone enrollment", () => {
    const ids: string[] = [];
    const codes = new Map<string, string>();
    const auth = container.services.authService;
    const service = new PhoneEnrollmentService(
        async ({ phoneNumber, code }) => {
            codes.set(phoneNumber, code);
        },
        async () => {
            throw new Error("MFA proof rejected");
        }
    );

    async function account(phoneNumber?: string) {
        assertSafeTestDatabase();
        const user = await container.repositories.userRepository.createUser(
            createTestUserData()
        );
        ids.push(user._id);
        if (phoneNumber) {
            await prisma.user.update({
                where: { id: user._id },
                data: { phoneNumber, phoneVerifiedAt: new Date() },
            });
        }
        const session = await auth.createLoginSession({
            user,
            userAgent: undefined,
            ipAddress: undefined,
        });
        return { id: user._id, ...session };
    }

    const target = "+12025550123";
    const startInput = {
        phoneNumber: "+1 (202) 555-0123",
        password: "ValidPassword123!",
        channel: "sms",
    };

    afterEach(async () => {
        assertSafeTestDatabase();
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
        ids.length = 0;
        codes.clear();
    });

    it("preserves the old phone and revokes sessions only after successful verification", async () => {
        const user = await account("+12025550124");
        const before = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        await expect(service.start(user.id, user.sessionId, {
            ...startInput, password: "invalid-password",
        })).rejects.toThrow("Current credentials");
        const challenge = await service.start(user.id, user.sessionId, startInput);
        const pending = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        expect(pending.phoneNumber).toBe(before.phoneNumber);
        expect(pending.phoneVerifiedAt).toEqual(before.phoneVerifiedAt);
        const code = codes.get(target);
        expect(code).toMatch(/^\d{6}$/);
        const result = { challengeId: challenge.challengeId, code, channel: "sms" };
        const other = await account();
        await expect(service.verify(other.id, other.sessionId, result)).rejects.toThrow("Invalid or expired");
        await expect(service.verify(user.id, other.sessionId, result)).rejects.toThrow("Invalid or expired");
        await expect(service.verify(user.id, user.sessionId, { ...result, channel: "whatsapp" })).rejects.toThrow("Invalid or expired");
        await expect(auth.verifyAccessToken(user.accessToken)).resolves.toBeDefined();
        const attempts = await Promise.allSettled([
            service.verify(user.id, user.sessionId, result),
            service.verify(user.id, user.sessionId, result),
        ]);
        expect(attempts.filter((item) => item.status === "fulfilled")).toHaveLength(1);
        const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        expect(stored.phoneNumber).toBe(target);
        expect(stored.phoneVerifiedAt).not.toBeNull();
        await expect(auth.verifyAccessToken(user.accessToken)).rejects.toThrow();
        await expect(auth.refreshSession(user.refreshToken)).rejects.toThrow();
        await expect(service.verify(user.id, user.sessionId, result)).rejects.toThrow();
        await expect(auth.verifyAccessToken(other.accessToken)).resolves.toBeDefined();
    });

    it("serializes concurrent starts and limits verification attempts", async () => {
        const user = await account();
        const starts = await Promise.allSettled([
            service.start(user.id, user.sessionId, startInput),
            service.start(user.id, user.sessionId, { ...startInput, phoneNumber: "+12025550125" }),
        ]);
        expect(starts.filter((item) => item.status === "fulfilled")).toHaveLength(1);
        const success = starts.find((item) => item.status === "fulfilled");
        if (!success) throw new Error("No enrollment challenge");
        const actual = [...codes.values()][0];
        const wrong = actual === "000000" ? "111111" : "000000";
        const result = { challengeId: success.value.challengeId, channel: "sms", code: wrong };
        for (let i = 0; i < 5; i += 1) {
            await expect(service.verify(user.id, user.sessionId, result)).rejects.toThrow();
        }
        await expect(service.verify(user.id, user.sessionId, { ...result, code: actual })).rejects.toThrow();
        const challenge = await prisma.authChallenge.findUniqueOrThrow({ where: { id: result.challengeId } });
        expect(challenge.failedAttempts).toBe(5);
        expect(challenge.consumedAt).toBeNull();
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).phoneNumber).toBeNull();
    });

    it("rejects expired codes and preserves uniqueness without consuming the challenge", async () => {
        const owner = await account(target);
        const user = await account("+12025550124");
        const challenge = await service.start(user.id, user.sessionId, startInput);
        const result = { challengeId: challenge.challengeId, code: codes.get(target), channel: "sms" };
        await expect(service.verify(user.id, user.sessionId, result)).rejects.toThrow();
        const pending = await prisma.authChallenge.findUniqueOrThrow({ where: { id: challenge.challengeId } });
        expect(pending.consumedAt).toBeNull();
        await prisma.authChallenge.update({ where: { id: challenge.challengeId }, data: { expiresAt: new Date(0) } });
        await expect(service.verify(user.id, user.sessionId, result)).rejects.toThrow();
        expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).phoneNumber).toBe("+12025550124");
        expect((await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).phoneNumber).toBe(target);
    });

    it("requires current MFA proof for an enrolled account", async () => {
        const user = await account();
        await prisma.user.update({ where: { id: user.id }, data: { mfaEnabledAt: new Date() } });
        await expect(service.start(user.id, user.sessionId, startInput)).rejects.toThrow("Authenticator code required");
        await expect(service.start(user.id, user.sessionId, { ...startInput, mfaCode: "123456" })).rejects.toThrow("MFA proof rejected");
        expect(codes.size).toBe(0);
    });
});
