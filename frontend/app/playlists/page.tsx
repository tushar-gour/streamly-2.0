import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function PlaylistsPage() {
  return (
    <RouteEmptyState
      permission={{ authenticated: true }}
      eyebrow="Playlists"
      title="No playlists yet."
      description="Your playlists will appear here after real playlist data is connected."
    />
  );
}
