const defaultApiBaseUrl = "https://streamly-api.zytheran.me";

export const frontendConfig = Object.freeze({
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Streamly",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/u, "") ??
    defaultApiBaseUrl,
  mockShellsEnabled: process.env.NEXT_PUBLIC_ENABLE_MOCK_SHELLS !== "false",
});
