"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <EmptyState
        title="Something went wrong."
        description="Streamly could not load this page. Try again."
        action={<Button onClick={reset}>Retry</Button>}
      />
    </main>
  );
}
