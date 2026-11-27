"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { watchLaterApi } from "@/lib/api/watch-later.api";
import { useAuthStore } from "@/stores/auth-store";

export function WatchLaterButton({ videoId }: { videoId: string }) {
  const userId = useAuthStore((state) => state.user?._id);
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const key = ["watch-later", userId, "status", videoId] as const;
  const query = useQuery({
    queryKey: key,
    queryFn: async () => (await watchLaterApi.status(videoId, token)).data,
    enabled: Boolean(userId),
  });
  const mutation = useMutation({
    mutationFn: (saved: boolean) => watchLaterApi.set(videoId, saved, token),
    onSuccess: async (_, saved) => {
      queryClient.setQueryData(key, { saved });
      await queryClient.invalidateQueries({
        queryKey: ["watch-later", userId, "list"],
      });
    },
    retry: false,
  });
  if (query.isError)
    return (
      <Button variant="secondary" onClick={() => void query.refetch()}>
        Retry saved status
      </Button>
    );
  const saved = Boolean(query.data?.saved);
  return (
    <div className="grid gap-1">
      <Button
        variant="secondary"
        aria-pressed={saved}
        disabled={!query.isSuccess}
        isLoading={mutation.isPending}
        onClick={() => mutation.mutate(!saved)}
      >
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        {saved ? "Saved for later" : "Watch later"}
      </Button>
      {mutation.isError ? (
        <span role="alert" className="text-xs">
          Save could not be confirmed.
        </span>
      ) : null}
    </div>
  );
}
