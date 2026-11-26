"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { credentialsApi } from "@/lib/api/credentials.api";
import { StreamlyApiError } from "@/lib/api/errors";
import { publishSessionChange } from "@/lib/auth/session-events";
import { useAuthStore } from "@/stores/auth-store";

export function EmailChange() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      if (!challenge) {
        const result = await credentialsApi.startEmailChange({
          email,
          password,
          mfaCode: mfaCode || undefined,
        });
        setChallenge(result.data.challengeId);
      } else {
        await credentialsApi.completeEmailChange({
          challengeId: challenge,
          code: code.trim(),
        });
        useAuthStore.getState().clearSession();
        publishSessionChange();
        router.replace("/login");
      }
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode < 500
          ? cause.message
          : "Email verification is temporarily unavailable."
      );
    } finally {
      setPending(false);
      setPassword("");
      setMfaCode("");
    }
  }

  return (
    <form
      className="grid gap-4 border-t border-[color:var(--color-border)] pt-4"
      onSubmit={submit}
    >
      <h3 className="font-medium">Change email address</h3>
      <p className="text-sm text-[color:var(--color-text-secondary)]">
        Verify your new address before it replaces your current email. All
        sessions will be signed out.
      </p>
      {!challenge ? (
        <>
          <Input
            id="replacement-email"
            label="New email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending}
          />
          <PasswordInput
            id="email-change-password"
            label="Current password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
          />
          {user?.mfaEnabledAt ? (
            <Input
              id="email-change-mfa"
              label="Authenticator code"
              autoComplete="one-time-code"
              required
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
              disabled={pending}
            />
          ) : null}
        </>
      ) : (
        <>
          <p role="status">Enter the code sent to your new email address.</p>
          <Input
            id="email-change-code"
            label="Verification code"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={pending}
          />
        </>
      )}
      {error ? <p role="alert">{error}</p> : null}
      <Button className="w-fit" type="submit" disabled={pending}>
        {challenge ? "Verify and change email" : "Send verification code"}
      </Button>
      {challenge ? (
        <Button
          className="w-fit"
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setChallenge("");
            setCode("");
            setError("");
          }}
        >
          Cancel
        </Button>
      ) : null}
    </form>
  );
}
