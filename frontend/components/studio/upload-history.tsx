"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listUploadAttempts } from "@/lib/api/upload.api";
import { useAuthStore } from "@/stores/auth-store";

const labels = {
  validating: "Validating",
  storing: "Storing",
  ready: "Published",
  failed: "Failed",
  interrupted: "Interrupted",
};

export function UploadHistory() {
  const userId = useAuthStore((state) => state.user?._id);
  const token = useAuthStore((state) => state.accessToken);
  const query = useQuery({
    queryKey: ["studio", userId, "upload-attempts"],
    queryFn: async () => (await listUploadAttempts(token)).data,
    enabled: Boolean(userId),
    refetchInterval: (current) =>
      current.state.data?.some(
        (item) => item.status === "validating" || item.status === "storing"
      )
        ? 3000
        : false,
  });
  if (query.isPending) return null;
  return (
    <section className="grid gap-3" aria-label="Recent processing attempts">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Recent processing</h2>
        <Button
          variant="secondary"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          Refresh
        </Button>
      </div>
      {query.isError ? (
        <p role="alert">
          Could not load processing history. Use Refresh to try again.
        </p>
      ) : null}
      {query.isSuccess && query.data.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          New uploads will appear here as they are validated and stored.
        </p>
      ) : null}
      <ul className="divide-y divide-[color:var(--color-border)]">
        {query.data?.map((attempt) => (
          <li
            key={attempt.requestId}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium">{attempt.title}</p>
              <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                {attempt.status === "ready" && !attempt.videoId
                  ? "Video removed"
                  : labels[attempt.status]}
              </p>
              {attempt.error ? (
                <p className="mt-1 text-sm">{attempt.error}</p>
              ) : null}
            </div>
            {attempt.videoId ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/watch/${encodeURIComponent(attempt.videoId)}`}>
                  Watch
                </Link>
              </Button>
            ) : null}
            {attempt.status === "failed" || attempt.status === "interrupted" ? (
              <Button asChild variant="secondary" size="sm">
                <Link href="/studio/upload">New upload</Link>
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
