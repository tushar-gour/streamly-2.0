import { AppShell } from "@/components/layout/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video/video-card";
import { featuredVideos } from "@/lib/constants/sample-content";

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
              { label: "Trending", isActive: true },
              { label: "Tech" },
              { label: "Travel" },
              { label: "Music" },
            ]}
          />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
