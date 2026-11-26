import { frontendConfig } from "@/lib/config/env";

export function safeMediaUrl(value?: string | null) {
  if (!value) return null;

  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.toString();
    }
  } catch {
    if (
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.startsWith("/\\")
    ) {
      return value;
    }
  }

  return null;
}

export function getVideoStreamUrl(videoId: string) {
  return `${frontendConfig.apiBaseUrl}/api/v1/videos/${videoId}/stream`;
}

export function formatDuration(seconds?: number | string | null) {
  const totalSeconds = Number(seconds ?? 0);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "--:--";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatCount(value?: number | null, label = "") {
  const numberValue = Number(value ?? 0);
  const formattedValue = new Intl.NumberFormat("en", {
    compactDisplay: "short",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(numberValue);

  return label ? `${formattedValue} ${label}` : formattedValue;
}

export function formatRelativeDate(value?: string | Date | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60, name: "second" },
    { amount: 60, name: "minute" },
    { amount: 24, name: "hour" },
    { amount: 7, name: "day" },
    { amount: 4.34524, name: "week" },
    { amount: 12, name: "month" },
    { amount: Number.POSITIVE_INFINITY, name: "year" },
  ] as const;

  let duration = seconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round(duration),
        division.name
      );
    }

    duration /= division.amount;
  }

  return "";
}
