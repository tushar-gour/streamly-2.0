"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { credentialsApi } from "@/lib/api/credentials.api";
import { StreamlyApiError } from "@/lib/api/errors";
import { publishSessionChange } from "@/lib/auth/session-events";
import { useAuthStore } from "@/stores/auth-store";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      if (!challenge) {
        const result = await credentialsApi.startRecovery(email);
        setChallenge(result.data.challengeId);
      } else {
        if (password !== confirmation) {
          setError("Passwords do not match.");
          return;
        }
        await credentialsApi.completeRecovery({
          challengeId: challenge,
          code: code.trim(),
          password,
        });
        useAuthStore.getState().clearSession();
        publishSessionChange();
        setDone(true);
        setPassword("");
        setConfirmation("");
        setCode("");
      }
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode < 500
          ? cause.message
          : "Recovery is temporarily unavailable. Please try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell guestOnly>
      <AuthCard
        title="Password recovery"
        description="Reset your password securely using your verified email."
      >
        {done ? (
          <p role="status">Password reset. Sign in again with your new password and existing authenticator, if enabled.</p>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            {!challenge ? (
              <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} />
            ) : (
              <>
                <p role="status">If your account is eligible, a verification code will be sent to your email. The code expires in 10 minutes.</p>
                <Input label="Verification code" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} disabled={pending} />
                <PasswordInput id="recovery-password" label="New password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} />
                <PasswordInput id="recovery-confirmation" label="Confirm new password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={pending} />
              </>
            )}
            {error ? <p role="alert">{error}</p> : null}
            <Button type="submit" disabled={pending}>{challenge ? "Reset password" : "Send verification code"}</Button>
            {challenge ? <Button type="button" variant="secondary" disabled={pending} onClick={() => { setChallenge(""); setCode(""); setError(""); }}>Start again</Button> : null}
          </form>
        )}
        <Button asChild variant="secondary" size="lg">
          <Link href="/login">Return to sign in</Link>
        </Button>
      </AuthCard>
    </AuthShell>
  );
}
