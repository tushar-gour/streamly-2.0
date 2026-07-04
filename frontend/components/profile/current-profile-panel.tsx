"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { safeMediaUrl } from "@/lib/media/media-formatters";
import { useAuthStore } from "@/stores/auth-store";

export function CurrentProfilePanel() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const avatar = safeMediaUrl(user.avatar);
  const coverImage = safeMediaUrl(user.coverImage);

  return (
    <section className="grid gap-6">
      <div
        className="h-48 rounded-hero border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#111521,#261f56_45%,#0b1020)] bg-cover bg-center"
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : {}}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <div
            className="grid size-24 place-items-center rounded-full border border-[color:var(--color-border)] bg-[rgba(141,132,255,0.16)] bg-cover bg-center text-3xl font-semibold text-periwinkle"
            style={avatar ? { backgroundImage: `url(${avatar})` } : {}}
          >
            {avatar ? null : user.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              {user.fullName || user.username}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              @{user.username} · {user.email}
            </p>
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href="/settings">
            <Settings size={16} />
            Settings
          </Link>
        </Button>
      </div>
    </section>
  );
}
