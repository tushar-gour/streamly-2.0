export type FieldValidationResult = Readonly<{
  isValid: boolean;
  message?: string;
}>;

export function validateEmail(value: string): FieldValidationResult {
  if (!value.trim()) {
    return { isValid: false, message: "Email is required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) {
    return { isValid: false, message: "Enter a valid email address." };
  }

  return { isValid: true };
}

export function validatePassword(value: string): FieldValidationResult {
  if (!value) {
    return { isValid: false, message: "Password is required." };
  }

  if (value.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters.",
    };
  }

  return { isValid: true };
}
