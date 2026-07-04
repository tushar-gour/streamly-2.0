"use client";

import { Heart, MessageCircle, RefreshCw, Share2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { commentsApi } from "@/lib/api/comments.api";
import { likesApi } from "@/lib/api/likes.api";
import { queryKeys } from "@/lib/api/query-keys";
import { videosApi } from "@/lib/api/videos.api";
import { formatCount, getVideoStreamUrl } from "@/lib/media/media-formatters";
import { useAuthStore } from "@/stores/auth-store";

type VideoWatchPanelProps = Readonly<{
  videoId: string;
}>;

export function VideoWatchPanel({ videoId }: VideoWatchPanelProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const videoQuery = useQuery({
    queryFn: async () => {
      const response = await videosApi.detail(videoId);
      return response.data;
    },
    queryKey: queryKeys.videos.detail(videoId),
    retry: false,
    staleTime: 30_000,
  });

  const commentsQuery = useQuery({
    enabled: videoQuery.isSuccess,
    queryFn: async () => {
      const response = await commentsApi.list(videoId);
      return response.data;
    },
    queryKey: queryKeys.comments.list(videoId),
    retry: 1,
    staleTime: 30_000,
  });

  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleVideoLike(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.videos.detail(videoId),
      });
    },
  });

  if (videoQuery.isLoading) {
    return <LoadingState label="Loading video" />;
  }

  if (videoQuery.isError) {
    return (
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <EmptyState
          eyebrow="Video"
          title="This video is not available right now."
          description="It may be private, removed, or temporarily unavailable."
          action={
            <Button
              onClick={() => void videoQuery.refetch()}
              variant="secondary"
            >
              <RefreshCw size={16} />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const video = videoQuery.data;

  if (!video) {
    return (
      <EmptyState
        eyebrow="Video"
        title="Video unavailable."
        description="No video details were returned by the backend."
      />
    );
  }

  const comments = commentsQuery.data ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0">
        <div className="aspect-video overflow-hidden rounded-hero border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#101522,#32205d_52%,#090d17)]">
          <video
            className="h-full w-full"
            controls
            preload="metadata"
            src={getVideoStreamUrl(videoId)}
          />
        </div>
        <div className="mt-5 rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            {video.title}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            {formatCount(video.views, "views")} ·{" "}
            {formatCount(video.likesCount, "likes")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              disabled={!isAuthenticated}
              isLoading={likeMutation.isPending}
              onClick={() => likeMutation.mutate()}
              variant="secondary"
              size="sm"
            >
              <Heart size={16} />
              {isAuthenticated
                ? video.isLiked
                  ? "Liked"
                  : "Like"
                : "Sign in to like"}
            </Button>
            <Button disabled variant="secondary" size="sm">
              <MessageCircle size={16} />
              Comment
            </Button>
            <Button disabled variant="secondary" size="sm">
              <Share2 size={16} />
              Share
            </Button>
          </div>
          {video.description ? (
            <p className="mt-5 whitespace-pre-line text-[color:var(--color-text-secondary)]">
              {video.description}
            </p>
          ) : null}
        </div>
      </section>
      <aside className="grid content-start gap-5">
        <section className="rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-5">
          <h2 className="font-semibold">Comments</h2>
          {commentsQuery.isLoading ? (
            <div className="mt-4">
              <LoadingState label="Loading comments" />
            </div>
          ) : null}
          {commentsQuery.isError ? (
            <div className="mt-4">
              <ErrorState message="Couldn’t load comments." />
            </div>
          ) : null}
          {!commentsQuery.isLoading && comments.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
              No comments yet.
            </p>
          ) : null}
          <div className="mt-4 grid gap-4">
            {comments.map((comment) => (
              <article
                key={comment._id}
                className="rounded-card border border-[color:var(--color-border)] bg-[rgba(8,11,19,0.28)] p-4"
              >
                <p className="text-sm font-medium">
                  {comment.owner?.fullName || comment.owner?.username}
                </p>
                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                  {comment.content}
                </p>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
