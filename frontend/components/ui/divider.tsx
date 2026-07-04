export function Divider({ label = "or" }: Readonly<{ label?: string }>) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-[color:var(--color-text-muted)]">
      <span className="h-px bg-[color:var(--color-border)]" />
      <span>{label}</span>
      <span className="h-px bg-[color:var(--color-border)]" />
    </div>
  );
}
