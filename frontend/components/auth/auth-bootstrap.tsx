"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth-store";

export function AuthBootstrap() {
  const bootstrapCurrentUser = useAuthStore(
    (state) => state.bootstrapCurrentUser
  );

  useEffect(() => {
    void bootstrapCurrentUser();
  }, [bootstrapCurrentUser]);

  return null;
}
