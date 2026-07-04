import { AppShell } from "@/components/layout/app-shell";
import { VideoWatchPanel } from "@/components/video/video-watch-panel";

type WatchPageProps = Readonly<{
  params: Promise<{ videoId: string }>;
}>;

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;

  return (
    <AppShell>
      <VideoWatchPanel videoId={videoId} />
    </AppShell>
  );
}
