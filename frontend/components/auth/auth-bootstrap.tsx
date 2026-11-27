"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { SESSION_EVENT_KEY } from "@/lib/auth/session-events";

export function AuthBootstrap() {
  const bootstrapCurrentUser = useAuthStore(
    (state) => state.bootstrapCurrentUser
  );

  useEffect(() => {
    void bootstrapCurrentUser();
    function onSessionChange(event: StorageEvent) {
      if (event.key !== SESSION_EVENT_KEY) return;
      useAuthStore.getState().clearSession();
      void bootstrapCurrentUser();
    }
    window.addEventListener("storage", onSessionChange);
    return () => window.removeEventListener("storage", onSessionChange);
  }, [bootstrapCurrentUser]);

  return null;
}
