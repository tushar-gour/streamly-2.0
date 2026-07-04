import { ShieldCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function CaptchaPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Quick verification"
        description="Smooth streaming for real people."
      >
        <div className="grid gap-5">
          <div className="grid min-h-40 place-items-center rounded-card border border-dashed border-[color:var(--color-border)] bg-[rgba(8,11,19,0.3)] text-center text-[color:var(--color-text-secondary)]">
            <div>
              <ShieldCheck className="mx-auto text-periwinkle" size={34} />
              <p className="mt-3 text-sm">Turnstile challenge placeholder</p>
            </div>
          </div>
          <Button size="lg">Verify and continue</Button>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
