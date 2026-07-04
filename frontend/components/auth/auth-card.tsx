import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type AuthCardProps = Readonly<{
  title: string;
  description: string;
  children: ReactNode;
}>;

export function AuthCard({ children, description, title }: AuthCardProps) {
  return (
    <Card className="w-full max-w-xl p-6 md:p-10">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 text-[color:var(--color-text-secondary)]">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </Card>
  );
}
