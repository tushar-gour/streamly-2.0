export const SESSION_EVENT_KEY = "streamly-session-change";

export function publishSessionChange() {
  if (typeof window === "undefined") return;
  try {
    // Only a change notification is persisted; never credentials or user data.
    window.localStorage.setItem(SESSION_EVENT_KEY, window.crypto.randomUUID());
  } catch {
    // Storage restrictions can prevent cross-tab notifications.
  }
}
