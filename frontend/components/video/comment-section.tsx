"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/feedback/loading-state";
import { commentsApi } from "@/lib/api/comments.api";
import { likesApi } from "@/lib/api/likes.api";
import { useAuthStore } from "@/stores/auth-store";

type Action =
  | { kind: "add"; content: string }
  | { kind: "edit"; id: string; content: string }
  | { kind: "delete" | "like"; id: string };

export function CommentSection({ videoId }: { videoId: string }) {
  const userId = useAuthStore((state) => state.user?._id);
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const key = ["comments", "list", videoId, userId, page] as const;
  const query = useQuery({
    queryKey: key,
    queryFn: () => commentsApi.list(videoId, page, token),
  });
  const mutation = useMutation({
    mutationFn: async (action: Action) => {
      if (action.kind === "add") {
        await commentsApi.add(videoId, action.content, token);
      } else if (action.kind === "edit") {
        await commentsApi.update(action.id, action.content, token);
      } else if (action.kind === "delete") {
        await commentsApi.remove(action.id, token);
      } else {
        await likesApi.toggleCommentLike(action.id, token);
      }
    },
    retry: false,
    onSuccess: async (_, action) => {
      if (action.kind === "add") {
        setText("");
        setPage(1);
      }
      if (action.kind === "edit") setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["comments", "list", videoId],
      });
    },
  });
  const pagination = query.data?.meta?.pagination as
    { hasNextPage?: boolean } | undefined;

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (userId && text.trim() && !mutation.isPending) {
      mutation.mutate({ kind: "add", content: text.trim() });
    }
  }

  return (
    <section
      id="comments"
      className="grid scroll-mt-24 gap-4 rounded-card border border-[color:var(--color-border)] p-4"
    >
      <h2 className="text-lg font-semibold">Comments</h2>
      {userId ? (
        <form className="grid gap-3" onSubmit={add}>
          <label className="grid gap-2 text-sm">
            Add a comment
            <textarea
              className="min-h-20 rounded-input border border-[color:var(--color-border)] bg-transparent p-3"
              value={text}
              disabled={mutation.isPending}
              onChange={(event) => setText(event.target.value)}
              required
            />
          </label>
          <Button type="submit" disabled={!text.trim() || mutation.isPending}>
            Post comment
          </Button>
        </form>
      ) : (
        <Link href="/login" className="text-sm text-periwinkle">
          Sign in to join the conversation
        </Link>
      )}
      {mutation.isError ? (
        <p role="alert" className="text-sm">
          The action could not be confirmed. Refresh before retrying.
        </p>
      ) : null}
      {query.isPending ? <LoadingState label="Loading comments" /> : null}
      {query.isError ? (
        <div role="alert" className="grid gap-2">
          <p>Could not load comments.</p>
          <Button variant="secondary" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      {query.isSuccess && query.data.data.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          No comments on this page.
        </p>
      ) : null}
      <div className="grid gap-3">
        {query.data?.data.map((comment) => (
          <article
            key={comment._id}
            className="grid gap-2 border-t border-[color:var(--color-border)] pt-3"
          >
            <p className="text-sm font-medium">
              {comment.owner?.fullName || comment.owner?.username || "Viewer"}
            </p>
            {editing === comment._id ? (
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (editText.trim() && !mutation.isPending) {
                    mutation.mutate({
                      kind: "edit",
                      id: comment._id,
                      content: editText.trim(),
                    });
                  }
                }}
              >
                <Input
                  id={`comment-${comment._id}`}
                  label="Edit comment"
                  value={editText}
                  disabled={mutation.isPending}
                  onChange={(event) => setEditText(event.target.value)}
                />
                <Button disabled={!editText.trim() || mutation.isPending}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={mutation.isPending}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm">
                {comment.content}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                aria-pressed={Boolean(comment.isLiked)}
                disabled={!userId || mutation.isPending}
                onClick={() =>
                  mutation.mutate({ kind: "like", id: comment._id })
                }
              >
                {comment.isLiked ? "Liked" : "Like"} · {comment.likesCount ?? 0}
              </Button>
              {userId && comment.owner?._id === userId ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() => {
                      setEditing(comment._id);
                      setEditText(comment.content);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() => {
                      if (window.confirm("Delete this comment?")) {
                        mutation.mutate({ kind: "delete", id: comment._id });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Comment pages">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 1 || query.isFetching}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination?.hasNextPage || query.isFetching}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </nav>
    </section>
  );
}
