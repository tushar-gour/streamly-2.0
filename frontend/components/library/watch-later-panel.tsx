"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { watchLaterApi } from "@/lib/api/watch-later.api";
import { toVideoCardModel } from "@/lib/media/video-mappers";
import { useAuthStore } from "@/stores/auth-store";

export function WatchLaterPanel() {
  const userId = useAuthStore((state) => state.user?._id);
  const token = useAuthStore((state) => state.accessToken);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["watch-later", userId, "list", page],
    queryFn: () => watchLaterApi.list(page, token),
    enabled: Boolean(userId),
  });
  const remove = useMutation({
    mutationFn: (videoId: string) => watchLaterApi.set(videoId, false, token),
    onSuccess: async (_, videoId) => {
      queryClient.setQueryData(["watch-later", userId, "status", videoId], {
        saved: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ["watch-later", userId, "list"],
      });
    },
    retry: false,
  });
  const videos = query.data?.data ?? [];
  const pagination = query.data?.meta?.pagination as
    { hasNextPage?: boolean } | undefined;
  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm text-periwinkle">Your library</p>
        <h1 className="mt-2 text-3xl font-semibold">Watch Later</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
          Videos saved for a quieter moment.
        </p>
      </div>
      {query.isPending ? <LoadingState label="Loading saved videos" /> : null}
      {query.isError ? (
        <div className="grid gap-2">
          <ErrorState message="Could not load saved videos." />
          <Button variant="secondary" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      {query.isSuccess && videos.length === 0 ? (
        <EmptyState
          eyebrow="Watch Later"
          title="Nothing saved here yet."
          description="Use Watch later on a video to add it to this list."
        />
      ) : null}
      {remove.isError ? (
        <p role="alert">The change could not be confirmed.</p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {videos.map((video) => (
          <div key={video._id} className="grid gap-2">
            <VideoCard video={toVideoCardModel(video)} />
            <Button
              variant="ghost"
              size="sm"
              disabled={remove.isPending}
              onClick={() => remove.mutate(video._id)}
            >
              Remove from Watch Later
            </Button>
          </div>
        ))}
      </div>
      {page > 1 || pagination?.hasNextPage ? (
        <nav aria-label="Saved video pages" className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page === 1 || query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!pagination?.hasNextPage || query.isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
