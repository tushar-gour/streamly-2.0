import { AppShell } from "@/components/layout/app-shell";
import { UploadForm } from "@/components/studio/upload-form";

export default function UploadPage() {
  return (
    <AppShell
      permission={{ authenticated: true, anyPermission: ["video:create"] }}
    >
      <UploadForm />
    </AppShell>
  );
}
