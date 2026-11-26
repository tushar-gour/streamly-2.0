import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/feedback/empty-state";

export default function AdminPage() {
  return (
    <AppShell
      permission={{
        authenticated: true,
        anyPermission: ["user:admin"],
        anyRole: ["admin"],
      }}
    >
      <EmptyState
        eyebrow="Administration"
        title="Moderation is not available yet."
        description="The server does not currently expose administrative management or reporting endpoints."
      />
    </AppShell>
  );
}
