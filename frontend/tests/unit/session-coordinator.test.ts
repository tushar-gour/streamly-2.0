import { describe, expect, it, vi } from "vitest";

import { createApiError, createNetworkError } from "@/lib/api/errors";
import { createSessionCoordinator } from "@/lib/auth/session-coordinator";

const user = { _id: "test", username: "test", email: "test@example.com" };
const unauthorized = () => createApiError(401, null);
const exclusive = <T>(work: () => Promise<T>) => work();

describe("session coordinator", () => {
  it("does not rotate a valid cookie session", async () => {
    const rotate = vi.fn();
    const recover = createSessionCoordinator({
      load: async () => user,
      rotate,
      exclusive,
    });
    expect(await recover()).toEqual({ user, accessToken: null });
    expect(rotate).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent refresh requests", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(unauthorized())
      .mockResolvedValue(user);
    const rotate = vi.fn(async () => ({ accessToken: "renewed" }));
    const recover = createSessionCoordinator({ load, rotate, exclusive });
    const first = recover();
    expect(recover()).toBe(first);
    await Promise.all([first, recover(), recover()]);
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not rotate on a network error", async () => {
    const rotate = vi.fn();
    const recover = createSessionCoordinator({
      load: async () => {
        throw createNetworkError();
      },
      rotate,
      exclusive,
    });
    await expect(recover()).rejects.toMatchObject({ code: "NETWORK" });
    expect(rotate).not.toHaveBeenCalled();
  });

  it("probes again inside a shared cross-tab lock", async () => {
    let valid = false;
    let tail: Promise<unknown> = Promise.resolve();
    const sharedLock = <T>(work: () => Promise<T>) => {
      const next = tail.then(work);
      tail = next.catch(() => undefined);
      return next;
    };
    const load = async () => {
      if (!valid) throw unauthorized();
      return user;
    };
    const rotate = vi.fn(async () => {
      valid = true;
      return { accessToken: "renewed" };
    });
    const first = createSessionCoordinator({ load, rotate, exclusive: sharedLock });
    const second = createSessionCoordinator({ load, rotate, exclusive: sharedLock });
    await Promise.all([first(), second()]);
    expect(rotate).toHaveBeenCalledTimes(1);
  });
});
