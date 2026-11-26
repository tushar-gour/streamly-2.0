"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  useEffect(() => {
    function reconnect() {
      window.location.replace("/home");
    }
    window.addEventListener("online", reconnect);
    return () => window.removeEventListener("online", reconnect);
  }, []);

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <EmptyState
        title="You are offline."
        description="We will reconnect when the signal returns."
        action={
          <Button onClick={() => window.location.replace("/home")}>
            <WifiOff size={16} />
            Retry
          </Button>
        }
      />
    </main>
  );
}
