import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../infrastructure/database/prisma/client.js";
import { ApiResponse } from "../../shared/responses/api-response.js";
import { ApiError, UnauthorizedError } from "../../shared/errors/api-error.js";
import { asyncHandler } from "../../shared/helpers/async-handler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
function userId(req: Request) {
    if (!req.user?._id) throw new UnauthorizedError();
    return req.user._id;
}

router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        const id = userId(req);
        const page = Number(req.query.page ?? 1);
        if (!Number.isInteger(page) || page < 1 || page > 10000)
            throw new ApiError(400, "Invalid page");
        const [items, unread] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: id },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                take: 25,
                skip: (page - 1) * 25,
                select: {
                    id: true,
                    kind: true,
                    message: true,
                    readAt: true,
                    createdAt: true,
                },
            }),
            prisma.notification.count({ where: { userId: id, readAt: null } }),
        ]);
        res.json(ApiResponse.success({ items, unread }));
    })
);
router.patch(
    "/read-all",
    asyncHandler(async (req: Request, res: Response) => {
        await prisma.notification.updateMany({
            where: { userId: userId(req), readAt: null },
            data: { readAt: new Date() },
        });
        res.json(ApiResponse.success({}));
    })
);
router.patch(
    "/:notificationId/read",
    asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.notificationId;
        if (typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id))
            throw new ApiError(400, "Invalid notification");
        const updated = await prisma.notification.updateMany({
            where: { id, userId: userId(req) },
            data: { readAt: new Date() },
        });
        if (updated.count !== 1)
            throw new ApiError(404, "Notification not found");
        res.json(ApiResponse.success({}));
    })
);
export default router;
