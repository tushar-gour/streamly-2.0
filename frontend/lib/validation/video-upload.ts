const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const videoTypes = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
] as const;

export const thumbnailTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export function validateUploadFile(
  file: Pick<File, "size" | "type">,
  allowedTypes: readonly string[]
): string | undefined {
  if (file.size === 0) return "Select a non-empty file.";
  const maxSize = file.type.startsWith("image/") ? 10 * 1024 * 1024 : MAX_FILE_SIZE;
  if (file.size > maxSize) return file.type.startsWith("image/") ? "Images must be 10 MB or smaller." : "Each file must be 50 MB or smaller.";
  if (!allowedTypes.includes(file.type))
    return "This file type is not supported.";
  return undefined;
}
