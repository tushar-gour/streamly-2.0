import { AppShell } from "@/components/layout/app-shell";
import { WatchLaterPanel } from "@/components/library/watch-later-panel";

export default function WatchLaterPage() {
  return <AppShell permission={{ authenticated: true }}><WatchLaterPanel /></AppShell>;
}
