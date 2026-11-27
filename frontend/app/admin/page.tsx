"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentModeration } from "@/components/admin/comment-moderation";
import { useAuthStore } from "@/stores/auth-store";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, type ModerationVideo } from "@/lib/api/admin.api";
import { StreamlyApiError } from "@/lib/api/errors";

function ModerationPanel() {
  const userId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ModerationVideo | null>(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["admin", userId, "videos", page],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [overview, list] = await Promise.all([
        adminApi.overview(),
        adminApi.videos(page),
      ]);
      return { counts: overview.data, videos: list.data };
    },
    retry: false,
  });
  const videos = query.data?.videos ?? [];
  const counts = query.data?.counts ?? null;
  const loading = query.isPending || query.isFetching;
  const feedback =
    error || (query.isError ? "Could not load moderation data." : "");

  async function apply() {
    if (!selected || !reason.trim() || pending) return;
    setPending(true);
    setError("");
    try {
      await adminApi.setHold(selected.id, !selected.moderationHeld, reason);
      setSelected(null);
      setReason("");
      await queryClient.invalidateQueries({
        queryKey: ["admin", userId, "videos"],
      });
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode < 500
          ? cause.message
          : "Could not update moderation state."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="grid gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Content moderation</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
          Review publication status and place or release audited holds.
          Releasing a hold does not republish a video.
        </p>
      </header>
      {counts ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(counts).map(([label, count]) => (
            <Card key={label} className="p-5">
              <p className="capitalize text-sm">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{count}</p>
            </Card>
          ))}
        </div>
      ) : null}
      {feedback ? (
        <div role="alert" className="flex flex-wrap items-center gap-3">
          <p>{feedback}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setError("");
              void query.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}
      {loading ? <p role="status">Loading moderation queue…</p> : null}
      {!loading && !feedback && videos.length === 0 ? (
        <p>No videos on this page.</p>
      ) : null}
      <div className="grid gap-3">
        {videos.map((video) => (
          <Card
            className="grid gap-3 p-4 sm:flex sm:items-center sm:justify-between"
            key={video.id}
          >
            <div className="min-w-0">
              <h2 className="break-words font-medium">{video.title}</h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                @{video.owner.username} ·{" "}
                {video.moderationHeld
                  ? "Held"
                  : video.isPublished
                    ? "Published"
                    : "Unpublished"}
              </p>
            </div>
            <Button
              variant="secondary"
              disabled={pending || loading}
              onClick={() => {
                setSelected(video);
                setReason("");
              }}
            >
              {video.moderationHeld ? "Release hold" : "Place hold"}
            </Button>
          </Card>
        ))}
      </div>
      {selected ? (
        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold">
            {selected.moderationHeld ? "Release hold" : "Place hold"}:{" "}
            {selected.title}
          </h2>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void apply();
            }}
          >
            <Input
              label="Moderation reason"
              required
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={pending}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending || !reason.trim()}>
                Confirm
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <nav aria-label="Moderation pages" className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={page === 1 || loading}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="secondary"
          disabled={videos.length < 25 || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </Button>
      </nav>
    </section>
  );
}

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const canModerateVideos = user?.permissions?.includes("video:publish:any");
  const canModerateComments = user?.permissions?.includes("comment:delete:any");
  return (
    <AppShell
      permission={{
        authenticated: true,
        anyPermission: ["video:publish:any", "comment:delete:any"],
      }}
    >
      <div className="grid gap-8">
        {canModerateVideos ? <ModerationPanel key={user?._id} /> : null}
        {canModerateComments ? <CommentModeration key={user?._id} /> : null}
      </div>
    </AppShell>
  );
}
