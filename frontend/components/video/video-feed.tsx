"use client";

import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { queryKeys } from "@/lib/api/query-keys";
import { videosApi, type VideoListFilters } from "@/lib/api/videos.api";
import { toVideoCardModel } from "@/lib/media/video-mappers";

type VideoFeedProps = Readonly<{
  description?: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow?: string;
  filters?: VideoListFilters;
  title?: string;
}>;

export function VideoFeed({
  description,
  emptyDescription,
  emptyTitle,
  eyebrow,
  filters = {},
  title,
}: VideoFeedProps) {
  const videosQuery = useQuery({
    queryFn: async () => {
      const response = await videosApi.list(filters);
      return response.data;
    },
    queryKey: queryKeys.videos.list(filters),
    retry: 1,
    staleTime: 60_000,
  });

  if (videosQuery.isLoading) {
    return <LoadingState label="Loading videos" />;
  }

  if (videosQuery.isError) {
    return (
      <div className="grid gap-4">
        <ErrorState message="Couldn’t load videos. Try again." />
        <Button
          className="w-fit"
          onClick={() => void videosQuery.refetch()}
          variant="secondary"
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    );
  }

  const videos = videosQuery.data ?? [];

  if (videos.length === 0) {
    return (
      <div className="grid min-h-[360px] place-items-center">
        <EmptyState
          eyebrow={title}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <section>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-3 max-w-2xl text-[color:var(--color-text-secondary)]">
          {description}
        </p>
      ) : null}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={toVideoCardModel(video)} />
        ))}
      </div>
    </section>
  );
}
