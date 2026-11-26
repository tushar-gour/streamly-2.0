import { apiRequest } from "@/lib/api/client";

export type ActiveSession = Readonly<{
  id: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}>;

export const sessionsApi = {
  list(accessToken: string | null) {
    return apiRequest<ActiveSession[]>("/api/v1/users/sessions", {
      accessToken,
    });
  },
  revoke(id: string, accessToken: string | null) {
    return apiRequest<unknown>(
      `/api/v1/users/sessions/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        accessToken,
      }
    );
  },
};
