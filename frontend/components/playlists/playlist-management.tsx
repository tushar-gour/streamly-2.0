"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PlaylistForm } from "@/components/playlists/playlist-form";
import { Button } from "@/components/ui/button";
import { playlistsApi } from "@/lib/api/playlists.api";
import type { PlaylistDetails } from "@/lib/api/playlists.api";
import { useAuthStore } from "@/stores/auth-store";

type Action =
  | { kind: "edit"; name: string; description: string; isPublic: boolean }
  | { kind: "remove-video"; videoId: string }
  | { kind: "delete" };

export function PlaylistManagement({
  playlist,
}: {
  playlist: PlaylistDetails;
}) {
  const token = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const mutation = useMutation({
    mutationFn: async (action: Action) => {
      if (action.kind === "edit") {
        await playlistsApi.update(
          playlist._id,
          { name: action.name, description: action.description, isPublic: action.isPublic },
          token
        );
      } else if (action.kind === "remove-video") {
        await playlistsApi.removeVideo(playlist._id, action.videoId, token);
      } else {
        await playlistsApi.remove(playlist._id, token);
      }
    },
    retry: false,
    onSuccess: async (_, action) => {
      setEditing(false);
      if (action.kind === "delete") router.replace("/playlists");
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  return (
    <section className="mt-6 grid gap-3 rounded-card border border-[color:var(--color-border)] p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => setEditing(true)}
        >
          Edit playlist
        </Button>
        <Button
          variant="danger"
          disabled={mutation.isPending}
          onClick={() => {
            if (
              window.confirm(
                "Delete this playlist? The videos will not be deleted."
              )
            )
              mutation.mutate({ kind: "delete" });
          }}
        >
          Delete playlist
        </Button>
      </div>
      {editing ? (
        <PlaylistForm
          initialName={playlist.name}
          initialDescription={playlist.description}
          initialIsPublic={playlist.isPublic ?? false}
          pending={mutation.isPending}
          submitLabel="Save changes"
          onSubmit={(values) => mutation.mutate({ kind: "edit", ...values })}
          onCancel={() => setEditing(false)}
        />
      ) : null}
      {playlist.videos?.length ? (
        <details>
          <summary className="cursor-pointer py-2 text-sm font-medium">
            Manage videos
          </summary>
          <ul className="grid gap-2">
            {playlist.videos.map((video) => (
              <li
                key={video._id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--color-border)] pt-2"
              >
                <span className="min-w-0 break-words text-sm">
                  {video.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      kind: "remove-video",
                      videoId: video._id,
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {mutation.isError ? (
        <p role="alert" className="text-sm">
          The change could not be confirmed. Refresh and try again.
        </p>
      ) : null}
      {mutation.isSuccess ? (
        <p role="status" className="text-sm">
          Playlist updated.
        </p>
      ) : null}
    </section>
  );
}
