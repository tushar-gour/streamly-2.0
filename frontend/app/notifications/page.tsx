import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function NotificationsPage() {
  return (
    <RouteEmptyState
      permission={{ authenticated: true }}
      eyebrow="Notifications"
      title="Notifications are not available yet."
      description="Activity and security notifications are not supported by the current service."
    />
  );
}
