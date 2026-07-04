import { describe, expect, it } from "vitest";

import { mapAuthError, StreamlyApiError } from "@/lib/api/errors";

describe("mapAuthError", () => {
  it("does not reveal credential details", () => {
    const error = new StreamlyApiError({
      code: "UNAUTHORIZED",
      message: "User does not exist",
      statusCode: 401,
    });

    expect(mapAuthError(error)).toBe("Invalid email or password.");
  });

  it("maps rate limits", () => {
    const error = new StreamlyApiError({
      code: "RATE_LIMITED",
      message: "Too many requests",
      statusCode: 429,
    });

    expect(mapAuthError(error)).toContain("Too many attempts");
  });
});
