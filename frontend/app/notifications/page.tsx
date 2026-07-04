import { RouteEmptyState } from "@/components/layout/route-empty-state";

export default function NotificationsPage() {
  return (
    <RouteEmptyState
      permission={{ authenticated: true }}
      eyebrow="Notifications"
      title="No notifications yet."
      description="Security, creator, and activity notifications will appear after real notification data is connected."
    />
  );
}
