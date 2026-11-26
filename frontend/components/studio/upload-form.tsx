"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StreamlyApiError } from "@/lib/api/errors";
import { uploadVideo } from "@/lib/api/upload.api";
import {
  thumbnailTypes,
  validateUploadFile,
  videoTypes,
} from "@/lib/validation/video-upload";
import { useAuthStore } from "@/stores/auth-store";

export function UploadForm() {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const submitting = useRef(false);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const videoError = video && validateUploadFile(video, videoTypes);
  const thumbnailError =
    thumbnail && validateUploadFile(thumbnail, thumbnailTypes);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      submitting.current ||
      !video ||
      !thumbnail ||
      videoError ||
      thumbnailError ||
      !title.trim() ||
      !description.trim()
    ) {
      return;
    }
    submitting.current = true;
    setPending(true);
    setProgress(null);
    setError("");
    try {
      const result = await uploadVideo(
        { title, description, video, thumbnail },
        token,
        setProgress
      );
      setPublishedId(result.data._id);
      void queryClient.invalidateQueries({ queryKey: ["videos", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["studio", userId] });
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode === 403
          ? "Your account does not have permission to publish videos."
          : cause instanceof StreamlyApiError && cause.statusCode === 401
            ? "Your session expired. Sign in again before uploading."
            : "Publishing could not be confirmed. Check Creator Studio before retrying to avoid duplicates."
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (publishedId) {
    return (
      <section className="grid gap-4 rounded-card border border-[color:var(--color-border)] p-6">
        <h1 className="text-2xl font-semibold" role="status">
          Your video is published.
        </h1>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/watch/${encodeURIComponent(publishedId)}`}>
              Watch video
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/studio">Back to Studio</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form className="grid max-w-3xl gap-6" onSubmit={submit}>
      <div>
        <p className="text-sm text-periwinkle">Creator Studio</p>
        <h1 className="mt-2 text-3xl font-semibold">Publish a video</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
          Your video will become public when publishing succeeds.
        </p>
      </div>
      <fieldset
        className="grid gap-5 rounded-card border border-[color:var(--color-border)] p-5"
        disabled={pending}
      >
        <legend className="sr-only">Video details and media</legend>
        <label className="grid gap-2 rounded-card border border-dashed border-[color:var(--color-border)] p-5 text-sm">
          <Upload size={24} aria-hidden="true" />
          Video file (required)
          <input
            type="file"
            required
            accept={videoTypes.join(",")}
            aria-describedby="video-file-help"
            onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
          />
          <span id="video-file-help" className="text-sm">
            {videoError || "MP4, MPEG, MOV or WebM, up to 50 MB."}
          </span>
        </label>
        <label className="grid gap-2 text-sm">
          Thumbnail (required)
          <input
            type="file"
            required
            accept={thumbnailTypes.join(",")}
            aria-describedby="thumbnail-help"
            onChange={(event) =>
              setThumbnail(event.target.files?.[0] ?? null)
            }
          />
          <span id="thumbnail-help">
            {thumbnailError || "JPEG, PNG, GIF or WebP, up to 50 MB."}
          </span>
        </label>
        <Input
          label="Title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <label className="grid gap-2 text-sm">
          Description
          <textarea
            className="min-h-32 rounded-input border border-[color:var(--color-border)] bg-transparent p-3"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
      </fieldset>
      {pending ? (
        <div className="grid gap-2" role="status">
          <label htmlFor="upload-progress">
            {progress === 100
              ? "Files sent. Waiting for server confirmation…"
              : "Uploading media…"}
          </label>
          <progress
            id="upload-progress"
            className="w-full"
            max={100}
            value={progress ?? undefined}
          />
        </div>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <Button
        className="w-fit"
        type="submit"
        disabled={
          pending ||
          !video ||
          !thumbnail ||
          Boolean(videoError || thumbnailError) ||
          !title.trim() ||
          !description.trim()
        }
      >
        {pending ? "Publishing…" : "Publish video"}
      </Button>
    </form>
  );
}
