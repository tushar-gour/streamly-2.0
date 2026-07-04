import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function SubscriptionsPage() {
  return (
    <RouteEmptyState
      eyebrow="Subscriptions"
      title="No subscriptions yet."
      description="Channels you follow will appear here after real subscription data is connected."
      action={
        <Button asChild variant="secondary">
          <Link href="/explore">Browse explore</Link>
        </Button>
      }
    />
  );
}
