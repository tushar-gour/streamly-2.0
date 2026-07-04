import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/stores/auth-store";

const user = {
  _id: "user_1",
  email: "user@example.com",
  fullName: "Streamly User",
  permissions: ["user:read:self"],
  roles: ["user"],
  username: "streamly-user",
};

function resetStore() {
  useAuthStore.setState({
    accessToken: null,
    error: null,
    isAuthenticated: false,
    isBootstrapping: false,
    isLoading: false,
    status: "anonymous",
    user: null,
  });
}

afterEach(() => {
  resetStore();
  vi.unstubAllGlobals();
});

describe("auth store", () => {
  it("sets authenticated state after password login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            data: { accessToken: "access-token", user },
            message: "Logged in",
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

    await useAuthStore
      .getState()
      .loginWithPassword({ email: user.email, password: "secret" });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("access-token");
  });

  it("clears state after logout", async () => {
    useAuthStore.setState({
      accessToken: "access-token",
      isAuthenticated: true,
      status: "authenticated",
      user,
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            data: {},
            message: "Logged out",
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

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
