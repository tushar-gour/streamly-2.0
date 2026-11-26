import { apiRequest } from "@/lib/api/client";
import type { AuthenticatedUserPayload } from "@/lib/api/types";

export type LoginMethod =
  "email-password" | "email-otp" | "phone-sms-otp" | "phone-whatsapp-otp";

export type LoginStep =
  | { captchaRequired: true; captchaProvider: string; siteKey: string }
  | {
      otpRequired: true;
      otp: { challengeId: string; expiresAt: string };
    }
  | { mfaRequired: true; challengeId: string; expiresAt: string }
  | AuthenticatedUserPayload;

async function post(path: string, payload: object) {
  const result = await apiRequest<LoginStep>(
    `/api/v1/users/auth/login/${path}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      skipSessionRecovery: true,
    }
  );
  if (!result?.success || !result.data) {
    throw new Error("Invalid authentication response");
  }
  return result.data;
}

export const authPlatformApi = {
  start(payload: {
    method: LoginMethod;
    identifier: string;
    password?: string;
    captchaToken?: string;
  }) {
    return post("start", payload);
  },
  verifyOtp(payload: {
    method: LoginMethod;
    challengeId: string;
    code: string;
  }) {
    return post("verify-otp", payload);
  },
  verifyMfa(payload: { challengeId: string; code: string }) {
    return post("verify-mfa", payload);
  },
};
