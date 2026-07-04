"use client";

import { VideoCollectionPanel } from "@/components/library/video-collection-panel";
import { queryKeys } from "@/lib/api/query-keys";
import { watchHistoryApi } from "@/lib/api/watch-history.api";

export function HistoryPanel() {
  return (
    <VideoCollectionPanel
      description="Videos watched from your signed-in Streamly session."
      emptyDescription="Videos you watch will appear here after your backend account has watch history."
      emptyTitle="No watch history yet."
      eyebrow="History"
      queryFn={async () => {
        const response = await watchHistoryApi.listMine();
        return response.data;
      }}
      queryKey={queryKeys.history.list()}
      title="Watch history"
    />
  );
}
