import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function Modal({
  children,
  title,
}: Readonly<{ children: ReactNode; title: string }>) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <Card className="w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
      </Card>
    </div>
  );
}
