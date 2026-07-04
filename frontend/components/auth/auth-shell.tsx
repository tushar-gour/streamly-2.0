import Link from "next/link";
import type { ReactNode } from "react";
import { Play, ShieldCheck, Sparkles } from "lucide-react";

import { AuthRouteGuard } from "@/components/auth/auth-route-guard";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";

type AuthShellProps = Readonly<{
  children: ReactNode;
  guestOnly?: boolean;
}>;

export function AuthShell({ children, guestOnly = false }: AuthShellProps) {
  const shell = (
    <main className="min-h-screen overflow-hidden px-5 py-6 md:px-10">
      <nav className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <Link
            className="hidden text-sm text-[color:var(--color-text-secondary)] md:block"
            href="/explore"
          >
            Explore
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <section className="grid min-h-[calc(100vh-96px)] gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="hidden max-w-2xl lg:block">
          <h2 className="text-6xl font-semibold leading-tight tracking-[-0.04em]">
            Your world,
            <span className="block text-periwinkle">in motion.</span>
          </h2>
          <p className="mt-6 max-w-sm text-xl leading-8 text-[color:var(--color-text-secondary)]">
            Discover, watch, and share stories that move you.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[color:var(--color-text-secondary)]">
            <span className="grid size-8 place-items-center rounded-full bg-[rgba(141,132,255,0.16)]">
              <Play size={16} />
            </span>
            Watch anywhere, anytime.
          </div>
          <div className="mt-12 grid gap-3">
            {[
              ["Cinematic Streaming", "Immersive videos in stunning quality."],
              ["For Everyone", "Creators, viewers, and communities together."],
              [
                "Secure & Private",
                "Your data, your content, always protected.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex gap-3 rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.58)] p-4"
              >
                {title === "For Everyone" ? (
                  <Sparkles className="mt-1 text-periwinkle" size={18} />
                ) : (
                  <ShieldCheck className="mt-1 text-periwinkle" size={18} />
                )}
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">{children}</div>
      </section>
    </main>
  );

  if (!guestOnly) {
    return shell;
  }

  return <AuthRouteGuard guestOnly>{shell}</AuthRouteGuard>;
}
