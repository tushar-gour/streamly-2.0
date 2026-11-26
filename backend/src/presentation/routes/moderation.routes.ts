import { Router } from "express";
import type { Request, Response } from "express";
import { ModerationService } from "../../application/services/moderation.service.js";
import { ApiError, UnauthorizedError } from "../../shared/errors/api-error.js";
import { ApiResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/authorization.middleware.js";

const router = Router();
const service = new ModerationService();
router.use(verifyJWT, requirePermission("video:publish:any"));
router.get("/overview", asyncHandler(async (_req: Request, res: Response) => {
    res.json(ApiResponse.success(await service.overview()));
}));
router.get("/videos", asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new ApiError(400, "Invalid page");
    res.json(ApiResponse.success(await service.list(page)));
}));
router.patch("/videos/:videoId/hold", asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?._id) throw new UnauthorizedError();
    if (typeof req.params.videoId !== "string") throw new ApiError(400, "Invalid video");
    res.json(ApiResponse.success(await service.setHold(req.user._id, req.params.videoId, req.body?.held, req.body?.reason)));
}));
export default router;
