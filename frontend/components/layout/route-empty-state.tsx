import type { ReactNode } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { AppShell } from "@/components/layout/app-shell";

type RouteEmptyStateProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}>;

export function RouteEmptyState({
  action,
  description,
  eyebrow,
  title,
}: RouteEmptyStateProps) {
  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-140px)] place-items-center">
        <EmptyState
          action={action}
          description={description}
          eyebrow={eyebrow}
          title={title}
        />
      </div>
    </AppShell>
  );
}
