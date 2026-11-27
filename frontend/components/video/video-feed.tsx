"use client";

import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
  const filterKey = JSON.stringify(filters);
  const [paging, setPaging] = useState({ filterKey, page: filters.page ?? 1 });
  const page =
    paging.filterKey === filterKey ? paging.page : (filters.page ?? 1);
  const request = { ...filters, page };
  const videosQuery = useQuery({
    queryFn: () => videosApi.list(request),
    queryKey: queryKeys.videos.list(request),
    retry: 1,
    staleTime: 60_000,
  });
  const videos = videosQuery.data?.data ?? [];
  const pagination = videosQuery.data?.meta?.pagination as
    { hasNextPage?: boolean } | undefined;

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
      {videosQuery.isPending ? (
        <div className="mt-6">
          <LoadingState label="Loading videos" />
        </div>
      ) : null}
      {videosQuery.isError ? (
        <div className="mt-6 grid gap-4">
          <ErrorState message="Couldn’t load videos. Try again." />
          <Button
            className="w-fit"
            onClick={() => void videosQuery.refetch()}
            variant="secondary"
          >
            <RefreshCw size={16} /> Retry
          </Button>
        </div>
      ) : null}
      {videosQuery.isSuccess && videos.length === 0 ? (
        <div className="grid min-h-[280px] place-items-center">
          <EmptyState
            eyebrow={title}
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      ) : null}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={toVideoCardModel(video)} />
        ))}
      </div>
      {page > 1 || pagination?.hasNextPage ? (
        <nav className="mt-6 flex items-center gap-3" aria-label="Video pages">
          <Button
            variant="secondary"
            disabled={page === 1 || videosQuery.isFetching}
            onClick={() => setPaging({ filterKey, page: page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm">Page {page}</span>
          <Button
            variant="secondary"
            disabled={!pagination?.hasNextPage || videosQuery.isFetching}
            onClick={() => setPaging({ filterKey, page: page + 1 })}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
