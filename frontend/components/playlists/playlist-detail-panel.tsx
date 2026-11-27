"use client";

import { useQuery } from "@tanstack/react-query";
import { PlaylistManagement } from "@/components/playlists/playlist-management";
import { useAuthStore } from "@/stores/auth-store";
import { RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { playlistsApi } from "@/lib/api/playlists.api";
import { queryKeys } from "@/lib/api/query-keys";
import { toVideoCardModel } from "@/lib/media/video-mappers";

type PlaylistDetailPanelProps = Readonly<{
  playlistId: string;
}>;

export function PlaylistDetailPanel({ playlistId }: PlaylistDetailPanelProps) {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const playlistQuery = useQuery({
    queryFn: async () => {
      const response = await playlistsApi.detail(playlistId, token);
      return response.data;
    },
    queryKey: [
      ...queryKeys.playlists.detail(playlistId),
      userId ?? "anonymous",
    ],
    retry: false,
    staleTime: 0,
  });

  if (playlistQuery.isLoading) {
    return <LoadingState label="Loading playlist" />;
  }

  if (playlistQuery.isError) {
    return (
      <div className="grid gap-4">
        <ErrorState message="Couldn’t load playlist." />
        <Button
          className="w-fit"
          onClick={() => void playlistQuery.refetch()}
          variant="secondary"
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    );
  }

  const playlist = playlistQuery.data;

  if (!playlist) {
    return (
      <EmptyState
        eyebrow="Playlist"
        title="Playlist unavailable."
        description="No playlist details were returned by the backend."
      />
    );
  }

  const videos = playlist.videos ?? [];

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
        Playlist · {playlist.isPublic ? "Public" : "Private"}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
        {playlist.name}
      </h1>
      {playlist.description ? (
        <p className="mt-3 max-w-2xl text-[color:var(--color-text-secondary)]">
          {playlist.description}
        </p>
      ) : null}
      {userId && playlist.owner?._id === userId ? (
        <PlaylistManagement playlist={playlist} />
      ) : null}
      {videos.length === 0 ? (
        <div className="mt-16 grid place-items-center">
          <EmptyState
            eyebrow="Playlist"
            title="No videos in this playlist."
            description="Videos added to this playlist will appear here."
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
