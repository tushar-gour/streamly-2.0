ALTER TABLE "comments" ADD COLUMN "moderationHeld" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "comments_videoId_moderationHeld_createdAt_idx" ON "comments"("videoId", "moderationHeld", "createdAt");
