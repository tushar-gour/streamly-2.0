import { AppShell } from "@/components/layout/app-shell";
import { AccountSettings } from "@/components/settings/account-settings";

export default function SettingsPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <section className="grid gap-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <AccountSettings />
      </section>
    </AppShell>
  );
}
