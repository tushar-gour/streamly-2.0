import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function HistoryPage() {
  return (
    <RouteEmptyState
      eyebrow="History"
      title="No watch history yet."
      description="Videos you watch will appear here after real history data is connected."
    />
  );
}
