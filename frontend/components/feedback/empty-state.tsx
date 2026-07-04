import type { ReactNode } from "react";

import { LogoMark } from "@/components/brand/logo";

type EmptyStateProps = Readonly<{
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}>;

export function EmptyState({
  action,
  description,
  eyebrow,
  title,
}: EmptyStateProps) {
  return (
    <section className="max-w-md text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[rgba(141,132,255,0.1)]">
        <LogoMark className="size-9" />
      </div>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mt-3 text-[color:var(--color-text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
