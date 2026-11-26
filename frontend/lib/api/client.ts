import { createApiError, createNetworkError } from "@/lib/api/errors";
import type { ApiErrorPayload, ApiResponse } from "@/lib/api/types";
import { frontendConfig } from "@/lib/config/env";

export type ApiRequestOptions = RequestInit &
  Readonly<{
    accessToken?: string | null;
    skipSessionRecovery?: boolean;
  }>;

type SessionRecovery = Readonly<{
  identity: () => string | undefined;
  recover: (expectedUserId: string) => Promise<boolean>;
  changed: () => void;
}>;

let sessionRecovery: SessionRecovery | undefined;

export function configureSessionRecovery(recovery: SessionRecovery) {
  sessionRecovery = recovery;
}

export function expectedSessionAccount() {
  return sessionRecovery?.identity();
}

function createHeaders(options: ApiRequestOptions, account?: string) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (account) headers.set("X-Streamly-Account", account);

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
  const account = options.skipSessionRecovery
    ? undefined
    : expectedSessionAccount();
  const request = { ...options };
  delete request.accessToken;
  delete request.skipSessionRecovery;
  async function send(retry = false) {
    try {
      return await fetch(`${frontendConfig.apiBaseUrl}${path}`, {
        ...request,
        credentials: "include",
        headers: createHeaders(
          retry ? { ...options, accessToken: null } : options,
          account
        ),
      });
    } catch {
      throw createNetworkError();
    }
  }

  let response = await send();
  const marker = response.headers.get("X-Streamly-Session");
  if (
    account &&
    marker === "changed" &&
    expectedSessionAccount() === account
  ) {
    sessionRecovery?.changed();
  }
  const replayable =
    request.body == null ||
    typeof request.body === "string" ||
    request.body instanceof FormData;
  if (
    account &&
    response.status === 401 &&
    marker === "expired" &&
    replayable &&
    !request.signal?.aborted &&
    (await sessionRecovery?.recover(account)) &&
    expectedSessionAccount() === account
  ) {
    response = await send(true);
    if (
      response.headers.get("X-Streamly-Session") === "changed" &&
      expectedSessionAccount() === account
    ) {
      sessionRecovery?.changed();
    }
  }

  const payload = await parseJsonPayload(response);
  if (!response.ok) {
    throw createApiError(response.status, payload as ApiErrorPayload | null);
  }
  return payload as ApiResponse<T>;
}
