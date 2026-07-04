import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

export default function EmailOtpPage() {
  return (
    <AuthShell guestOnly>
      <AuthCard
        title="Email code"
        description="We will send a short code to your email."
      >
        <div className="grid gap-5">
          <Input label="Email" placeholder="Enter your email" type="email" />
          <OtpInput />
          <Button size="lg">Verify code</Button>
          <p className="text-center text-sm text-[color:var(--color-text-muted)]">
            Send again in 42s
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
