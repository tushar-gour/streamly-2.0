import { apiRequest } from "@/lib/api/client";

type Challenge = { challengeId: string };
type Confirmation = { challengeId: string; code: string };

function post<T>(path: string, body: object, guest = false) {
  return apiRequest<T>(`/api/v1/users/auth/${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    skipSessionRecovery: guest,
  });
}

export const credentialsApi = {
  startRecovery: (email: string) =>
    post<Challenge>("recovery/start", { email }, true),
  completeRecovery: (body: Confirmation & { password: string }) =>
    post<object>("recovery/complete", body, true),
  startEmailChange: (body: {
    email: string;
    password: string;
    mfaCode?: string;
  }) => post<Challenge>("email-change/start", body),
  completeEmailChange: (body: Confirmation) =>
    post<object>("email-change/complete", body),
};
