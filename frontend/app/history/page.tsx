import { HistoryPanel } from "@/components/library/history-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function HistoryPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <HistoryPanel />
    </AppShell>
  );
}
