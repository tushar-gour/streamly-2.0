"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  validateEmail,
  validatePassword,
} from "@/lib/validation/auth-validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailError = email ? validateEmail(email).message : undefined;
  const passwordError = password
    ? validatePassword(password).message
    : undefined;
  const isDisabled =
    !email || !password || Boolean(emailError || passwordError);

  return (
    <AuthShell>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue to Streamly"
      >
        <form className="grid gap-5">
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            value={email}
            icon={<Mail size={18} />}
            error={emailError}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            error={passwordError}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Link
            className="justify-self-end text-sm text-periwinkle"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
          <Button disabled={isDisabled} size="lg" type="button">
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
