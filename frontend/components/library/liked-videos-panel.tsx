"use client";

import { VideoCollectionPanel } from "@/components/library/video-collection-panel";
import { likesApi } from "@/lib/api/likes.api";
import { queryKeys } from "@/lib/api/query-keys";
import type { VideoListItem } from "@/lib/api/videos.api";

function extractLikedVideos(
  payload: Awaited<ReturnType<typeof likesApi.listVideos>>["data"]
) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.likedVideos ?? [];
}

export function LikedVideosPanel() {
  return (
    <VideoCollectionPanel
      description="Videos liked from your signed-in Streamly account."
      emptyDescription="Videos you like will appear here after you like real backend videos."
      emptyTitle="No liked videos yet."
      eyebrow="Liked Videos"
      queryFn={async (): Promise<VideoListItem[]> => {
        const response = await likesApi.listVideos();
        return extractLikedVideos(response.data);
      }}
      queryKey={queryKeys.likes.videos()}
      title="Liked videos"
    />
  );
}
