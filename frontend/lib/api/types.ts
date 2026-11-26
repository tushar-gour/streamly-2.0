export type ApiResponse<T> = Readonly<{
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
  meta?: Record<string, unknown>;
}>;

export type ApiErrorPayload = Readonly<{
  success: false;
  statusCode?: number;
  message?: string;
  errors?: unknown[];
  timestamp?: string;
}>;

export type CurrentUser = Readonly<{
  _id: string;
  id?: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  coverImage?: string;
  mfaEnabledAt?: string | null;
  roles?: string[];
  permissions?: string[];
}>;

export type AuthTokens = Readonly<{
  accessToken?: string;
  refreshToken?: string;
}>;

export type AuthenticatedUserPayload = Readonly<{
  user: CurrentUser;
  accessToken?: string;
  refreshToken?: string;
}>;

export type LoginPayload = Readonly<{
  email: string;
  password: string;
}>;

export type AuthResult = Readonly<{
  user: CurrentUser;
  accessToken: string | null;
}>;
