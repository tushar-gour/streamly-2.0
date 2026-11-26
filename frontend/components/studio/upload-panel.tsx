"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { publishVideo, validateUpload } from "@/lib/api/upload.api";
import { StreamlyApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";

export function UploadPanel() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || publishedId) return;
    const validation = validateUpload(video, thumbnail, title, description);
    setError(validation);
    if (validation || !video || !thumbnail) return;

    const form = new FormData();
    form.append("videoFile", video);
    form.append("thumbnail", thumbnail);
    form.append("title", title.trim());
    form.append("description", description.trim());
    submitting.current = true;
    setBusy(true);
    setProgress(null);
    try {
      const response = await publishVideo(form, accessToken, setProgress);
      setPublishedId(response.data._id);
      void queryClient.invalidateQueries({ queryKey: ["videos"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode === 401
          ? "Your session expired. Sign in again before publishing."
          : "Publishing could not be confirmed. Check Studio before retrying to avoid duplicate uploads."
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (publishedId) {
    return (
      <Card className="grid gap-4 p-6">
        <h1 className="text-3xl font-semibold">Your video is published.</h1>
        <div role="status">Your upload was confirmed by Streamly.</div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/watch/${publishedId}`}>Watch video</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/studio">Back to Studio</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form className="grid gap-5" onSubmit={submit}>
        <h1 className="text-3xl font-semibold">Upload video</h1>
        <fieldset disabled={busy} className="grid min-w-0 gap-5">
          <div
            className="grid place-items-center gap-4 rounded-hero border border-dashed border-periwinkle/40 p-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!busy) setVideo(event.dataTransfer.files[0] ?? null);
            }}
          >
            <Upload className="text-periwinkle" size={42} />
            <h2 className="text-xl font-semibold">Drop your video here.</h2>
            <input
              ref={fileInput}
              type="file"
              accept="video/mp4,video/mpeg,video/quicktime,video/webm"
              className="sr-only"
              tabIndex={-1}
              aria-label="Video file"
              onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
            />
            <Button type="button" onClick={() => fileInput.current?.click()}>
              Select file
            </Button>
            <p className="max-w-full break-all text-sm">
              {video?.name ?? "MP4, MPEG, MOV or WebM"}
            </p>
          </div>
          <Input
            label="Title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label className="grid gap-2 text-sm">
            Description
            <textarea
              required
              rows={4}
              className="rounded-input border border-[color:var(--color-border)] bg-transparent p-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Thumbnail (required)
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="w-full rounded-input border border-[color:var(--color-border)] p-3"
              onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)}
            />
          </label>
        </fieldset>
        {error ? (
          <div role="alert">
            <ErrorState message={error} />
          </div>
        ) : null}
        {busy ? (
          <div className="grid gap-2" role="status">
            {progress === 100
              ? "Transfer complete. Waiting for the server to publish."
              : progress === null
                ? "Starting upload…"
                : `Uploading: ${progress}%`}
            {progress !== null ? (
              <div
                role="progressbar"
                aria-label="File transfer"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <Progress value={progress} />
              </div>
            ) : null}
          </div>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Publishing…" : "Publish publicly"}
        </Button>
      </form>
      <Card className="h-fit p-5">
        <h2 className="font-semibold">Publishing requirements</h2>
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
          Each file must be at most 50 MB. A thumbnail, title and description
          are required. The current upload API publishes immediately; draft
          uploads are not supported.
        </p>
      </Card>
    </section>
  );
}
