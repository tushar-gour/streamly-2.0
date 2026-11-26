"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ListPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { playlistsApi } from "@/lib/api/playlists.api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores/auth-store";

export function SaveToPlaylist({ videoId }: { videoId: string }) {
  const userId = useAuthStore((state) => state.user?._id ?? "");
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const query = useQuery({
    queryKey: queryKeys.playlists.list(userId),
    queryFn: async () => (await playlistsApi.listByUser(userId, token)).data,
    enabled: open && Boolean(userId),
  });
  const mutation = useMutation({
    mutationFn: (id: string) => playlistsApi.addVideo(id, videoId, token),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  return (
    <div className="relative">
      <Button
        variant="secondary"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          mutation.reset();
        }}
      >
        <ListPlus size={16} /> Save
      </Button>
      {open ? (
        <section
          className="absolute left-0 top-full z-20 mt-2 grid w-64 max-w-[75vw] gap-3 rounded-card border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-4 shadow-lg"
          aria-label="Save to playlist"
        >
          {query.isPending ? <p role="status">Loading playlists…</p> : null}
          {query.isError ? (
            <Button variant="secondary" onClick={() => void query.refetch()}>
              Retry loading playlists
            </Button>
          ) : null}
          {query.isSuccess && !query.data.length ? (
            <Link href="/playlists" className="text-sm text-periwinkle">
              Create a playlist first
            </Link>
          ) : null}
          {query.data?.length ? (
            <>
              <label className="grid gap-2 text-sm">
                Playlist
                <select
                  aria-label="Playlist"
                  className="min-h-11 rounded-input border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2"
                  value={selected}
                  disabled={mutation.isPending}
                  onChange={(event) => {
                    setSelected(event.target.value);
                    mutation.reset();
                  }}
                >
                  <option value="">Choose playlist</option>
                  {query.data.map((playlist) => (
                    <option key={playlist._id} value={playlist._id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                disabled={!selected}
                isLoading={mutation.isPending}
                onClick={() => mutation.mutate(selected)}
              >
                Save video
              </Button>
            </>
          ) : null}
          {mutation.isError ? (
            <p role="alert" className="text-sm">
              Could not confirm the save.
            </p>
          ) : null}
          {mutation.isSuccess ? (
            <p role="status" className="text-sm">
              Video saved to playlist.
            </p>
          ) : null}
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </section>
      ) : null}
    </div>
  );
}
