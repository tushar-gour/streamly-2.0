import { AppShell } from "@/components/layout/app-shell";
import { PlaylistDetailPanel } from "@/components/playlists/playlist-detail-panel";

type PlaylistDetailPageProps = Readonly<{
  params: Promise<{ playlistId: string }>;
}>;

export default async function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { playlistId } = await params;

  return (
    <AppShell permission={{ authenticated: true }}>
      <PlaylistDetailPanel playlistId={playlistId} />
    </AppShell>
  );
}
