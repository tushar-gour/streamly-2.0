CREATE TABLE "watch_later" (
    "userId" CHAR(24) NOT NULL,
    "videoId" CHAR(24) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watch_later_pkey" PRIMARY KEY ("userId", "videoId")
);

CREATE INDEX "watch_later_userId_createdAt_idx" ON "watch_later"("userId", "createdAt");
CREATE INDEX "watch_later_videoId_idx" ON "watch_later"("videoId");

ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_videoId_fkey"
    FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
