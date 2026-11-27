"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bell, Search, Settings, Upload } from "lucide-react";

import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar() {
  const router = useRouter();
  const canUpload = useAuthStore((state) =>
    state.hasAnyPermission(["video:create"])
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [router]);

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-background-soft)] px-3 py-3 md:px-6">
      <div className="mx-auto flex max-w-[1500px] items-center gap-2 sm:gap-3">
        <Link
          aria-label="Search videos"
          aria-keyshortcuts="Control+K Meta+K"
          className="flex min-h-11 min-w-11 max-w-2xl flex-1 items-center justify-center gap-3 rounded-input border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-[color:var(--color-text-muted)] md:justify-start"
          href="/search"
        >
          <Search size={18} aria-hidden="true" />
          <span className="hidden text-sm sm:inline">Search videos</span>
          <kbd className="ml-auto hidden rounded-md border border-[color:var(--color-border)] px-2 py-1 text-xs md:inline">
            Ctrl / ⌘ K
          </kbd>
        </Link>
        {canUpload ? (
          <Button asChild size="sm">
            <Link href="/studio/upload" aria-label="Upload a video">
              <Upload size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Upload</span>
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="ghost" size="icon">
          <Link href="/notifications" aria-label="Notifications">
            <Bell size={18} aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="lg:hidden">
          <Link href="/settings" aria-label="Settings">
            <Settings size={18} aria-hidden="true" />
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
