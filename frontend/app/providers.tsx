"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AuthBootstrap } from "@/components/auth/auth-bootstrap";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { useAuthStore } from "@/stores/auth-store";

type AppProvidersProps = Readonly<{
  children: React.ReactNode;
}>;

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      })
  );

  useEffect(
    () =>
      useAuthStore.subscribe((next, previous) => {
        if (next.user?._id !== previous.user?._id) {
          queryClient.clear();
        }
      }),
    [queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthBootstrap />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
