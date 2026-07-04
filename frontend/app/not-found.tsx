import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] items-center justify-center">
        <EmptyState
          eyebrow="404"
          title="This path drifted out of frame."
          description="The route is missing, moved, or not ready yet."
          action={
            <Button asChild>
              <Link href="/home">Go home</Link>
            </Button>
          }
        />
      </div>
    </AppShell>
  );
}
