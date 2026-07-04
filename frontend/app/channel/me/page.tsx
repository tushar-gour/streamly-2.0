import { AppShell } from "@/components/layout/app-shell";
import { CurrentProfilePanel } from "@/components/profile/current-profile-panel";

export default function CurrentChannelPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <CurrentProfilePanel />
    </AppShell>
  );
}
