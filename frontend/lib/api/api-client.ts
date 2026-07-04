import { frontendConfig } from "@/lib/config/env";

type RequestOptions = RequestInit & Readonly<{ accessToken?: string }>;

export class ApiClientError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${frontendConfig.apiBaseUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Something paused unexpectedly. Please try again.";
    throw new ApiClientError(message, response.status);
  }

  return payload as T;
}
