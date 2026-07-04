import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function SearchPage() {
  return (
    <RouteEmptyState
      eyebrow="Search"
      title="Search is ready for API data."
      description="Videos, creators, and playlists will appear after backend search results are connected."
    />
  );
}
