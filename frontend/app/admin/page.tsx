import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <AppShell>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
          Moderation overview
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Users", "Videos", "Reports"].map((item) => (
            <Card key={item} className="p-5">
              <ShieldCheck className="text-periwinkle" size={24} />
              <h2 className="mt-4 text-xl font-semibold">{item}</h2>
              <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                RBAC-protected shell for future administrative workflows.
              </p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
