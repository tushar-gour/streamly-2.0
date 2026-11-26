"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { profileApi } from "@/lib/api/profile.api";
import { safeMediaUrl } from "@/lib/media/media-formatters";
import { thumbnailTypes } from "@/lib/validation/video-upload";
import { useAuthStore } from "@/stores/auth-store";

type ImageKind = "avatar" | "coverImage";

function ImageEditor({
  kind,
  image,
  label,
}: {
  kind: ImageKind;
  image?: string;
  label: string;
}) {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function choose(next: File | undefined) {
    setFeedback(null);
    if (!next) return;
    if (
      !thumbnailTypes.some((type) => type === next.type) ||
      next.size === 0 ||
      next.size > 10 * 1024 * 1024
    ) {
      setFile(null);
      setFeedback({
        text: "Choose a JPEG, PNG, GIF or WebP image up to 10 MB.",
        error: true,
      });
      return;
    }
    setFile(next);
  }

  async function save() {
    if (!file || pending || !userId) return;
    setPending(true);
    setFeedback(null);
    try {
      const result = await profileApi.updateImage(kind, file, token);
      const state = useAuthStore.getState();
      if (state.user?._id === userId && result.data._id === userId) {
        state.setAuthUser({ ...state.user, ...result.data }, state.accessToken);
        setFile(null);
        setFeedback({ text: label + " updated.", error: false });
      }
    } catch {
      setFeedback({ text: "Image upload failed. Try again.", error: true });
    } finally {
      setPending(false);
    }
  }

  const url = preview ?? safeMediaUrl(image);
  return (
    <div className="grid gap-3 rounded-card border border-[color:var(--color-border)] p-4">
      <div
        className={
          kind === "avatar"
            ? "size-24 rounded-full bg-[color:var(--color-surface-elevated)] bg-cover bg-center"
            : "aspect-[4/1] w-full rounded-input bg-[color:var(--color-surface-elevated)] bg-cover bg-center"
        }
        style={url ? { backgroundImage: `url("${url}")` } : undefined}
        role="img"
        aria-label={label + " preview"}
      />
      <label className="grid gap-2 text-sm font-medium">
        {label}
        <input
          type="file"
          accept={thumbnailTypes.join(",")}
          disabled={pending}
          className="w-full min-w-0 text-sm file:mr-3 file:rounded-input file:border-0 file:bg-[color:var(--color-surface-elevated)] file:px-3 file:py-2 file:text-[color:var(--color-text-primary)]"
          onChange={(event) => {
            choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {file ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" isLoading={pending} onClick={() => void save()}>
            Save {label.toLowerCase()}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => setFile(null)}
          >
            Cancel
          </Button>
        </div>
      ) : null}
      {feedback ? (
        <p
          role={feedback.error ? "alert" : "status"}
          className={
            feedback.error ? "text-sm text-[color:var(--color-error)]" : "text-sm"
          }
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}

export function ProfileImages() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  return (
    <div className="grid gap-3">
      <ImageEditor kind="avatar" image={user.avatar} label="Profile photo" />
      <ImageEditor
        kind="coverImage"
        image={user.coverImage}
        label="Cover image"
      />
    </div>
  );
}
