import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }: Readonly<{ message: string }>) {
  return (
    <div className="rounded-card border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 p-4 text-sm text-[#FFB4B4]">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} />
        {message}
      </div>
    </div>
  );
}
