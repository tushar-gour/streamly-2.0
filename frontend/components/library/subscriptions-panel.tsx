"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/api/query-keys";
import { subscriptionsApi } from "@/lib/api/subscriptions.api";
import { formatCount, safeMediaUrl } from "@/lib/media/media-formatters";
import { useAuthStore } from "@/stores/auth-store";

export function SubscriptionsPanel() {
  const user = useAuthStore((state) => state.user);
  const subscriberId = user?._id ?? user?.id ?? "";

  const subscriptionsQuery = useQuery({
    enabled: Boolean(subscriberId),
    queryFn: async () => {
      const response = await subscriptionsApi.listBySubscriber(subscriberId);
      return Array.isArray(response.data)
        ? response.data
        : (response.data.channels ?? []);
    },
    queryKey: queryKeys.subscriptions.list(subscriberId),
    retry: 1,
    staleTime: 60_000,
  });

  if (subscriptionsQuery.isLoading) {
    return <LoadingState label="Loading subscriptions" />;
  }

  if (subscriptionsQuery.isError) {
    return (
      <div className="grid gap-4">
        <ErrorState message="Couldn’t load subscriptions." />
        <Button
          className="w-fit"
          onClick={() => void subscriptionsQuery.refetch()}
          variant="secondary"
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    );
  }

  const channels = subscriptionsQuery.data ?? [];

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
        Subscriptions
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
        Subscribed channels
      </h1>
      {channels.length === 0 ? (
        <div className="mt-16 grid place-items-center">
          <EmptyState
            eyebrow="Subscriptions"
            title="No subscriptions yet."
            description="Channels you subscribe to will appear here."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => {
            const avatar = safeMediaUrl(channel.avatar);

            return (
              <Link
                className="flex items-center gap-4 rounded-card border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition duration-180 hover:border-[rgba(141,132,255,0.5)]"
                href={`/channel/${channel.username}`}
                key={channel._id}
              >
                <div
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-[rgba(141,132,255,0.14)] bg-cover bg-center text-sm font-semibold text-periwinkle"
                  style={avatar ? { backgroundImage: `url(${avatar})` } : {}}
                >
                  {avatar ? null : channel.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">
                    {channel.fullName || channel.username}
                  </h2>
                  <p className="truncate text-sm text-[color:var(--color-text-muted)]">
                    @{channel.username} ·{" "}
                    {formatCount(channel.subscribersCount, "subscribers")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
