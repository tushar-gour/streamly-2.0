"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { TurnstileChallenge } from "@/components/auth/turnstile-challenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authPlatformApi } from "@/lib/api/auth-platform.api";
import type { LoginMethod, LoginStep } from "@/lib/api/auth-platform.api";
import { StreamlyApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";

type Stage =
  | { kind: "credentials" }
  | { kind: "captcha"; siteKey: string }
  | { kind: "otp" | "mfa"; challengeId: string; expiresAt: string };

const titles: Record<LoginMethod, string> = {
  "email-password": "Welcome back",
  "email-otp": "Email verification",
  "phone-sms-otp": "SMS verification",
  "phone-whatsapp-otp": "WhatsApp verification",
};

export function SmartLoginForm({ method }: { method: LoginMethod }) {
  const router = useRouter();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [stage, setStage] = useState<Stage>({ kind: "credentials" });
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const isPassword = method === "email-password";
  const isEmail = isPassword || method === "email-otp";

  function restart() {
    setStage({ kind: "credentials" });
    setUseRecovery(false);
    setPassword("");
    setCode("");
    setCaptchaToken(null);
    setError("");
  }

  function handleStep(step: LoginStep) {
    setCode("");
    setCaptchaToken(null);

    if ("captchaRequired" in step && step.captchaRequired) {
      if (step.captchaProvider !== "turnstile" || !step.siteKey) {
        throw new Error("Verification provider unavailable");
      }
      setStage({ kind: "captcha", siteKey: step.siteKey });
      return;
    }

    setPassword("");
    if ("otpRequired" in step && step.otpRequired && step.otp?.challengeId) {
      setStage({
        kind: "otp",
        challengeId: step.otp.challengeId,
        expiresAt: step.otp.expiresAt,
      });
      return;
    }
    if ("mfaRequired" in step && step.mfaRequired && step.challengeId) {
      setStage({
        kind: "mfa",
        challengeId: step.challengeId,
        expiresAt: step.expiresAt,
      });
      return;
    }
    if ("user" in step && step.user?._id && step.accessToken) {
      setAuthUser(step.user, step.accessToken);
      router.replace("/home");
      return;
    }
    throw new Error("Unexpected authentication response");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (
      (stage.kind === "otp" || stage.kind === "mfa") &&
      Date.parse(stage.expiresAt) <= Date.now()
    ) {
      setError("This code has expired. Restart sign-in.");
      return;
    }
    if (stage.kind === "captcha" && !captchaToken) return;

    submitting.current = true;
    setPending(true);
    setError("");
    try {
      let step: LoginStep;
      if (stage.kind === "otp") {
        step = await authPlatformApi.verifyOtp({
          method,
          challengeId: stage.challengeId,
          code,
        });
      } else if (stage.kind === "mfa") {
        step = await authPlatformApi.verifyMfa({
          challengeId: stage.challengeId,
          code,
        });
      } else {
        step = await authPlatformApi.start({
          method,
          identifier: isEmail
            ? identifier.trim().toLowerCase()
            : identifier.replace(/\s/gu, ""),
          ...(isPassword ? { password } : {}),
          ...(captchaToken ? { captchaToken } : {}),
        });
      }
      handleStep(step);
    } catch (cause) {
      if (stage.kind === "captcha") restart();
      if (stage.kind === "credentials") setPassword("");
      setCode("");
      setError(
        cause instanceof StreamlyApiError && cause.statusCode === 429
          ? "Too many attempts. Please wait before trying again."
          : cause instanceof StreamlyApiError && cause.statusCode === 401
            ? "Sign-in could not be verified. Check your details."
            : cause instanceof StreamlyApiError && cause.code === "NETWORK"
              ? "Could not reach Streamly. Check your connection."
              : "Verification could not be completed. Check your details or restart sign-in."
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const isCode = stage.kind === "otp" || stage.kind === "mfa";
  const title =
    stage.kind === "mfa"
      ? "One quick check"
      : stage.kind === "captcha"
        ? "Quick verification"
        : stage.kind === "otp"
          ? "Enter your code"
          : titles[method];

  return (
    <AuthShell guestOnly>
      <AuthCard title={title} description="Sign in to continue to Streamly.">
        <form className="grid gap-5" onSubmit={submit}>
          {error ? (
            <p role="alert" className="text-sm">
              {error}
            </p>
          ) : null}
          {stage.kind === "credentials" ? (
            <>
              <Input
                label={isEmail ? "Email" : "Phone number"}
                type={isEmail ? "email" : "tel"}
                autoComplete={isEmail ? "email" : "tel"}
                placeholder={isEmail ? "Enter your email" : "+91 98765 43210"}
                required
                value={identifier}
                disabled={pending}
                onChange={(event) => setIdentifier(event.target.value)}
              />
              {isPassword ? (
                <PasswordInput
                  required
                  autoComplete="current-password"
                  value={password}
                  disabled={pending}
                  onChange={(event) => setPassword(event.target.value)}
                />
              ) : null}
            </>
          ) : null}
          {stage.kind === "captcha" ? (
            <TurnstileChallenge
              siteKey={stage.siteKey}
              onToken={setCaptchaToken}
            />
          ) : null}
          {isCode ? (
            <Input
              label={
                stage.kind === "mfa"
                  ? useRecovery
                    ? "Recovery code"
                    : "Authenticator code"
                  : "Verification code"
              }
              autoComplete="one-time-code"
              inputMode={
                stage.kind === "mfa" && useRecovery ? "text" : "numeric"
              }
              pattern={
                stage.kind === "mfa"
                  ? useRecovery
                    ? "[a-fA-F0-9]{32}"
                    : "[0-9]{6}"
                  : "[0-9]+"
              }
              maxLength={stage.kind === "mfa" ? (useRecovery ? 32 : 6) : 12}
              required
              value={code}
              disabled={pending}
              onChange={(event) =>
                setCode(
                  stage.kind === "mfa" && useRecovery
                    ? event.target.value.replace(/[^a-fA-F0-9]/gu, "")
                    : event.target.value.replace(/\D/gu, "")
                )
              }
            />
          ) : null}
          {stage.kind === "mfa" ? (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => {
                setCode("");
                setUseRecovery((value) => !value);
              }}
            >
              {useRecovery ? "Use authenticator code" : "Use a recovery code"}
            </Button>
          ) : null}
          <Button
            type="submit"
            size="lg"
            isLoading={pending}
            disabled={stage.kind === "captcha" && !captchaToken}
          >
            {stage.kind !== "credentials"
              ? "Verify and continue"
              : isPassword
                ? "Sign in"
                : "Send code"}
          </Button>
          {stage.kind !== "credentials" ? (
            <Button
              type="button"
              disabled={pending}
              variant="secondary"
              onClick={restart}
            >
              Restart sign-in
            </Button>
          ) : (
            <>
              {isPassword ? (
                <Link
                  href="/forgot-password"
                  className="text-sm text-periwinkle"
                >
                  Forgot password?
                </Link>
              ) : null}
              <Button asChild variant="secondary">
                <Link href={isPassword ? "/login/methods" : "/login"}>
                  {isPassword ? "Use other method" : "Use password"}
                </Link>
              </Button>
              <p className="text-center text-sm">
                New to Streamly?{" "}
                <Link href="/signup" className="text-periwinkle">
                  Create an account
                </Link>
              </p>
            </>
          )}
        </form>
      </AuthCard>
    </AuthShell>
  );
}
