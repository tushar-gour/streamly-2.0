import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest, configureSessionRecovery } from "@/lib/api/client";
import { StreamlyApiError } from "@/lib/api/errors";

afterEach(() => {
  vi.unstubAllGlobals();
  configureSessionRecovery({
    identity: () => undefined,
    recover: async () => false,
    changed: () => undefined,
  });
});

describe("apiRequest", () => {
  it("parses Streamly success responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            data: { ok: true },
            message: "Done",
            statusCode: 200,
            success: true,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          }
        );
      })
    );

    const response = await apiRequest<{ ok: boolean }>("/api/v1/example");

    expect(response.data.ok).toBe(true);
  });

  it("throws typed errors for failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            errors: [],
            message: "Access token is required",
            statusCode: 401,
            success: false,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 401,
          }
        );
      })
    );

    await expect(
      apiRequest("/api/v1/users/current-user")
    ).rejects.toBeInstanceOf(StreamlyApiError);
  });

  it("maps network failures safely", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      })
    );

    await expect(
      apiRequest("/api/v1/users/current-user")
    ).rejects.toMatchObject({
      code: "NETWORK",
      message: "Couldn’t reach Streamly. Check your connection and try again.",
    });
  });
  it("replays a request once only after a pre-handler expiry marker", async () => {
    const recover = vi.fn(async () => true);
    configureSessionRecovery({
      identity: () => "test",
      recover,
      changed: vi.fn(),
    });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 401,
          headers: { "X-Streamly-Session": "expired" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), {
          headers: { "content-type": "application/json" },
        })
      );
    vi.stubGlobal("fetch", fetcher);
    await apiRequest("/api/v1/playlists", {
      method: "POST",
      body: "{}",
      accessToken: "old-token",
    });
    expect(recover).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][1].headers.get("Authorization")).toBeNull();
    expect(fetcher.mock.calls[1][1].headers.get("X-Streamly-Account")).toBe(
      "test"
    );
  });

  it("never retries a stale request after the account changes", async () => {
    let account = "first";
    const recover = vi.fn(async () => {
      account = "second";
      return true;
    });
    configureSessionRecovery({
      identity: () => account,
      recover,
      changed: vi.fn(),
    });
    const fetcher = vi.fn(
      async () =>
        new Response(null, {
          status: 401,
          headers: { "X-Streamly-Session": "expired" },
        })
    );
    vi.stubGlobal("fetch", fetcher);
    await expect(apiRequest("/api/v1/playlists")).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
