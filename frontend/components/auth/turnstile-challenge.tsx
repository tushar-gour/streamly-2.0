"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Turnstile = {
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ): string;
  remove(id: string): void;
};

function getTurnstile() {
  return (window as Window & { turnstile?: Turnstile }).turnstile;
}

export function TurnstileChallenge({
  siteKey,
  onToken,
}: Readonly<{
  siteKey: string;
  onToken: (token: string | null) => void;
}>) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const widget = getTurnstile();
    if (!ready || !widget || !container.current) return;

    const id = widget.render(container.current, {
      sitekey: siteKey,
      callback: (token) => {
        setFailed(false);
        onToken(token);
      },
      "expired-callback": () => onToken(null),
      "error-callback": () => {
        onToken(null);
        setFailed(true);
      },
    });

    return () => widget.remove(id);
  }, [ready, siteKey, onToken]);

  return (
    <div className="grid gap-3">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />
      <div ref={container} />
      {failed ? (
        <p role="alert">
          Verification could not load. Restart sign-in and try again.
        </p>
      ) : null}
    </div>
  );
}
