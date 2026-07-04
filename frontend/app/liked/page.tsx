import { LikedVideosPanel } from "@/components/library/liked-videos-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function LikedVideosPage() {
  return (
    <AppShell permission={{ authenticated: true }}>
      <LikedVideosPanel />
    </AppShell>
  );
}
