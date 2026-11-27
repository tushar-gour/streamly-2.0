import { Router } from "express";
import type { Request, Response } from "express";
import { container } from "../../core/container/index.js";
import { appConfig } from "../../config/env.js";
import { ApiError, UnauthorizedError } from "../../shared/errors/api-error.js";
import { ApiResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/security.middleware.js";

const router = Router();
const service = container.services.mfaService;
router.use(verifyJWT, authRateLimiter);
function userId(req: Request) {
    if (!req.user?._id) throw new UnauthorizedError();
    if (!appConfig.mfa.enabled)
        throw new ApiError(503, "Authenticator management is unavailable");
    return req.user._id;
}
router.post(
    "/setup",
    asyncHandler(async (req: Request, res: Response) => {
        const user = await service.authorizeManagement(
            userId(req),
            req.body?.password
        );
        res.json(
            ApiResponse.success(await service.setupTotp(user.id, user.email))
        );
    })
);
router.post(
    "/verify",
    asyncHandler(async (req: Request, res: Response) => {
        const user = await service.authorizeManagement(
            userId(req),
            req.body?.password
        );
        if (typeof req.body?.code !== "string")
            throw new ApiError(400, "Authenticator code required");
        res.json(
            ApiResponse.success(
                await service.verifyTotpSetup(
                    user.id,
                    req.body.code,
                    true,
                    user.credentialVersion
                )
            )
        );
    })
);
router.post(
    "/recovery/regenerate",
    asyncHandler(async (req: Request, res: Response) => {
        res.json(
            ApiResponse.success(
                await service.regenerateRecoveryCodes(
                    userId(req),
                    req.body?.password,
                    req.body?.code
                )
            )
        );
    })
);
export default router;
