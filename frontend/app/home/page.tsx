import { VideoFeed } from "@/components/video/video-feed";
import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <VideoFeed
        description="Latest published videos from the Streamly backend."
        emptyDescription="Published videos will appear here after creators upload content."
        emptyTitle="No videos available yet."
        eyebrow="Home"
        filters={{ limit: 12, sortBy: "createdAt", sortType: "desc" }}
        title="Latest videos"
      />
    </AppShell>
  );
}
