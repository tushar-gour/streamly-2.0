"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error-state";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  validateEmail,
  validatePassword,
} from "@/lib/validation/auth-validation";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);

  const emailError = email ? validateEmail(email).message : undefined;
  const passwordError = password
    ? validatePassword(password).message
    : undefined;
  const isDisabled =
    !email || !password || Boolean(emailError || passwordError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);

    if (!emailResult.isValid || !passwordResult.isValid) return;

    try {
      await loginWithPassword({ email, password });
      router.replace("/home");
    } catch {
      return;
    }
  }

  return (
    <AuthShell guestOnly>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue to Streamly"
      >
        <form className="grid gap-5" onSubmit={handleSubmit}>
          {error ? <ErrorState message={error} /> : null}
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            value={email}
            icon={<Mail size={18} />}
            error={emailError}
            onChange={(event) => {
              clearAuthError();
              setEmail(event.target.value);
            }}
          />
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            error={passwordError}
            onChange={(event) => {
              clearAuthError();
              setPassword(event.target.value);
            }}
          />
          <Link
            className="justify-self-end text-sm text-periwinkle"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
          <Button disabled={isDisabled} isLoading={isLoading} size="lg">
            Sign in <ArrowRight size={18} />
          </Button>
          <Divider />
          <Button asChild variant="secondary" size="lg">
            <Link href="/login/methods">Use other method</Link>
          </Button>
          <Divider />
          <p className="text-center text-sm text-[color:var(--color-text-secondary)]">
            New to Streamly?{" "}
            <Link className="text-periwinkle" href="/signup">
              Create an account
            </Link>
          </p>
          <p className="text-center text-xs text-[color:var(--color-text-muted)]">
            Secure sign-in. Your data is protected.
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
