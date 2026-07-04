import { Lock, Palette, User } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "Profile",
    description: "Avatar, cover, handle, and bio.",
    icon: User,
  },
  {
    title: "Security",
    description: "MFA, sessions, password, and trusted device.",
    icon: Lock,
  },
  {
    title: "Theme",
    description: "Dark, light, and system appearance.",
    icon: Palette,
  },
] as const;

export default function SettingsPage() {
  return (
    <AppShell>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-periwinkle">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">
          Account control center
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sections.map(({ description, icon: Icon, title }) => (
            <Card key={title} className="p-5">
              <Icon className="text-periwinkle" size={24} />
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
