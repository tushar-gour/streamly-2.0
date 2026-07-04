import { describe, expect, it } from "vitest";

import {
  validateEmail,
  validateOtp,
  validatePassword,
  validatePhone,
} from "@/lib/validation/auth-validation";

describe("auth validation", () => {
  it("accepts valid email", () => {
    expect(validateEmail("user@example.com").isValid).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(validateEmail("not-email").isValid).toBe(false);
  });

  it("requires password for login", () => {
    expect(validatePassword("").message).toBe("Password is required.");
  });

  it("validates OTP length", () => {
    expect(validateOtp("123456").isValid).toBe(true);
    expect(validateOtp("123").isValid).toBe(false);
  });

  it("validates phone shape", () => {
    expect(validatePhone("+91 98765 43210").isValid).toBe(true);
    expect(validatePhone("123").isValid).toBe(false);
  });
});
