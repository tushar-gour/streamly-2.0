CREATE TABLE "video_upload_attempts" (
    "id" CHAR(24) NOT NULL,
    "ownerId" CHAR(24) NOT NULL,
    "requestId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "error" VARCHAR(200),
    "videoId" CHAR(24),
    "videoKey" TEXT,
    "thumbnailKey" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "cleanedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "video_upload_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "video_upload_attempts_status_check" CHECK ("status" IN ('validating', 'storing', 'ready', 'failed'))
);
CREATE UNIQUE INDEX "video_upload_attempts_ownerId_requestId_key" ON "video_upload_attempts"("ownerId", "requestId");
CREATE UNIQUE INDEX "video_upload_attempts_videoId_key" ON "video_upload_attempts"("videoId");
CREATE INDEX "video_upload_attempts_ownerId_createdAt_idx" ON "video_upload_attempts"("ownerId", "createdAt");
CREATE INDEX "video_upload_attempts_status_expiresAt_idx" ON "video_upload_attempts"("status", "expiresAt");
ALTER TABLE "video_upload_attempts" ADD CONSTRAINT "video_upload_attempts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_upload_attempts" ADD CONSTRAINT "video_upload_attempts_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
