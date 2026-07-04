import { SubscriptionsPanel } from "@/components/library/subscriptions-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function SubscriptionsPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <SubscriptionsPanel />
    </AppShell>
  );
}
