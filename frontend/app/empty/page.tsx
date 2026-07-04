import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function EmptyPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <EmptyState
        title="Your feed is ready to learn."
        description="Start exploring and Streamly will shape itself around what moves you."
        action={
          <Button asChild>
            <Link href="/explore">Explore</Link>
          </Button>
        }
      />
    </main>
  );
}
