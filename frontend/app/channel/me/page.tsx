import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function CurrentChannelPage() {
  return (
    <RouteEmptyState
      eyebrow="Profile"
      title="Profile data unavailable."
      description="Your channel profile will appear here after authenticated profile data is connected."
      action={
        <Button asChild variant="secondary">
          <Link href="/settings">Open settings</Link>
        </Button>
      }
    />
  );
}
