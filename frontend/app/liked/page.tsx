import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function LikedVideosPage() {
  return (
    <RouteEmptyState
      eyebrow="Liked Videos"
      title="No liked videos yet."
      description="Videos you like will appear here after real like data is connected."
    />
  );
}
