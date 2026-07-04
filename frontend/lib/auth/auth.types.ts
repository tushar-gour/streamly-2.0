import type { CurrentUser } from "@/lib/api/api.types";

export type AuthStatus = "anonymous" | "partial" | "authenticated";

export type AuthSession = Readonly<{
  status: AuthStatus;
  user: CurrentUser | null;
  accessToken: string | null;
}>;

export type RoutePermission = Readonly<{
  authenticated?: boolean;
  anyPermission?: readonly string[];
  anyRole?: readonly string[];
}>;
