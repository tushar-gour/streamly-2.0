"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PlaylistForm } from "@/components/playlists/playlist-form";
import { playlistsApi } from "@/lib/api/playlists.api";
import { useAuthStore } from "@/stores/auth-store";

export function CreatePlaylist() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: (input: { name: string; description: string }) => playlistsApi.create(input, token),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setOpen(false);
    },
  });

  if (!open) {
    return <Button onClick={() => { mutation.reset(); setOpen(true); }}>Create playlist</Button>;
  }
  return (
    <section className="grid max-w-xl gap-3 rounded-card border border-[color:var(--color-border)] p-5">
      <h2 className="text-lg font-semibold">New playlist</h2>
      <PlaylistForm pending={mutation.isPending} submitLabel="Create playlist" onSubmit={(values) => mutation.mutate(values)} onCancel={() => setOpen(false)} />
      {mutation.isError ? <p role="alert" className="text-sm">Creation could not be confirmed. Refresh your playlists before retrying.</p> : null}
    </section>
  );
}
