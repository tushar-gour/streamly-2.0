export type ApiResponse<T> = Readonly<{
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}>;

export type ApiErrorPayload = Readonly<{
  success: false;
  message: string;
  errors?: unknown[];
}>;

export type CurrentUser = Readonly<{
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
}>;

export type AuthTokens = Readonly<{
  accessToken?: string;
  refreshToken?: string;
}>;

export type LoginPayload = Readonly<{
  email: string;
  password: string;
}>;
