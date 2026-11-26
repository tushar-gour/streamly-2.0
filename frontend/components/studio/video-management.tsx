"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StudioVideo } from "@/lib/api/dashboard.api";
import { studioApi } from "@/lib/api/studio.api";
import {
  thumbnailTypes,
  validateUploadFile,
} from "@/lib/validation/video-upload";
import { useAuthStore } from "@/stores/auth-store";

type Action =
  | { kind: "edit"; body: FormData }
  | { kind: "visibility" }
  | { kind: "delete" };

export function VideoManagement({ video }: { video: StudioVideo }) {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const fileError =
    thumbnail && validateUploadFile(thumbnail, thumbnailTypes);

  const mutation = useMutation({
    mutationFn: async (action: Action) => {
      if (action.kind === "edit") {
        await studioApi.update(video._id, action.body, token);
      } else if (action.kind === "visibility") {
        await studioApi.togglePublished(video._id, token);
      } else {
        await studioApi.remove(video._id, token);
      }
    },
    retry: false,
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["studio", userId] }),
        queryClient.invalidateQueries({ queryKey: ["videos"] }),
      ]);
    },
    onSuccess: () => {
      setMode("idle");
      setConfirmation("");
      setThumbnail(null);
    },
  });

  function edit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending || fileError) return;
    const body = new FormData();
    if (title.trim() !== video.title) body.append("title", title.trim());
    if (description.trim() !== (video.description ?? "")) {
      body.append("description", description.trim());
    }
    if (thumbnail) body.append("thumbnail", thumbnail);
    if (!Array.from(body.keys()).length) return;
    mutation.mutate({ kind: "edit", body });
  }

  return (
    <div className="grid w-full gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => {
            mutation.reset();
            setTitle(video.title);
            setDescription(video.description ?? "");
            setThumbnail(null);
            setMode("edit");
          }}
        >
          Edit details
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={mutation.isPending || mutation.isError}
          onClick={() => mutation.mutate({ kind: "visibility" })}
        >
          {video.isPublished ? "Unpublish" : "Publish"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={mutation.isPending}
          onClick={() => {
            mutation.reset();
            setConfirmation("");
            setMode("delete");
          }}
        >
          Delete
        </Button>
      </div>
      {mode === "edit" ? (
        <form
          className="grid gap-4 rounded-card border border-[color:var(--color-border)] p-4"
          onSubmit={edit}
        >
          <Input
            label="Title"
            id={`title-${video._id}`}
            value={title}
            required
            disabled={mutation.isPending}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label className="grid gap-2 text-sm">
            Description
            <textarea
              value={description}
              required
              disabled={mutation.isPending}
              className="min-h-24 rounded-input border border-[color:var(--color-border)] bg-transparent p-3"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Replace thumbnail (optional)
            <input
              type="file"
              accept={thumbnailTypes.join(",")}
              disabled={mutation.isPending}
              onChange={(event) =>
                setThumbnail(event.target.files?.[0] ?? null)
              }
            />
          </label>
          {fileError ? <p role="alert">{fileError}</p> : null}
          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              Boolean(fileError) ||
              !title.trim() ||
              !description.trim() ||
              (!thumbnail &&
                title.trim() === video.title &&
                description.trim() === (video.description ?? ""))
            }
          >
            Save details
          </Button>
        </form>
      ) : null}
      {mode === "delete" ? (
        <div className="grid gap-3 rounded-card border border-[color:var(--color-border)] p-4">
          <p>Deletion is permanent. Type DELETE to confirm.</p>
          <Input
            label="Confirmation"
            id={`delete-${video._id}`}
            value={confirmation}
            disabled={mutation.isPending}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <Button
            variant="danger"
            type="button"
            disabled={confirmation !== "DELETE" || mutation.isPending}
            onClick={() => mutation.mutate({ kind: "delete" })}
          >
            Delete permanently
          </Button>
        </div>
      ) : null}
      {mode !== "idle" ? (
        <Button
          variant="ghost"
          type="button"
          disabled={mutation.isPending}
          onClick={() => setMode("idle")}
        >
          Cancel
        </Button>
      ) : null}
      {mutation.isPending ? <p role="status">Saving changes…</p> : null}
      {mutation.isSuccess ? <p role="status">Changes saved.</p> : null}
      {mutation.isError ? (
        <div role="alert" className="grid gap-2 text-sm">
          <p>
            The action could not be confirmed. Review the latest video state
            before trying again.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => mutation.reset()}
          >
            Dismiss
          </Button>
        </div>
      ) : null}
    </div>
  );
}
