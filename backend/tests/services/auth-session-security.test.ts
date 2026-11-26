import { describe, expect, it, vi } from "vitest";

import { AuthService } from "../../src/application/services/auth.service.js";
import { TokenService } from "../../src/application/services/token.service.js";

const user = {
    _id: "012345678901234567890123",
    username: "viewer",
    email: "viewer@example.com",
    onboardingStatus: "active",
};

function fixture() {
    const tokenService = new TokenService();
    const sessionId = tokenService.createSessionId();
    const refresh = tokenService.generateRefreshToken(user, sessionId);
    const session = {
        id: sessionId,
        refreshTokenHash: tokenService.hashToken(refresh),
    };
    const sessionRepository = {
        findValidSession: vi.fn(async (): Promise<typeof session | null> => ({ ...session })),
        rotateSessionToken: vi.fn(
            async ({
                expectedHash,
                nextHash,
            }: {
                expectedHash: string;
                nextHash: string;
            }) => {
                if (expectedHash !== session.refreshTokenHash) {
                    return { count: 0 };
                }
                session.refreshTokenHash = nextHash;
                return { count: 1 };
            }
        ),
        revokeSession: vi.fn(async () => ({ count: 1 })),
        revokeAllUserSessions: vi.fn(async () => ({ count: 1 })),
    };
    const userRepository = {
        findPublicById: vi.fn(async () => ({ ...user })),
    };
    const service = new AuthService({
        userRepository,
        sessionRepository,
        tokenService,
    });
    return {
        service,
        sessionRepository,
        userRepository,
        tokenService,
        sessionId,
        refresh,
    };
}

describe("authentication session security", () => {
    it("rejects a valid access token when its session is absent", async () => {
        const f = fixture();
        f.sessionRepository.findValidSession.mockImplementationOnce(
            async () => null
        );
        const token = f.tokenService.generateAccessToken(user, f.sessionId);
        await expect(f.service.verifyAccessToken(token)).rejects.toThrow(
            "Invalid or expired session"
        );
    });

    it("rejects an incomplete account even with a valid session", async () => {
        const f = fixture();
        f.userRepository.findPublicById.mockResolvedValueOnce({
            ...user,
            onboardingStatus: "mfa_pending",
        });
        const token = f.tokenService.generateAccessToken(user, f.sessionId);
        await expect(f.service.verifyAccessToken(token)).rejects.toThrow(
            "Invalid or inactive account"
        );
    });

    it("allows at most one refresh rotation for the same token", async () => {
        const f = fixture();
        const results = await Promise.allSettled([
            f.service.refreshSession(f.refresh),
            f.service.refreshSession(f.refresh),
        ]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(
            1
        );
        expect(f.sessionRepository.revokeSession).toHaveBeenCalledOnce();
    });

    it("rejects a replayed refresh token", async () => {
        const f = fixture();
        await f.service.refreshSession(f.refresh);
        await expect(f.service.refreshSession(f.refresh)).rejects.toThrow(
            "Refresh token has been revoked"
        );
        expect(
            f.sessionRepository.revokeAllUserSessions
        ).toHaveBeenCalledOnce();
    });
});
