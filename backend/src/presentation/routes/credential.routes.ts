import { Router } from "express";
import type { Request, Response } from "express";
import { container } from "../../core/container/index.js";
import { appConfig } from "../../config/env.js";
import { ApiError, UnauthorizedError } from "../../shared/errors/api-error.js";
import { ApiResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";
import { authRateLimiter } from "../middlewares/security.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
const service = container.services.credentialChallengeService;
function requireDelivery() {
    if (
        !appConfig.email.enabled ||
        appConfig.email.provider !== "sendgrid" ||
        !appConfig.jobs.enabled ||
        !appConfig.jobs.emailQueueEnabled ||
        !appConfig.redis.enabled
    ) {
        throw new ApiError(503, "Credential email delivery is unavailable");
    }
}
function identity(req: Request) {
    if (!req.user?._id || !req.auth?.sessionId) throw new UnauthorizedError();
    return { userId: req.user._id, sessionId: req.auth.sessionId };
}
function clearCookies(res: Response) {
    const { secure, httpOnly, sameSite } =
        container.services.authService.getCookieOptions();
    const options = {
        secure,
        httpOnly,
        sameSite: sameSite === "strict" ? "strict" as const : sameSite === "none" ? "none" as const : "lax" as const,
    };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
    res.clearCookie(appConfig.mfa.trustCookieName, options);
}

router.post(
    "/recovery/start",
    authRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
        requireDelivery();
        const challenge = await service.startRecovery(req.body?.email);
        res.json(
            ApiResponse.success(
                challenge,
                "If the account is eligible, a verification code will be sent."
            )
        );
    })
);
router.post(
    "/recovery/complete",
    authRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
        await service.completeRecovery(req.body ?? {});
        clearCookies(res);
        res.json(ApiResponse.success({}, "Password reset. Sign in again."));
    })
);
router.post(
    "/email-change/start",
    verifyJWT,
    authRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
        requireDelivery();
        const { userId, sessionId } = identity(req);
        const challenge = await service.startEmailChange(
            userId,
            sessionId,
            req.body ?? {}
        );
        res.json(
            ApiResponse.success(
                challenge,
                "Verification code sent to the requested address."
            )
        );
    })
);
router.post(
    "/email-change/complete",
    verifyJWT,
    authRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
        const { userId, sessionId } = identity(req);
        await service.completeEmailChange(userId, sessionId, req.body ?? {});
        clearCookies(res);
        res.json(
            ApiResponse.success(
                {},
                "Email verified and updated. Sign in again."
            )
        );
    })
);
export default router;
