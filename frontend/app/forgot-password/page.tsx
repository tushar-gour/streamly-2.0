import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <AuthShell guestOnly>
      <AuthCard
        title="Password recovery"
        description="This flow is prepared for a backend reset endpoint."
      >
        <div className="grid gap-5">
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Password reset is not available until the backend exposes a reset
            route.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/login">Return to sign in</Link>
          </Button>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
