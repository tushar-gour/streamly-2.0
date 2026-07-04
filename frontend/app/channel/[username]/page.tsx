import { RouteEmptyState } from "@/components/layout/route-empty-state";

type ChannelPageProps = Readonly<{
  params: Promise<{ username: string }>;
}>;

export default async function ChannelPage({ params }: ChannelPageProps) {
  await params;

  return (
    <RouteEmptyState
      eyebrow="Channel"
      title="Channel data unavailable."
      description="Public channel details will appear after channel profile data is connected."
    />
  );
}
