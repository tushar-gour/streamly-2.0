import type { ReactNode } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import type { RoutePermission } from "@/lib/auth/auth.types";

type RouteEmptyStateProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  permission?: RoutePermission;
}>;

export function RouteEmptyState({
  action,
  description,
  eyebrow,
  permission,
  title,
}: RouteEmptyStateProps) {
  return (
    <AppShell permission={permission}>
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
