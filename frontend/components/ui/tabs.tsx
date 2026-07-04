type TabItem = Readonly<{
  label: string;
  isActive?: boolean;
}>;

export function Tabs({ items }: Readonly<{ items: readonly TabItem[] }>) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {items.map((item) => (
        <button
          key={item.label}
          className={
            item.isActive
              ? "rounded-input bg-indigo px-4 py-2 text-sm font-medium text-white"
              : "rounded-input border border-[color:var(--color-border)] bg-[rgba(24,29,43,0.58)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)]"
          }
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
