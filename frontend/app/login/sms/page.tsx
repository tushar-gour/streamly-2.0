import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

export default function SmsLoginPage() {
  return (
    <AuthShell guestOnly>
      <AuthCard
        title="SMS verification"
        description="Receive a secure code on your phone."
      >
        <div className="grid gap-5">
          <Input
            label="Phone number"
            placeholder="+91 98765 43210"
            type="tel"
          />
          <OtpInput />
          <Button size="lg">Verify SMS code</Button>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
