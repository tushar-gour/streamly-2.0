import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/class-name";

export type VideoCardModel = Readonly<{
  id: string;
  title: string;
  creator: string;
  views: string;
  age: string;
  duration: string;
  avatar?: string | null;
  commentsLabel?: string;
  thumbnail?: string | null;
  progress?: number;
}>;

type VideoCardProps = Readonly<{
  video: VideoCardModel;
  variant?: "compact" | "large" | "history";
}>;

export function VideoCard({ video, variant = "large" }: VideoCardProps) {
  return (
    <article className="group">
      <Link
        href={`/watch/${video.id}`}
        className="block"
        aria-label={`Watch ${video.title}`}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-card border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#111521,#261f56_45%,#0b1020)] bg-cover bg-center transition duration-180 ease-streamly group-hover:-translate-y-0.5 group-hover:border-[rgba(141,132,255,0.48)]",
            variant === "compact" ? "aspect-[16/10]" : "aspect-video"
          )}
        >
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
              className="object-cover"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.68))]" />
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
        <div
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[rgba(141,132,255,0.16)] bg-cover bg-center text-sm font-semibold text-periwinkle"
          style={
            video.avatar ? { backgroundImage: `url(${video.avatar})` } : {}
          }
        >
          {video.avatar ? null : video.creator.slice(0, 2).toUpperCase()}
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
          {video.commentsLabel ? (
            <p className="text-sm text-[color:var(--color-text-muted)]">
              {video.commentsLabel}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
