import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

export default function WhatsAppLoginPage() {
  return (
    <AuthShell guestOnly>
      <AuthCard
        title="WhatsApp code"
        description="Code arrives on WhatsApp when available."
      >
        <div className="grid gap-5">
          <Input
            label="WhatsApp number"
            placeholder="+91 98765 43210"
            type="tel"
          />
          <OtpInput />
          <Button size="lg">Verify WhatsApp code</Button>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
