import Link from "next/link";
import { Play, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/video-card";
import { featuredVideos } from "@/lib/constants/sample-content";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 md:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-8 text-sm text-[color:var(--color-text-secondary)] md:flex">
          <Link href="/explore">Explore</Link>
          <Link href="/studio">Creators</Link>
          <Link href="/login">Sign in</Link>
          <ThemeToggle />
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[rgba(24,29,43,0.62)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)]">
            <Sparkles size={16} className="text-periwinkle" />
            Premium video spaces, calmer by design
          </div>
          <h1 className="text-5xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--color-text-primary)] md:text-7xl">
            Your world,
            <span className="block text-periwinkle">in motion.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--color-text-secondary)]">
            Discover, watch, and share stories in a cinematic space that keeps
            content at the center.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Create account</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/home">Explore shell</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-[color:var(--color-text-secondary)] sm:grid-cols-3">
            {[
              "Cinematic streaming",
              "Secure sessions",
              "Creator workflows",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.58)] px-3 py-3"
              >
                <ShieldCheck size={16} className="text-periwinkle" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_50%_20%,rgba(108,92,231,0.22),transparent_55%)]" />
          <div className="relative grid gap-4 rounded-hero border border-[color:var(--color-border)] bg-[rgba(13,17,27,0.78)] p-4 shadow-glow">
            <div className="aspect-[16/7] rounded-card border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#111521,#261f56_45%,#0b1020)] p-8">
              <div className="flex h-full flex-col justify-end">
                <span className="text-sm font-medium uppercase tracking-[0.22em] text-periwinkle">
                  Featured
                </span>
                <h2 className="mt-3 max-w-sm text-4xl font-semibold leading-tight">
                  Beyond the Horizon
                </h2>
                <Button className="mt-6 w-fit" size="sm">
                  <Play size={16} />
                  Watch now
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredVideos.slice(0, 3).map((video) => (
                <VideoCard key={video.id} video={video} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
