import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function WatchLaterPage() {
  return (
    <RouteEmptyState
      permission={{ authenticated: true }}
      eyebrow="Watch Later"
      title="Watch Later is not available yet."
      description="Use playlists to organize videos you want to revisit."
    />
  );
}
