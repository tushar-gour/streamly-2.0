import { Card } from "@/components/ui/card";

type StatCardProps = Readonly<{
  label: string;
  value: string;
  helper: string;
}>;

export function StatCard({ helper, label, value }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-[color:var(--color-text-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
        {helper}
      </p>
    </Card>
  );
}
