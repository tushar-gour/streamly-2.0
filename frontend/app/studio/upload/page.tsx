import { Upload } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid min-h-[420px] place-items-center rounded-hero border border-dashed border-[rgba(141,132,255,0.35)] bg-[rgba(17,21,33,0.66)] p-8 text-center">
          <div>
            <Upload className="mx-auto text-periwinkle" size={42} />
            <h1 className="mt-5 text-3xl font-semibold">
              Drop your video here.
            </h1>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              We will keep the flow moving.
            </p>
            <Button className="mt-6">Select file</Button>
          </div>
        </div>
        <aside className="rounded-card border border-[color:var(--color-border)] bg-[rgba(17,21,33,0.72)] p-5">
          <h2 className="font-semibold">Publishing sequence</h2>
          <ol className="mt-4 grid gap-3 text-sm text-[color:var(--color-text-secondary)]">
            <li>Select file</li>
            <li>Uploading</li>
            <li>Processing</li>
            <li>Details</li>
            <li>Visibility</li>
            <li>Publish</li>
          </ol>
        </aside>
      </section>
    </AppShell>
  );
}
