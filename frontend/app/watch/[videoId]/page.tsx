import { Heart, MessageCircle, Share2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { featuredVideos } from "@/lib/constants/sample-content";

type WatchPageProps = Readonly<{
  params: Promise<{ videoId: string }>;
}>;

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <div className="aspect-video overflow-hidden rounded-hero border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#101522,#32205d_52%,#090d17)]">
            <video
              className="h-full w-full"
              controls
              preload="metadata"
              src={`/api/v1/videos/${videoId}/stream`}
            />
          </div>
          <div className="mt-5 rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-5">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Beyond the Horizon
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm">
                <Heart size={16} />
                Like
              </Button>
              <Button variant="secondary" size="sm">
                <MessageCircle size={16} />
                Comment
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 size={16} />
                Share
              </Button>
            </div>
            <p className="mt-5 text-[color:var(--color-text-secondary)]">
              This shell is wired for backend range streaming and keeps playback
              as the primary focus.
            </p>
          </div>
        </section>
        <aside className="grid content-start gap-5">
          {featuredVideos.map((video) => (
            <VideoCard key={video.id} video={video} variant="compact" />
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
