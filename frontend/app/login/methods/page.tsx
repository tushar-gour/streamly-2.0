import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { methodOptions } from "@/lib/constants/sample-content";

export default function LoginMethodsPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Choose another way"
        description="Pick a secure method to continue."
      >
        <div className="grid gap-3">
          {methodOptions.map((method) => (
            <Link
              key={method.href}
              className="group flex min-h-20 items-center justify-between rounded-card border border-[color:var(--color-border)] bg-[rgba(8,11,19,0.32)] p-4 transition hover:border-[rgba(141,132,255,0.48)]"
              href={method.href}
            >
              <span>
                <span className="block font-medium">{method.title}</span>
                <span className="mt-1 block text-sm text-[color:var(--color-text-muted)]">
                  {method.description}
                </span>
              </span>
              <ArrowRight
                size={18}
                className="text-periwinkle transition group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </AuthCard>
    </AuthShell>
  );
}
