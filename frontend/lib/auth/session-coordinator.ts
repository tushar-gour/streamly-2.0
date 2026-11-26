import { StreamlyApiError } from "@/lib/api/errors";
import type { AuthResult, CurrentUser } from "@/lib/api/types";

type SessionDependencies = Readonly<{
  load: (token?: string | null) => Promise<CurrentUser>;
  rotate: () => Promise<{ accessToken: string | null }>;
  exclusive: <T>(work: () => Promise<T>) => Promise<T>;
}>;

// A single in-flight request per tab; Web Locks serializes refresh across tabs.
export function createSessionCoordinator(dependencies: SessionDependencies) {
  let pending: Promise<AuthResult> | null = null;

  return function recover(): Promise<AuthResult> {
    if (pending) return pending;
    pending = dependencies
      .exclusive(async () => {
        try {
          // Probe after acquiring the lock: a preceding tab may have rotated.
          const user = await dependencies.load();
          return { user, accessToken: null };
        } catch (error) {
          if (
            !(error instanceof StreamlyApiError) ||
            error.statusCode !== 401
          ) {
            throw error;
          }
        }
        const { accessToken } = await dependencies.rotate();
        const user = await dependencies.load(accessToken);
        return { user, accessToken };
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  };
}

export async function withSessionLock<T>(work: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request("streamly-session-refresh", work);
  }
  return work();
}
