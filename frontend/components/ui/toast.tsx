export function Toast({ message }: Readonly<{ message: string }>) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[color:var(--color-border)] bg-elevated px-4 py-3 text-sm shadow-soft">
      {message}
    </div>
  );
}
