"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SessionSettings } from "@/components/settings/session-settings";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { profileApi } from "@/lib/api/profile.api";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/lib/theme/theme-provider";

export function AccountSettings() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const logoutAll = useAuthStore((state) => state.logoutAll);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(user?.fullName ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    error: boolean;
  } | null>(null);

  async function perform(action: () => Promise<void>, success: string) {
    if (pending) return;
    setPending(true);
    setFeedback(null);
    try {
      await action();
      setFeedback({ message: success, error: false });
    } catch {
      setFeedback({
        message: "The change could not be confirmed. Please try again.",
        error: true,
      });
    } finally {
      setPending(false);
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || name.trim() === user?.fullName) return;
    void perform(async () => {
      const result = await profileApi.updateAccount(
        { fullName: name.trim() },
        token
      );
      const current = useAuthStore.getState().user;
      if (current?._id === result.data._id) {
        setAuthUser({ ...current, ...result.data }, token);
      }
    }, "Profile updated.");
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      newPassword.length < 8 ||
      newPassword !== confirmation ||
      !oldPassword
    ) {
      return;
    }
    void perform(async () => {
      try {
        await profileApi.changePassword({ oldPassword, newPassword }, token);
      } finally {
        setOldPassword("");
        setNewPassword("");
        setConfirmation("");
      }
    }, "Password changed.");
  }

  return (
    <div className="grid max-w-3xl gap-5">
      {feedback ? (
        <p role={feedback.error ? "alert" : "status"}>{feedback.message}</p>
      ) : null}
      <Card className="grid gap-4 p-5">
        <h2 className="text-xl font-semibold">Profile</h2>
        <form className="grid gap-4" onSubmit={saveProfile}>
          <Input
            label="Full name"
            value={name}
            required
            disabled={pending}
            onChange={(event) => setName(event.target.value)}
          />
          <Input label="Username" value={user?.username ?? ""} readOnly />
          <Input label="Email" value={user?.email ?? ""} readOnly />
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Username and verified email cannot be changed here.
          </p>
          <Button
            type="submit"
            className="w-fit"
            disabled={pending || !name.trim() || name.trim() === user?.fullName}
          >
            Save profile
          </Button>
        </form>
      </Card>
      <Card className="grid gap-4 p-5">
        <h2 className="text-xl font-semibold">Security</h2>
        <form className="grid gap-4" onSubmit={changePassword}>
          <PasswordInput
            id="old-password"
            label="Current password"
            autoComplete="current-password"
            required
            disabled={pending}
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />
          <PasswordInput
            id="new-password"
            label="New password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={pending}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            autoComplete="new-password"
            required
            disabled={pending}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <Button
            type="submit"
            className="w-fit"
            disabled={
              pending ||
              !oldPassword ||
              newPassword.length < 8 ||
              newPassword !== confirmation
            }
          >
            Change password
          </Button>
        </form>
        <div className="border-t border-[color:var(--color-border)] pt-4">
          <h3 className="font-medium">Sign out of all sessions</h3>
          <p className="my-2 text-sm text-[color:var(--color-text-secondary)]">
            Revoke all active sessions and trusted devices. You will need to sign in again.
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Sign out of all sessions?")) return;
              void perform(async () => {
                await logoutAll();
                router.replace("/login");
              }, "Signed out.");
            }}
          >
            Sign out everywhere
          </Button>
        </div>
        <SessionSettings />
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Changing or recovering an authenticator is not available yet.
        </p>
      </Card>
      <Card className="grid gap-4 p-5">
        <h2 className="text-xl font-semibold">Appearance</h2>
        <fieldset className="flex flex-wrap gap-4">
          <legend className="sr-only">Theme</legend>
          {(["dark", "light"] as const).map((mode) => (
            <label key={mode} className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="theme"
                checked={theme === mode}
                onChange={() => setTheme(mode)}
              />
              {mode === "dark" ? "Dark" : "Light"}
            </label>
          ))}
        </fieldset>
      </Card>
    </div>
  );
}
