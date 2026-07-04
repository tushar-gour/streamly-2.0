import { AppShell } from "@/components/layout/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { VideoFeed } from "@/components/video/video-feed";

export default function ExplorePage() {
  return (
    <AppShell>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
          Explore
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
          Find what is moving now.
        </h1>
        <div className="mt-6">
          <Tabs
            items={[
              { label: "All", isActive: true },
              { label: "Videos" },
              { label: "Channels" },
              { label: "Playlists" },
            ]}
          />
        </div>
        <div className="mt-8">
          <VideoFeed
            emptyDescription="Public videos will appear here after backend content exists."
            emptyTitle="Nothing to explore yet."
            eyebrow="Explore"
            filters={{ limit: 16, sortBy: "views", sortType: "desc" }}
            title="Popular videos"
          />
        </div>
      </section>
    </AppShell>
  );
}
