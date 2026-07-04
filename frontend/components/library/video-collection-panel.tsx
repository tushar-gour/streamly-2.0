"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import type { VideoListItem } from "@/lib/api/videos.api";
import { toVideoCardModel } from "@/lib/media/video-mappers";

type VideoCollectionPanelProps = Readonly<{
  description?: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  queryFn: () => Promise<VideoListItem[]>;
  queryKey: readonly unknown[];
  title: string;
}>;

export function VideoCollectionPanel({
  description,
  emptyDescription,
  emptyTitle,
  eyebrow,
  queryFn,
  queryKey,
  title,
}: VideoCollectionPanelProps) {
  const videosQuery = useQuery({
    queryFn,
    queryKey,
    retry: 1,
    staleTime: 60_000,
  });

  if (videosQuery.isLoading) {
    return <LoadingState label={`Loading ${eyebrow.toLowerCase()}`} />;
  }

  if (videosQuery.isError) {
    return (
      <div className="grid gap-4">
        <ErrorState message={`Couldn’t load ${eyebrow.toLowerCase()}.`} />
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

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-[color:var(--color-text-secondary)]">
          {description}
        </p>
      ) : null}

      {videos.length === 0 ? (
        <div className="mt-16 grid place-items-center">
          <EmptyState
            eyebrow={eyebrow}
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={toVideoCardModel(video)} />
          ))}
        </div>
      )}
    </section>
  );
}
