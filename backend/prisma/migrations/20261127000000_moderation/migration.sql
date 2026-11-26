ALTER TABLE "videos" ADD COLUMN "moderationHeld" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "videos" ADD CONSTRAINT "videos_moderation_visibility_check" CHECK (NOT "moderationHeld" OR NOT "isPublished");
CREATE TABLE "moderation_actions" (
    "id" CHAR(24) NOT NULL,
    "actorId" CHAR(24) NOT NULL,
    "resourceId" CHAR(24) NOT NULL,
    "action" VARCHAR(40) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "moderation_actions_resourceId_createdAt_idx" ON "moderation_actions"("resourceId", "createdAt");
CREATE INDEX "moderation_actions_actorId_createdAt_idx" ON "moderation_actions"("actorId", "createdAt");
