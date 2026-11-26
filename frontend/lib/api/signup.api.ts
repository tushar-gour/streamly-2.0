import { apiRequest } from "@/lib/api/client";

export type SignupDetails = Readonly<{
  fullName: string;
  username: string;
  email: string;
  password: string;
}>;

async function post<T>(path: string, payload: object, token?: string) {
  const result = await apiRequest<T>(`/api/v1/users/auth/signup/${path}`, {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken: token,
  });
  if (!result?.success || !result.data) {
    throw new Error("Invalid registration response");
  }
  return result.data;
}

export const signupApi = {
  start(details: SignupDetails) {
    return post<{ otp: { challengeId: string; expiresAt: string } }>(
      "start",
      details
    );
  },
  verifyEmail(challengeId: string, code: string) {
    return post<{ onboardingToken: string }>("verify-email", {
      challengeId,
      code,
    });
  },
  setupMfa(token: string) {
    return post<{ otpauthUrl: string }>("mfa/setup", {}, token);
  },
  verifyMfa(token: string, code: string) {
    return post<{ mfaEnabled: boolean }>("mfa/verify", { code }, token);
  },
};
