import Link from "next/link";
import { Upload } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StudioOverview } from "@/components/studio/studio-overview";
import { Button } from "@/components/ui/button";

export default function StudioPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <section className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-periwinkle">Creator Studio</p>
            <h1 className="mt-2 text-3xl font-semibold">Channel overview</h1>
          </div>
          <Button asChild>
            <Link href="/studio/upload">
              <Upload size={16} />
              Upload video
            </Link>
          </Button>
        </div>
        <StudioOverview />
      </section>
    </AppShell>
  );
}
