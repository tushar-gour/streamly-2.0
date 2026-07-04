import Link from "next/link";
import { Compass, Upload } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <EmptyState
          eyebrow="Home"
          title="No videos loaded yet."
          description="Your personalized feed will appear after real backend data is connected."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/explore">
                  <Compass size={16} />
                  Explore
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/studio/upload">
                  <Upload size={16} />
                  Upload
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    </AppShell>
  );
}
