import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/lib/api/client";
import { StreamlyApiError } from "@/lib/api/errors";

afterEach(() => {
  vi.unstubAllGlobals();
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
});
