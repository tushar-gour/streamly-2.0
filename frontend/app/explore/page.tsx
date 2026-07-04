import { AppShell } from "@/components/layout/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/feedback/empty-state";

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
        <div className="mt-16 grid place-items-center">
          <EmptyState
            eyebrow="Explore"
            title="Nothing to explore yet."
            description="Discoverable videos, channels, and playlists will appear after real API data is available."
          />
        </div>
      </section>
    </AppShell>
  );
}
