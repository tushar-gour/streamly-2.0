import { Heart, MessageCircle, Share2 } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

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
              Video playback
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button disabled variant="secondary" size="sm">
                <Heart size={16} />
                Like
              </Button>
              <Button disabled variant="secondary" size="sm">
                <MessageCircle size={16} />
                Comment
              </Button>
              <Button disabled variant="secondary" size="sm">
                <Share2 size={16} />
                Share
              </Button>
            </div>
            <p className="mt-5 text-[color:var(--color-text-secondary)]">
              Metadata and actions become available after real video detail data
              is connected.
            </p>
          </div>
        </section>
        <aside className="grid content-start gap-5">
          <div className="rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-5">
            <EmptyState
              eyebrow="Up next"
              title="No recommendations."
              description="Related videos will appear after recommendation data is connected."
            />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
