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

  return { isValid: true };
}

export function validateNewPassword(value: string): FieldValidationResult {
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

export function validateOtp(value: string, length = 6): FieldValidationResult {
  if (!value.trim()) {
    return { isValid: false, message: "Code is required." };
  }

  if (!new RegExp(`^\\d{${length}}$`, "u").test(value)) {
    return { isValid: false, message: `Enter the ${length}-digit code.` };
  }

  return { isValid: true };
}

export function validatePhone(value: string): FieldValidationResult {
  if (!value.trim()) {
    return { isValid: false, message: "Phone number is required." };
  }

  if (!/^\+?[1-9]\d{7,14}$/u.test(value.replace(/\s|-/gu, ""))) {
    return { isValid: false, message: "Enter a valid phone number." };
  }

  return { isValid: true };
}
