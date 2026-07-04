import Link from "next/link";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/class-name";

export type VideoSummary = Readonly<{
  id: string;
  title: string;
  creator: string;
  views: string;
  age: string;
  duration: string;
  accent: string;
  progress?: number;
}>;

type VideoCardProps = Readonly<{
  video: VideoSummary;
  variant?: "compact" | "large" | "history";
}>;

export function VideoCard({ video, variant = "large" }: VideoCardProps) {
  return (
    <article className="group">
      <Link href={`/watch/${video.id}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-card border border-[color:var(--color-border)] bg-gradient-to-br transition duration-180 ease-streamly group-hover:-translate-y-0.5 group-hover:border-[rgba(141,132,255,0.48)]",
            video.accent,
            variant === "compact" ? "aspect-[16/10]" : "aspect-video"
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.2),transparent_22%),linear-gradient(180deg,transparent,rgba(0,0,0,0.68))]" />
          <Badge className="absolute bottom-3 right-3 bg-black/50 text-white">
            {video.duration}
          </Badge>
          {video.progress ? (
            <div className="absolute inset-x-4 bottom-2 h-1 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-periwinkle"
                style={{ width: `${video.progress}%` }}
              />
            </div>
          ) : null}
        </div>
      </Link>
      <div className="mt-3 flex gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[rgba(141,132,255,0.16)] text-sm font-semibold text-periwinkle">
          {video.creator.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/watch/${video.id}`}
            className="line-clamp-2 font-medium leading-snug"
          >
            {video.title}
          </Link>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            {video.creator}
          </p>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {video.views} • {video.age}
          </p>
        </div>
        <button
          aria-label="Video actions"
          className="text-[color:var(--color-text-muted)]"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </article>
  );
}
