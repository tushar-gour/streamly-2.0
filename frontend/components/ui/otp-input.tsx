type OtpInputProps = Readonly<{
  length?: number;
  label?: string;
}>;

export function OtpInput({
  label = "Verification code",
  length = 6,
}: OtpInputProps) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm text-[color:var(--color-text-secondary)]">
        {label}
      </legend>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            aria-label={`Digit ${index + 1}`}
            inputMode="numeric"
            maxLength={1}
            className="size-12 rounded-input border border-[color:var(--color-border)] bg-[rgba(8,11,19,0.38)] text-center text-lg font-semibold text-[color:var(--color-text-primary)] outline-none transition focus:border-periwinkle focus:shadow-[0_0_0_4px_rgba(141,132,255,0.12)]"
          />
        ))}
      </div>
    </fieldset>
  );
}
