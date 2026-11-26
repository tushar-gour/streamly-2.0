import { AppShell } from "@/components/layout/app-shell";
import { UploadPanel } from "@/components/studio/upload-panel";

export default function UploadPage() {
  return (
    <AppShell
      permission={{ authenticated: true, anyPermission: ["video:create"] }}
    >
      <UploadPanel />
    </AppShell>
  );
}
