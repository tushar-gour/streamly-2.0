"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Monitor, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { sessionsApi } from "@/lib/api/sessions.api";
import { formatRelativeDate } from "@/lib/media/media-formatters";
import { useAuthStore } from "@/stores/auth-store";

export function SessionSettings() {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const key = ["sessions", userId] as const;
  const query = useQuery({
    queryKey: key,
    queryFn: async () => (await sessionsApi.list(token)).data,
    enabled: Boolean(userId),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => sessionsApi.revoke(id, token),
    retry: false,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return (
    <section className="grid gap-3 border-t border-[color:var(--color-border)] pt-4">
      <div>
        <h3 className="font-medium">Active sessions</h3>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Review recent devices and remove sessions you no longer recognize.
        </p>
      </div>
      {query.isPending ? <LoadingState label="Loading active sessions" /> : null}
      {query.isError ? (
        <div role="alert" className="grid gap-2">
          <p>Could not load sessions.</p>
          <Button variant="secondary" onClick={() => void query.refetch()}>Retry</Button>
        </div>
      ) : null}
      {query.isSuccess && query.data.length === 0 ? <p className="text-sm">No active sessions were returned.</p> : null}
      <ul className="divide-y divide-[color:var(--color-border)]">
        {query.data?.map((session) => (
          <li key={session.id} className="flex flex-wrap items-center gap-3 py-3">
            {session.isCurrent ? <Shield size={20} aria-hidden="true" /> : <Monitor size={20} aria-hidden="true" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{session.isCurrent ? "Current session" : "Signed-in device"}</p>
              <p className="mt-1 break-all text-xs text-[color:var(--color-text-muted)]">{session.userAgent || "Unknown browser"}</p>
              <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">Last refreshed {formatRelativeDate(session.lastUsedAt)}</p>
            </div>
            {!session.isCurrent ? (
              <Button size="sm" variant="secondary" disabled={revoke.isPending} onClick={() => {
                if (window.confirm("Sign out this session?")) revoke.mutate(session.id);
              }}>Revoke</Button>
            ) : null}
          </li>
        ))}
      </ul>
      {revoke.isError ? <p role="alert" className="text-sm">Revocation could not be confirmed. Review the updated list.</p> : null}
      {revoke.isSuccess ? <p role="status" className="text-sm">Session revoked.</p> : null}
    </section>
  );
}
