import { Upload } from "lucide-react";

import { StatCard } from "@/components/cards/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function StudioPage() {
  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
              Creator Studio
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
              Your videos are moving.
            </h1>
          </div>
          <Button>
            <Upload size={16} />
            Upload video
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Views" value="24.8K" helper="This week" />
          <StatCard
            label="Watch time"
            value="1.2K h"
            helper="Up from last week"
          />
          <StatCard label="Subscribers" value="8.4K" helper="318 new" />
        </div>
        <div className="rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-6">
          <h2 className="text-xl font-semibold">Upload flow foundation</h2>
          <p className="mt-2 text-[color:var(--color-text-secondary)]">
            Select file, upload, processing, details, visibility, and publish
            steps are prepared as the next implementation phase.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
