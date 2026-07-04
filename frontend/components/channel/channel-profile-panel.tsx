"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, UserPlus } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { queryKeys } from "@/lib/api/query-keys";
import { subscriptionsApi } from "@/lib/api/subscriptions.api";
import { usersApi } from "@/lib/api/users";
import { videosApi } from "@/lib/api/videos.api";
import {
  formatCount,
  formatRelativeDate,
  safeMediaUrl,
} from "@/lib/media/media-formatters";
import { toVideoCardModel } from "@/lib/media/video-mappers";

type ChannelProfilePanelProps = Readonly<{
  username: string;
}>;

export function ChannelProfilePanel({ username }: ChannelProfilePanelProps) {
  const queryClient = useQueryClient();
  const channelQuery = useQuery({
    queryFn: async () => {
      const response = await usersApi.channel(username);
      return response.data;
    },
    queryKey: queryKeys.users.channel(username),
    retry: false,
    staleTime: 60_000,
  });

  const channel = channelQuery.data;
  const videosQuery = useQuery({
    enabled: Boolean(channel?._id),
    queryFn: async () => {
      const response = await videosApi.list({ userId: channel?._id });
      return response.data;
    },
    queryKey: queryKeys.videos.list({ userId: channel?._id }),
    retry: 1,
    staleTime: 60_000,
  });

  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionsApi.toggleChannel(channel?._id ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.channel(username),
      });
    },
  });

  if (channelQuery.isLoading) {
    return <LoadingState label="Loading channel" />;
  }

  if (channelQuery.isError) {
    return (
      <div className="grid gap-4">
        <ErrorState message="Couldn’t load this channel. Try again." />
        <Button
          className="w-fit"
          onClick={() => void channelQuery.refetch()}
          variant="secondary"
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    );
  }

  if (!channel) {
    return (
      <EmptyState
        eyebrow="Channel"
        title="Channel unavailable."
        description="No channel profile was returned by the backend."
      />
    );
  }

  const videos = videosQuery.data ?? [];
  const coverImage = safeMediaUrl(channel.coverImage);
  const avatar = safeMediaUrl(channel.avatar);

  return (
    <section className="grid gap-6">
      <div
        className="h-48 rounded-hero border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#111521,#261f56_45%,#0b1020)] bg-cover bg-center"
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : {}}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <div
            className="grid size-24 place-items-center rounded-full border border-[color:var(--color-border)] bg-[rgba(141,132,255,0.16)] bg-cover bg-center text-3xl font-semibold text-periwinkle"
            style={avatar ? { backgroundImage: `url(${avatar})` } : {}}
          >
            {avatar ? null : channel.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">
              {channel.fullName || channel.username}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              @{channel.username} ·{" "}
              {formatCount(channel.subscribersCount, "subscribers")}
              {channel.createdAt
                ? ` · joined ${formatRelativeDate(channel.createdAt)}`
                : ""}
            </p>
          </div>
        </div>
        <Button
          disabled={!channel._id}
          isLoading={subscribeMutation.isPending}
          onClick={() => subscribeMutation.mutate()}
          variant={channel.isSubscribed ? "secondary" : "primary"}
        >
          <UserPlus size={16} />
          {channel.isSubscribed ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
      {videosQuery.isLoading ? <LoadingState label="Loading uploads" /> : null}
      {videosQuery.isError ? (
        <ErrorState message="Couldn’t load channel videos." />
      ) : null}
      {!videosQuery.isLoading && videos.length === 0 ? (
        <EmptyState
          eyebrow="Uploads"
          title="No public uploads yet."
          description="Published videos from this channel will appear here."
        />
      ) : null}
      {videos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={toVideoCardModel(video)} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
