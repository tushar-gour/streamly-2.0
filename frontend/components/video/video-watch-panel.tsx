"use client";

import { Heart, MessageCircle, RefreshCw, Share2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/video/comment-section";
import { SaveToPlaylist } from "@/components/playlists/save-to-playlist";
import { WatchLaterButton } from "@/components/library/watch-later-button";
import { likesApi } from "@/lib/api/likes.api";
import { queryKeys } from "@/lib/api/query-keys";
import { videosApi } from "@/lib/api/videos.api";
import type { VideoListItem } from "@/lib/api/videos.api";
import {
  formatCount,
  getVideoStreamUrl,
  safeMediaUrl,
} from "@/lib/media/media-formatters";
import { useAuthStore } from "@/stores/auth-store";

export function VideoWatchPanel({ videoId }: { videoId: string }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const [shareStatus, setShareStatus] = useState("");
  const [playerError, setPlayerError] = useState(false);
  const [playerAttempt, setPlayerAttempt] = useState(0);
  const detailKey = [...queryKeys.videos.detail(videoId), userId] as const;
  const videoQuery = useQuery({
    queryFn: async () => (await videosApi.detail(videoId)).data,
    queryKey: detailKey,
    retry: false,
    staleTime: 30_000,
  });

  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleVideoLike(videoId, token),
    retry: false,
    onSuccess: async (response) => {
      queryClient.setQueryData<VideoListItem>(detailKey, (current) =>
        current ? { ...current, ...response.data } : current
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.likes.videos(),
      });
    },
  });

  async function share() {
    try {
      const url = new URL(
        `/watch/${encodeURIComponent(videoId)}`,
        window.location.origin
      ).toString();
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus("Video link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus(
        "Could not share the link. Copy the address from your browser."
      );
    }
  }

  if (videoQuery.isPending) {
    return <LoadingState label="Loading video" />;
  }
  if (videoQuery.isError || !videoQuery.data) {
    return (
      <EmptyState
        eyebrow="Video"
        title="This video is not available right now."
        description="It may be private, removed, or temporarily unavailable."
        action={
          <Button onClick={() => void videoQuery.refetch()} variant="secondary">
            <RefreshCw size={16} />
            Retry
          </Button>
        }
      />
    );
  }
  const video = videoQuery.data;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0">
        <div className="aspect-video overflow-hidden rounded-hero border border-[color:var(--color-border)] bg-black">
          {playerError ? (
            <div className="grid h-full place-content-center gap-3 p-4 text-center text-white">
              <p>Playback could not start.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setPlayerError(false);
                  setPlayerAttempt((current) => current + 1);
                }}
              >
                Retry playback
              </Button>
            </div>
          ) : (
            <video
              key={playerAttempt}
              className="h-full w-full"
              controls
              playsInline
              preload="metadata"
              poster={safeMediaUrl(video.thumbnail) ?? undefined}
              src={getVideoStreamUrl(videoId)}
              onError={() => setPlayerError(true)}
            />
          )}
        </div>
        <div className="mt-5 grid gap-4 rounded-card border border-[color:var(--color-border)] p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            {video.title}
          </h1>
          {video.owner?.username ? (
            <Link
              href={`/channel/${encodeURIComponent(video.owner.username)}`}
              className="w-fit text-sm text-periwinkle"
            >
              {video.owner.fullName || video.owner.username}
            </Link>
          ) : null}
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {formatCount(video.views, "views")} ·{" "}
            {formatCount(video.likesCount, "likes")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Button
                aria-pressed={Boolean(video.isLiked)}
                isLoading={likeMutation.isPending}
                onClick={() => likeMutation.mutate()}
                variant="secondary"
              >
                <Heart size={16} />
                {video.isLiked ? "Liked" : "Like"}
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link href="/login">Sign in to like</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href="#comments">
                <MessageCircle size={16} /> Comment
              </Link>
            </Button>
            {isAuthenticated ? <><WatchLaterButton videoId={videoId} /><SaveToPlaylist videoId={videoId} /></> : null}
            <Button variant="secondary" onClick={() => void share()}>
              <Share2 size={16} /> Share
            </Button>
          </div>
          {shareStatus ? (
            <p role="status" className="text-sm">
              {shareStatus}
            </p>
          ) : null}
          {likeMutation.isError ? (
            <p role="alert">
              Like could not be confirmed. Refresh before retrying.
            </p>
          ) : null}
          {video.description ? (
            <p className="whitespace-pre-line break-words text-[color:var(--color-text-secondary)]">
              {video.description}
            </p>
          ) : null}
        </div>
      </section>
      <aside className="min-w-0">
        <CommentSection videoId={videoId} />
      </aside>
    </div>
  );
}
