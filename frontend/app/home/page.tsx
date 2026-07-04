import { Play, Plus, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { featuredVideos } from "@/lib/constants/sample-content";

export default function HomePage() {
  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <div className="rounded-hero border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#111521,#36246b_45%,#101522)] p-8 shadow-glow">
            <span className="text-sm font-medium uppercase tracking-[0.22em] text-periwinkle">
              Featured
            </span>
            <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-tight">
              Beyond the Horizon
            </h1>
            <p className="mt-3 max-w-md text-[color:var(--color-text-secondary)]">
              A breathtaking journey across landscapes that challenge reality.
            </p>
            <div className="mt-6 flex gap-3">
              <Button>
                <Play size={16} />
                Watch now
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Save featured video"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <Tabs
              items={[
                { label: "For You", isActive: true },
                { label: "All" },
                { label: "Music" },
                { label: "Gaming" },
                { label: "Tech" },
                { label: "Travel" },
              ]}
            />
          </div>
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles size={20} className="text-periwinkle" />
              For You
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {featuredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        </section>
        <aside className="grid content-start gap-5">
          <Panel title="Shorts" />
          <Panel title="Latest from subscriptions" />
          <div className="rounded-card border border-[rgba(141,132,255,0.32)] bg-[linear-gradient(135deg,rgba(108,92,231,0.22),rgba(24,29,43,0.8))] p-6">
            <h3 className="text-2xl font-semibold">Go Premium</h3>
            <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
              Unlock ad-free streaming, exclusive content, and downloads.
            </p>
            <Button className="mt-5">Start free trial</Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Panel({ title }: Readonly<{ title: string }>) {
  return (
    <section className="rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 grid gap-3">
        {featuredVideos.slice(0, 3).map((video) => (
          <VideoCard
            key={`${title}-${video.id}`}
            video={video}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
}
