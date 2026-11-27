"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi, type ModerationComment } from "@/lib/api/admin.api";
import { useAuthStore } from "@/stores/auth-store";

export function CommentModeration() {
  const userId = useAuthStore((state) => state.user?._id);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ModerationComment | null>(null);
  const [reason, setReason] = useState("");
  const key = ["admin", userId, "comments"] as const;
  const query = useQuery({
    queryKey: [...key, page],
    queryFn: async () => (await adminApi.comments(page)).data,
    enabled: Boolean(userId),
  });
  const action = useMutation({
    mutationFn: ({ item, justification }: {
      item: ModerationComment;
      justification: string;
    }) => adminApi.setCommentHold(item.id, !item.moderationHeld, justification),
    onSuccess: async () => {
      setSelected(null);
      setReason("");
      await client.invalidateQueries({ queryKey: key });
    },
  });
  const items = query.data ?? [];
  return (
    <section className="grid gap-4" aria-label="Comment moderation">
      <header>
        <h2 className="text-xl font-semibold">Comment moderation</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
          Hold harmful comments without deleting their audit history.
        </p>
      </header>
      {query.isPending ? <p role="status">Loading comments…</p> : null}
      {query.isError ? (
        <div role="alert">
          <p>Could not load moderation comments.</p>
          <Button variant="secondary" onClick={() => void query.refetch()}>Retry</Button>
        </div>
      ) : null}
      {query.isSuccess && !items.length ? <p>No comments on this page.</p> : null}
      {items.map((item) => (
        <Card key={item.id} className="grid gap-3 p-4">
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            @{item.owner.username} · {item.video.title} · {item.moderationHeld ? "Held" : "Visible when published"}
          </p>
          <p className="whitespace-pre-wrap break-words">{item.content}</p>
          <div>
            <Button variant="secondary" disabled={action.isPending} onClick={() => {
              action.reset();
              setSelected(item);
              setReason("");
            }}>
              {item.moderationHeld ? "Release hold" : "Place hold"}
            </Button>
          </div>
        </Card>
      ))}
      {selected ? (
        <Card className="p-4">
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            if (reason.trim() && !action.isPending)
              action.mutate({ item: selected, justification: reason.trim() });
          }}>
            <h3 className="font-semibold">{selected.moderationHeld ? "Release comment hold" : "Hold comment"}</h3>
            <p className="break-words text-sm">{selected.content}</p>
            <Input label="Comment moderation reason" value={reason} required maxLength={500} onChange={(event) => setReason(event.target.value)} disabled={action.isPending} />
            {action.isError ? <p role="alert">The action could not be confirmed. Refresh the list and retry.</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!reason.trim() || action.isPending}>Confirm</Button>
              <Button type="button" variant="secondary" disabled={action.isPending} onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <nav className="flex items-center gap-3" aria-label="Comment moderation pages">
        <Button variant="secondary" disabled={page === 1 || query.isFetching || action.isPending} onClick={() => { setSelected(null); setPage(page - 1); }}>Previous</Button>
        <span>Page {page}</span>
        <Button variant="secondary" disabled={items.length < 25 || query.isFetching || action.isPending} onClick={() => { setSelected(null); setPage(page + 1); }}>Next</Button>
      </nav>
    </section>
  );
}
