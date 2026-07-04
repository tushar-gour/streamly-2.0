import { cn } from "@/lib/utils/class-name";

export function LogoMark({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={cn("drop-shadow-[0_0_18px_rgba(108,92,231,0.35)]", className)}
      fill="none"
      viewBox="0 0 64 64"
    >
      <path
        d="M42 5C29 8 17 15 15 27c-1 7 3 12 10 15-5-8-3-16 5-21 6-4 13-7 12-16Z"
        fill="url(#streamly-a)"
      />
      <path
        d="M22 59c13-3 25-10 27-22 1-7-3-12-10-15 5 8 3 16-5 21-6 4-13 7-12 16Z"
        fill="url(#streamly-b)"
      />
      <path d="m27 25 14 8-14 8V25Z" fill="#F5F7FA" />
      <defs>
        <linearGradient id="streamly-a" x1="16" x2="44" y1="43" y2="5">
          <stop stopColor="#4D8DFF" />
          <stop offset="1" stopColor="#8D84FF" />
        </linearGradient>
        <linearGradient id="streamly-b" x1="20" x2="50" y1="59" y2="19">
          <stop stopColor="#6C5CE7" />
          <stop offset="1" stopColor="#A79CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className={compact ? "size-8" : "size-10"} />
      <div>
        <span
          className={cn(
            "block font-semibold tracking-[-0.03em]",
            compact ? "text-xl" : "text-2xl"
          )}
        >
          Streamly
        </span>
        {!compact ? (
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.28em] text-periwinkle sm:block">
            Your world, in motion.
          </span>
        ) : null}
      </div>
    </div>
  );
}
