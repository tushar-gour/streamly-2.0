import Link from "next/link";
import { Upload } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function StudioPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
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
          <Button asChild>
            <Link href="/studio/upload">
              <Upload size={16} />
              Upload video
            </Link>
          </Button>
        </div>
        <div className="grid min-h-[420px] place-items-center rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-6">
          <EmptyState
            eyebrow="Studio"
            title="No creator metrics yet."
            description="Views, watch time, subscribers, and video performance will appear after real creator data is connected."
            action={
              <Button asChild variant="secondary">
                <Link href="/studio/upload">Upload video</Link>
              </Button>
            }
          />
        </div>
      </section>
    </AppShell>
  );
}
