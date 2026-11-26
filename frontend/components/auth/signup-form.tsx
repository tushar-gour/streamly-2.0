"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signupApi } from "@/lib/api/signup.api";
import { StreamlyApiError } from "@/lib/api/errors";

type Stage =
  | { kind: "details" }
  | { kind: "email"; challengeId: string; expiresAt: string }
  | { kind: "setup"; token: string }
  | { kind: "mfa"; token: string; secret: string; uri: string }
  | { kind: "complete" };

export function SignupForm() {
  const [stage, setStage] = useState<Stage>({ kind: "details" });
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  function restart() {
    setStage({ kind: "details" });
    setPassword("");
    setCode("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      if (stage.kind === "details") {
        const result = await signupApi.start({
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
        });
        if (!result.otp?.challengeId) throw new Error("Missing challenge");
        setStage({ kind: "email", ...result.otp });
        setPassword("");
      } else if (stage.kind === "email") {
        if (Date.parse(stage.expiresAt) <= Date.now()) {
          setError("This code expired. Restart to request a new one.");
          return;
        }
        const result = await signupApi.verifyEmail(stage.challengeId, code);
        if (!result.onboardingToken) throw new Error("Missing credential");
        setStage({ kind: "setup", token: result.onboardingToken });
        setCode("");
      } else if (stage.kind === "setup") {
        const result = await signupApi.setupMfa(stage.token);
        const uri = new URL(result.otpauthUrl);
        const secret = uri.searchParams.get("secret");
        if (uri.protocol !== "otpauth:" || uri.hostname !== "totp" || !secret) {
          throw new Error("Invalid authenticator setup");
        }
        setStage({
          kind: "mfa",
          token: stage.token,
          secret,
          uri: result.otpauthUrl,
        });
      } else if (stage.kind === "mfa") {
        const result = await signupApi.verifyMfa(stage.token, code);
        if (!result.mfaEnabled) throw new Error("MFA not enabled");
        setCode("");
        setStage({ kind: "complete" });
      }
    } catch (cause) {
      setCode("");
      setError(
        cause instanceof StreamlyApiError && cause.statusCode === 503
          ? "Registration is temporarily unavailable."
          : cause instanceof StreamlyApiError && cause.statusCode === 409
            ? "These account details cannot be used. Sign in or try again."
            : cause instanceof StreamlyApiError && cause.statusCode === 429
              ? "Too many attempts. Try again later."
              : "This step could not be confirmed. Check your details or restart."
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const copy = {
    details: ["Create your space", "Create or resume your Streamly account."],
    email: ["Verify your email", "Enter the code sent to your email address."],
    setup: ["Protect your account", "Set up an authenticator app to continue."],
    mfa: [
      "Connect your authenticator",
      "Add Streamly to your app, then enter its code.",
    ],
    complete: [
      "Your account is ready",
      "Sign in using your new account and authenticator.",
    ],
  } as const;
  const [title, description] = copy[stage.kind];

  return (
    <AuthShell guestOnly>
      <AuthCard title={title} description={description}>
        {stage.kind === "complete" ? (
          <Button asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        ) : (
          <form className="grid gap-5" onSubmit={submit}>
            {error ? (
              <p role="alert" className="text-sm">
                {error}
              </p>
            ) : null}
            <fieldset className="grid gap-4" disabled={pending}>
              <legend className="sr-only">{title}</legend>
              {stage.kind === "details" ? (
                <>
                  <Input
                    label="Full name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Input
                    label="Username"
                    autoComplete="username"
                    required
                    pattern="[A-Za-z0-9_\-]{3,30}"
                    minLength={3}
                    maxLength={30}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <PasswordInput
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              ) : null}
              {stage.kind === "setup" ? (
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  Use a trusted authenticator app such as Google Authenticator,
                  Microsoft Authenticator or 1Password. Do not share your setup
                  key.
                </p>
              ) : null}
              {stage.kind === "mfa" ? (
                <div className="grid gap-3 rounded-card border border-[color:var(--color-border)] p-4">
                  <p className="text-sm">Manual setup key (time-based)</p>
                  <code className="break-all text-sm select-all">
                    {stage.secret}
                  </code>
                  <a
                    className="text-sm text-periwinkle underline"
                    href={stage.uri}
                  >
                    Open authenticator app
                  </a>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Keep this key private. It will not be shown again after
                    setup.
                  </p>
                </div>
              ) : null}
              {stage.kind === "email" || stage.kind === "mfa" ? (
                <Input
                  label={
                    stage.kind === "email" ? "Email code" : "Authenticator code"
                  }
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern={stage.kind === "mfa" ? "[0-9]{6}" : "[0-9]+"}
                  maxLength={stage.kind === "mfa" ? 6 : 12}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/gu, ""))}
                />
              ) : null}
            </fieldset>
            <Button type="submit" size="lg" isLoading={pending}>
              {stage.kind === "details"
                ? "Continue"
                : stage.kind === "setup"
                  ? "Create setup key"
                  : "Verify and continue"}
            </Button>
            {stage.kind !== "details" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={restart}
              >
                Restart registration
              </Button>
            ) : (
              <p className="text-center text-sm">
                Already registered?{" "}
                <Link className="text-periwinkle" href="/login">
                  Sign in
                </Link>
              </p>
            )}
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
