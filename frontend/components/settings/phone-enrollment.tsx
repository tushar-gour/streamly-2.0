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

export function PhoneEnrollment() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
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
        const result = await credentialsApi.startPhoneEnrollment({
          phoneNumber: number,
          channel,
          password,
          mfaCode: mfaCode || undefined,
        });
        setChallenge(result.data.otp.challengeId);
      } else {
        await credentialsApi.completePhoneEnrollment({
          challengeId: challenge,
          code: code.trim(),
          channel,
        });
        useAuthStore.getState().clearSession();
        publishSessionChange();
        router.replace("/login");
      }
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode < 500
          ? cause.message
          : "Phone verification is temporarily unavailable."
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
      <h3 className="font-medium">Verified phone number</h3>
      <p className="text-sm text-[color:var(--color-text-secondary)]">
        {user?.phoneNumber && user.phoneVerifiedAt
          ? "Current number: " + user.phoneNumber
          : "No verified phone number."}{" "}
        Your current number stays unchanged until verification succeeds. You
        will be signed out of all sessions after a successful change.
      </p>
      {!challenge ? (
        <>
          <Input
            id="replacement-phone"
            label="New phone number"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            required
            maxLength={40}
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            disabled={pending}
          />
          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-2 text-sm font-medium">Delivery method</legend>
            {(["sms", "whatsapp"] as const).map((method) => (
              <label key={method} className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name="phone-delivery"
                  checked={channel === method}
                  disabled={pending}
                  onChange={() => setChannel(method)}
                />
                {method === "sms" ? "SMS" : "WhatsApp"}
              </label>
            ))}
          </fieldset>
          <PasswordInput
            id="phone-change-password"
            label="Current password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
          />
          {user?.mfaEnabledAt ? (
            <Input
              id="phone-change-mfa"
              label="Authenticator code"
              autoComplete="one-time-code"
              inputMode="numeric"
              required
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
              disabled={pending}
            />
          ) : null}
        </>
      ) : (
        <>
          <p role="status">
            Enter the six-digit code sent to {number}. It expires in five minutes.
          </p>
          <Input
            id="phone-change-code"
            label="Phone verification code"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={pending}
          />
        </>
      )}
      {error ? <p role="alert">{error}</p> : null}
      <Button className="w-fit" type="submit" disabled={pending}>
        {challenge ? "Verify and change phone" : "Send phone verification code"}
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
          Cancel phone verification
        </Button>
      ) : null}
    </form>
  );
}
