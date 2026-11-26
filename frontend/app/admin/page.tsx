"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, type ModerationVideo } from "@/lib/api/admin.api";
import { StreamlyApiError } from "@/lib/api/errors";

function ModerationPanel() {
  const [videos, setVideos] = useState<ModerationVideo[]>([]);
  const [counts, setCounts] = useState<{
    published: number;
    held: number;
    unpublished: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ModerationVideo | null>(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([adminApi.overview(), adminApi.videos(page)])
      .then(([overview, list]) => {
        if (!active) return;
        setCounts(overview.data);
        setVideos(list.data);
      })
      .catch(() => {
        if (active) setError("Could not load moderation data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, revision]);

  async function apply() {
    if (!selected || !reason.trim() || pending) return;
    setPending(true);
    setError("");
    try {
      await adminApi.setHold(selected.id, !selected.moderationHeld, reason);
      setSelected(null);
      setReason("");
      setRevision((value) => value + 1);
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
      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3">
          <p>{error}</p>
          <Button
            variant="secondary"
            onClick={() => setRevision((value) => value + 1)}
          >
            Retry
          </Button>
        </div>
      ) : null}
      {loading ? <p role="status">Loading moderation queue…</p> : null}
      {!loading && !error && videos.length === 0 ? (
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
  return (
    <AppShell
      permission={{ authenticated: true, anyPermission: ["video:publish:any"] }}
    >
      <ModerationPanel />
    </AppShell>
  );
}
