export function Progress({ value }: Readonly<{ value: number }>) {
  const boundedValue = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[rgba(154,162,179,0.16)]">
      <div
        className="h-full rounded-full bg-periwinkle transition-all duration-260 ease-streamly"
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  );
}
