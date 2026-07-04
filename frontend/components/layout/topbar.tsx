import Link from "next/link";
import { Bell, Command, Search, Upload } from "lucide-react";

import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[rgba(8,11,19,0.82)] px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4">
        <div className="hidden min-h-11 max-w-2xl flex-1 items-center gap-3 rounded-input border border-[color:var(--color-border)] bg-[rgba(13,17,27,0.82)] px-4 text-[color:var(--color-text-muted)] md:flex">
          <Search size={18} />
          <span className="text-sm">
            Search for videos, creators, playlists...
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-[color:var(--color-border)] px-2 py-1 text-xs">
            <Command size={12} /> K
          </span>
        </div>
        <Button asChild size="sm">
          <Link href="/studio/upload">
            <Upload size={16} />
            Upload
          </Link>
        </Button>
        <IconButton icon={<Bell size={18} />} label="Notifications" />
        <ThemeToggle />
      </div>
    </header>
  );
}
