import type { ApiErrorPayload } from "@/lib/api/types";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NETWORK"
  | "UNKNOWN";

const statusCodeMap: Record<number, ApiErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
};

export class StreamlyApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number;
  readonly errors: unknown[];

  constructor({
    code,
    errors = [],
    message,
    statusCode,
  }: Readonly<{
    code: ApiErrorCode;
    errors?: unknown[];
    message: string;
    statusCode: number;
  }>) {
    super(message);
    this.name = "StreamlyApiError";
    this.code = code;
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

export function createApiError(
  statusCode: number,
  payload: ApiErrorPayload | null
) {
  const message =
    typeof payload?.message === "string"
      ? payload.message
      : "Something paused unexpectedly. Please try again.";

  return new StreamlyApiError({
    code: statusCodeMap[statusCode] ?? "UNKNOWN",
    errors: payload?.errors ?? [],
    message,
    statusCode,
  });
}

export function createNetworkError() {
  return new StreamlyApiError({
    code: "NETWORK",
    message: "Couldn’t reach Streamly. Check your connection and try again.",
    statusCode: 0,
  });
}

export function mapAuthError(error: unknown) {
  if (!(error instanceof StreamlyApiError)) {
    return "Something paused unexpectedly. Please try again.";
  }

  if (error.code === "NETWORK") {
    return "Couldn’t reach Streamly. Check your connection and try again.";
  }

  if (error.statusCode === 401) {
    return "Invalid email or password.";
  }

  if (error.statusCode === 403) {
    return "You do not have access to this area.";
  }

  if (error.statusCode === 429) {
    return "Too many attempts. Please wait before trying again.";
  }

  return "Something paused unexpectedly. Please try again.";
}

export function mapSessionError(error: unknown) {
  if (error instanceof StreamlyApiError && error.statusCode === 401) {
    return "Your session expired. Please sign in again.";
  }

  return mapAuthError(error);
}
