import { Router } from "express";
import type { Request, Response } from "express";

import { container } from "../../core/container/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";
import { ApiResponse } from "../../shared/responses/api-response.js";
import { UnauthorizedError } from "../../shared/errors/api-error.js";

const router = Router();
const service = container.services.watchLaterService;

function userId(req: Request) {
    if (!req.user?._id) throw new UnauthorizedError();
    return req.user._id;
}

router.use(verifyJWT);
router.get("/", asyncHandler(async (req: Request, res: Response) => {
    const result = await service.list(userId(req), req.query.page, req.query.limit);
    res.json(ApiResponse.paginated(result.data, result.pagination, "Saved videos"));
}));
router.get("/:videoId", asyncHandler(async (req: Request, res: Response) => {
    res.json(ApiResponse.success(await service.status(userId(req), String(req.params.videoId))));
}));
router.put("/:videoId", asyncHandler(async (req: Request, res: Response) => {
    await service.save(userId(req), String(req.params.videoId));
    res.json(ApiResponse.success({}, "Video saved"));
}));
router.delete("/:videoId", asyncHandler(async (req: Request, res: Response) => {
    await service.remove(userId(req), String(req.params.videoId));
    res.json(ApiResponse.success({}, "Video removed"));
}));

export default router;
