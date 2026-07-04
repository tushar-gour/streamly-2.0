import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export default function SignupPage() {
  return (
    <AuthShell guestOnly>
      <AuthCard
        title="Create your space"
        description="Create your space for stories in motion."
      >
        <div className="grid gap-5">
          <Input label="Full name" placeholder="Enter your name" />
          <Input label="Email" placeholder="Enter your email" type="email" />
          <PasswordInput placeholder="Create a password" />
          <Button size="lg">Create account</Button>
          <p className="text-center text-sm text-[color:var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link className="text-periwinkle" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
