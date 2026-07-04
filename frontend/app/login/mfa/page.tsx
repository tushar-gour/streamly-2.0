import { ShieldCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";

export default function MfaPage() {
  return (
    <AuthShell>
      <AuthCard
        title="One quick check"
        description="Keep your account protected with your authenticator code."
      >
        <div className="grid gap-5">
          <div className="grid justify-items-center rounded-card border border-[color:var(--color-border)] bg-[rgba(141,132,255,0.08)] p-5">
            <ShieldCheck size={38} className="text-periwinkle" />
            <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
              We will remember this device for 30 minutes when trusted.
            </p>
          </div>
          <OtpInput label="Authenticator code" />
          <Button size="lg">Verify</Button>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
