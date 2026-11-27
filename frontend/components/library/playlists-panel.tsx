"use client";

import Link from "next/link";
import { ListVideo, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CreatePlaylist } from "@/components/playlists/create-playlist";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { playlistsApi } from "@/lib/api/playlists.api";
import { queryKeys } from "@/lib/api/query-keys";
import { safeMediaUrl } from "@/lib/media/media-formatters";
import { useAuthStore } from "@/stores/auth-store";

export function PlaylistsPanel() {
  const userId = useAuthStore(
    (state) => state.user?._id ?? state.user?.id ?? ""
  );
  const token = useAuthStore((state) => state.accessToken);

  const playlistsQuery = useQuery({
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await playlistsApi.listByUser(userId, token);
      return response.data;
    },
    queryKey: queryKeys.playlists.list(userId),
    retry: 1,
    staleTime: 60_000,
  });

  if (playlistsQuery.isLoading) {
    return <LoadingState label="Loading playlists" />;
  }

  if (playlistsQuery.isError) {
    return (
      <div className="grid gap-4">
        <ErrorState message="Couldn’t load playlists." />
        <Button
          className="w-fit"
          onClick={() => void playlistsQuery.refetch()}
          variant="secondary"
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    );
  }

  const playlists = playlistsQuery.data ?? [];

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
        Playlists
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
        Your playlists
      </h1>
      <div className="mt-6">
        <CreatePlaylist />
      </div>
      {playlists.length === 0 ? (
        <div className="mt-16 grid place-items-center">
          <EmptyState
            eyebrow="Playlists"
            title="No playlists yet."
            description="Create a playlist to organize videos you want to revisit."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => {
            const thumbnail = safeMediaUrl(
              playlist.thumbnail ?? playlist.videos?.[0]?.thumbnail
            );

            return (
              <Link
                className="group rounded-card border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition duration-180 hover:border-[rgba(141,132,255,0.5)]"
                href={`/playlists/${playlist._id}`}
                key={playlist._id}
              >
                <div
                  className="grid aspect-video place-items-center rounded-input bg-[linear-gradient(135deg,#111521,#2c2461)] bg-cover bg-center"
                  style={
                    thumbnail ? { backgroundImage: `url(${thumbnail})` } : {}
                  }
                >
                  {thumbnail ? null : (
                    <ListVideo className="text-periwinkle" size={32} />
                  )}
                </div>
                <h2 className="mt-4 font-semibold group-hover:text-periwinkle">
                  {playlist.name}
                </h2>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                  {playlist.videosCount ?? 0} videos ·{" "}
                  {playlist.isPublic ? "Public" : "Private"}
                </p>
                {playlist.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-[color:var(--color-text-secondary)]">
                    {playlist.description}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
