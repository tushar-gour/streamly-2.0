"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { StatCard } from "@/components/cards/stat-card";
import { UploadHistory } from "@/components/studio/upload-history";
import { VideoManagement } from "@/components/studio/video-management";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { useAuthStore } from "@/stores/auth-store";

export function StudioOverview() {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const [page, setPage] = useState(1);
  const stats = useQuery({
    queryKey: ["studio", userId, "stats"],
    queryFn: async () => (await dashboardApi.stats(token)).data,
    enabled: Boolean(userId),
  });
  const videos = useQuery({
    queryKey: ["studio", userId, "videos", page],
    queryFn: () => dashboardApi.videos(page, token),
    enabled: Boolean(userId),
  });
  const overview = stats.data?.overview;
  const pagination = videos.data?.meta?.pagination as
    { hasNextPage?: boolean } | undefined;

  return (
    <div className="grid gap-8">
      {stats.isPending ? <LoadingState label="Loading statistics" /> : null}
      {stats.isError ? (
        <div role="alert">
          <p>Could not load channel statistics.</p>
          <Button variant="secondary" onClick={() => void stats.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      {overview ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {(
            [
              ["Views", overview.totalViews],
              ["Videos", overview.totalVideos],
              ["Subscribers", overview.totalSubscribers],
              ["Likes", overview.totalLikes],
              ["Comments", overview.totalComments],
            ] as const
          ).map(([label, value]) => (
            <StatCard
              key={label}
              label={label}
              value={value.toLocaleString()}
              helper="Channel total"
            />
          ))}
        </div>
      ) : null}
      <UploadHistory />
      <section className="grid gap-4" aria-label="Your uploads">
        <h2 className="text-xl font-semibold">Your uploads</h2>
        {videos.isPending ? <LoadingState label="Loading uploads" /> : null}
        {videos.isError ? (
          <div role="alert">
            <p>Could not load your videos.</p>
            <Button variant="secondary" onClick={() => void videos.refetch()}>
              Retry
            </Button>
          </div>
        ) : null}
        {videos.data?.data.length === 0 ? (
          <p className="text-[color:var(--color-text-secondary)]">
            No videos yet. Publish your first video to get started.
          </p>
        ) : null}
        {videos.data?.data.length ? (
          <ul className="divide-y divide-[color:var(--color-border)] rounded-card border border-[color:var(--color-border)]">
            {videos.data.data.map((video) => (
              <li
                key={video._id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <Link
                    className="break-words font-medium hover:underline"
                    href={`/watch/${encodeURIComponent(video._id)}`}
                  >
                    {video.title}
                  </Link>
                  <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                    {video.isPublished ? "Published" : "Unpublished"}
                  </p>
                </div>
                <span className="text-sm">
                  {(video.views ?? 0).toLocaleString()} views
                </span>
                <VideoManagement video={video} />
              </li>
            ))}
          </ul>
        ) : null}
        <nav className="flex items-center gap-3" aria-label="Upload pages">
          <Button
            variant="secondary"
            disabled={page === 1 || videos.isFetching}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="secondary"
            disabled={!pagination?.hasNextPage || videos.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      </section>
    </div>
  );
}
