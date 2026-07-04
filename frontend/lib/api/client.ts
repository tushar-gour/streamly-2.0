import { createApiError, createNetworkError } from "@/lib/api/errors";
import type { ApiErrorPayload, ApiResponse } from "@/lib/api/types";
import { frontendConfig } from "@/lib/config/env";

export type ApiRequestOptions = RequestInit &
  Readonly<{
    accessToken?: string | null;
  }>;

function createHeaders(options: ApiRequestOptions) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  return headers;
}

async function parseJsonPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${frontendConfig.apiBaseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: createHeaders(options),
    });
  } catch {
    throw createNetworkError();
  }

  const payload = await parseJsonPayload(response);

  if (!response.ok) {
    throw createApiError(response.status, payload as ApiErrorPayload | null);
  }

  return payload as ApiResponse<T>;
}
