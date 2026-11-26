"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PlaylistForm({
  initialName = "",
  initialDescription = "",
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  initialDescription?: string;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: { name: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending && name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() });
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Input label="Playlist name" required maxLength={100} value={name} disabled={pending} onChange={(event) => setName(event.target.value)} />
      <label className="grid gap-2 text-sm">
        Description
        <textarea className="min-h-24 rounded-input border border-[color:var(--color-border)] bg-transparent p-3" maxLength={500} value={description} disabled={pending} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={pending} disabled={!name.trim()}>{submitLabel}</Button>
        <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
