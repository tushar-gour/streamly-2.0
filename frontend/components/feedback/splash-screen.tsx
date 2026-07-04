import { LogoMark } from "@/components/brand/logo";

export function SplashScreen({
  helperText,
}: Readonly<{ helperText?: string }>) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cinematic px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(141,132,255,0.22),transparent_34rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,#05070D)]" />
      <section
        className="relative z-10 grid justify-items-center text-center"
        aria-label="Streamly is loading"
      >
        <LogoMark className="size-36 md:size-44" />
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
          Streamly
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.34em] text-periwinkle">
          Your world, in motion.
        </p>
        <div className="mt-24 flex gap-4">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-3 rounded-full bg-periwinkle opacity-40"
              style={{
                animation: `streamly-shimmer 1400ms ${dot * 160}ms infinite`,
              }}
            />
          ))}
        </div>
        {helperText ? (
          <p className="mt-5 text-sm text-[color:var(--color-text-muted)]">
            {helperText}
          </p>
        ) : null}
      </section>
    </main>
  );
}
