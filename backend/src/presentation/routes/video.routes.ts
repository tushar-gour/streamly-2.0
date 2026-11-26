// @ts-nocheck
import { Router } from "express";

import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";
import {
    requireOwnershipOrPermission,
    requirePermission,
} from "../middlewares/authorization.middleware.js";
import { uploadImage, uploadVideoAndThumbnail } from "../middlewares/multer.middleware.js";
import { validateStagedMedia } from "../middlewares/validate-media.middleware.js";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    streamVideo,
    streamThumbnail,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(getAllVideos);

router.route("/:videoId").get(optionalAuth, getVideoById);
router.route("/:videoId/stream").get(optionalAuth, streamVideo);
router.route("/:videoId/thumbnail").get(optionalAuth, streamThumbnail);

router.route("/").post(
    verifyJWT,
    requirePermission("video:create"),
    uploadVideoAndThumbnail.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    validateStagedMedia,
    publishAVideo
);

router.route("/:videoId").patch(
    verifyJWT,
    requireOwnershipOrPermission({
        policy: "canUpdateVideo",
        ownPermission: "video:update:own",
        anyPermission: "video:update:any",
    }),
    uploadImage.single("thumbnail"),
    validateStagedMedia,
    updateVideo
);

router.route("/:videoId").delete(
    verifyJWT,
    requireOwnershipOrPermission({
        policy: "canDeleteVideo",
        ownPermission: "video:delete:own",
        anyPermission: "video:delete:any",
    }),
    deleteVideo
);

router.route("/toggle/publish/:videoId").patch(
    verifyJWT,
    requireOwnershipOrPermission({
        policy: "canToggleVideoPublish",
        ownPermission: "video:publish:own",
        anyPermission: "video:publish:any",
    }),
    togglePublishStatus
);

export default router;
