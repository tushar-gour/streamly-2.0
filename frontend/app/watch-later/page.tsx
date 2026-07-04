import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function WatchLaterPage() {
  return (
    <RouteEmptyState
      eyebrow="Watch Later"
      title="No saved videos yet."
      description="Videos saved for later will appear here after real saved-video data is connected."
    />
  );
}
