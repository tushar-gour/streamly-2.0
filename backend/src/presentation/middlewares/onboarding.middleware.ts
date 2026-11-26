import type { NextFunction, Request, Response } from "express";

import { container } from "../../core/container/index.js";
import { UnauthorizedError } from "../../shared/errors/api-error.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";

export const verifyOnboarding = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
        throw new UnauthorizedError("Onboarding credential is required");
    }
    req.user = await container.services.authPlatformService.verifyOnboardingCredential(
        authorization.slice(7)
    );
    next();
});
