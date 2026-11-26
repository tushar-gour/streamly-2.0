"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notificationsApi } from "@/lib/api/notifications.api";
import { useAuthStore } from "@/stores/auth-store";

function NotificationPanel() {
  const userId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const key = ["notifications", userId];
  const query = useQuery({
    queryKey: [...key, page],
    queryFn: async () => (await notificationsApi.list(page)).data,
    enabled: Boolean(userId),
  });
  const mark = useMutation({
    mutationFn: (id: string | null) => id ? notificationsApi.markRead(id) : notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Notifications</h1><p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Account security and channel activity{query.data ? ` · ${query.data.unread} unread` : ""}</p></div>
        <Button variant="secondary" disabled={!query.data?.unread || mark.isPending} onClick={() => mark.mutate(null)}>Mark all as read</Button>
      </header>
      {query.isPending ? <p role="status">Loading notifications…</p> : null}
      {query.isError ? <div role="alert"><p>Notifications could not be loaded.</p><Button variant="secondary" onClick={() => void query.refetch()}>Retry</Button></div> : null}
      {mark.isError ? <p role="alert">Could not mark notification as read. Try again.</p> : null}
      {query.data?.items.length === 0 ? <Card className="grid gap-2 p-8 text-center"><Bell className="mx-auto" aria-hidden="true"/><h2 className="font-medium">No notifications here</h2><p className="text-sm text-[color:var(--color-text-secondary)]">New account and channel activity will appear here.</p></Card> : null}
      {query.data?.items.map((item) => {
        const Icon = item.kind === "security" ? ShieldCheck : item.kind === "subscription" ? Users : Bell;
        return <Card key={item.id} className="flex items-start gap-4 p-4">
          <span className="rounded-input bg-[color:var(--color-surface)] p-3"><Icon size={20} aria-hidden="true"/></span>
          <div className="min-w-0 flex-1"><p className={item.readAt ? "text-sm" : "text-sm font-semibold"}>{item.message}</p><time className="mt-2 block text-xs text-[color:var(--color-text-secondary)]" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>{!item.readAt ? <Button variant="ghost" size="sm" disabled={mark.isPending} onClick={() => mark.mutate(item.id)}>Mark as read</Button> : null}</div>
          {!item.readAt ? <span className="mt-2 size-2 rounded-full bg-indigo" aria-label="Unread" /> : null}
        </Card>;
      })}
      <nav aria-label="Notification pages" className="flex items-center gap-3"><Button variant="secondary" disabled={page === 1 || query.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {page}</span><Button variant="secondary" disabled={(query.data?.items.length ?? 0) < 25 || query.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button></nav>
    </section>
  );
}

export default function NotificationsPage() {
  return <AppShell permission={{ authenticated: true }}><NotificationPanel /></AppShell>;
}
