"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { apiRequest } from "@/lib/api/client";
import { StreamlyApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";

export function MfaManagement() {
  const enabled = useAuthStore((state) => Boolean(state.user?.mfaEnabledAt));
  const [uri, setUri] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [justEnabled, setJustEnabled] = useState(false);
  async function submit() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const path =
        enabled || justEnabled
          ? "recovery/regenerate"
          : uri
            ? "verify"
            : "setup";
      const result = await apiRequest<{
        otpauthUrl?: string;
        recoveryCodes?: string[];
      }>(`/api/v1/users/auth/mfa/${path}`, {
        method: "POST",
        body: JSON.stringify({ password, code }),
      });
      if (result.data.otpauthUrl) setUri(result.data.otpauthUrl);
      if (result.data.recoveryCodes) {
        setCodes(result.data.recoveryCodes);
        setUri("");
        if (path === "verify") setJustEnabled(true);
      }
    } catch (cause) {
      setError(
        cause instanceof StreamlyApiError && cause.statusCode < 500
          ? cause.message
          : "Authenticator management is temporarily unavailable."
      );
    } finally {
      setPending(false);
      setPassword("");
      setCode("");
    }
  }
  return (
    <section className="grid gap-4 border-t border-[color:var(--color-border)] pt-4">
      <h3 className="font-medium">Authenticator and recovery codes</h3>
      <p className="text-sm text-[color:var(--color-text-secondary)]">
        {enabled || justEnabled
          ? "Your authenticator is enabled. Generating new recovery codes invalidates all old codes."
          : "Protect your account with an authenticator app. Your email must be verified."}
      </p>
      {codes.length ? (
        <div className="grid gap-2 rounded-card border border-[color:var(--color-border)] p-4">
          <p role="status">
            Save these private, single-use codes now. They will not be shown
            again.
          </p>
          {codes.map((item) => (
            <code key={item} className="break-all text-xs select-all">
              {item}
            </code>
          ))}
          <Button variant="secondary" onClick={() => setCodes([])}>
            I saved my codes
          </Button>
        </div>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {uri ? (
            <div className="grid gap-2">
              <div className="mx-auto w-fit rounded-md bg-white p-3">
                <QRCodeSVG
                  value={uri}
                  size={176}
                  marginSize={2}
                  title="Authenticator setup QR"
                />
              </div>
              <p className="text-sm">
                Manual key:{" "}
                <code className="break-all select-all">
                  {new URL(uri).searchParams.get("secret")}
                </code>
              </p>
            </div>
          ) : null}
          <PasswordInput
            id="mfa-management-password"
            label="Current password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
          />
          {enabled || justEnabled || uri ? (
            <Input
              id="mfa-management-code"
              label="Authenticator code"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={pending}
            />
          ) : null}
          {error ? <p role="alert">{error}</p> : null}
          <Button className="w-fit" type="submit" disabled={pending}>
            {enabled || justEnabled
              ? "Generate new recovery codes"
              : uri
                ? "Verify authenticator"
                : "Set up authenticator"}
          </Button>
        </form>
      )}
    </section>
  );
}
