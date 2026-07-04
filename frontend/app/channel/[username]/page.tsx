import { ChannelProfilePanel } from "@/components/channel/channel-profile-panel";
import { AppShell } from "@/components/layout/app-shell";

type ChannelPageProps = Readonly<{
  params: Promise<{ username: string }>;
}>;

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { username } = await params;

  return (
    <AppShell permission={{ authenticated: true }}>
      <ChannelProfilePanel username={username} />
    </AppShell>
  );
}
