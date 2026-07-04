import { PlaylistsPanel } from "@/components/library/playlists-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function PlaylistsPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <PlaylistsPanel />
    </AppShell>
  );
}
