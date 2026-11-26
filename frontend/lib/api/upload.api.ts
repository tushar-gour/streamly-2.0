import { createApiError, createNetworkError } from "@/lib/api/errors";
import type { ApiErrorPayload, ApiResponse } from "@/lib/api/types";
import type { VideoListItem } from "@/lib/api/videos.api";
import { frontendConfig } from "@/lib/config/env";

const maxFileSize = 50 * 1024 * 1024;

export function validateUpload(
  video: File | null,
  thumbnail: File | null,
  title: string,
  description: string
): string | null {
  if (!video || !thumbnail) return "Select a video and a thumbnail.";
  if (!title.trim() || !description.trim())
    return "Enter a title and description.";
  if (video.size === 0 || thumbnail.size === 0)
    return "Files must not be empty.";
  if (video.size > maxFileSize || thumbnail.size > maxFileSize)
    return "Each file must be 50 MB or smaller.";
  if (
    !["video/mp4", "video/mpeg", "video/quicktime", "video/webm"].includes(
      video.type
    )
  )
    return "Choose an MP4, MPEG, MOV or WebM video.";
  if (
    !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
      thumbnail.type
    )
  )
    return "Choose a JPEG, PNG, GIF or WebP thumbnail.";
  return null;
}

export function publishVideo(
  form: FormData,
  accessToken: string | null,
  onProgress: (percent: number) => void
): Promise<ApiResponse<VideoListItem>> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${frontendConfig.apiBaseUrl}/api/v1/videos`);
    request.withCredentials = true;
    request.setRequestHeader("Accept", "application/json");
    if (accessToken) {
      request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onerror = () => reject(createNetworkError());
    request.onabort = () => reject(createNetworkError());
    request.onload = () => {
      let payload: unknown;
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        payload = null;
      }
      if (request.status !== 201) {
        reject(createApiError(request.status, payload as ApiErrorPayload | null));
        return;
      }
      const response = payload as ApiResponse<VideoListItem> | null;
      if (!response?.success || !response.data?._id) {
        reject(createApiError(502, null));
        return;
      }
      resolve(response);
    };
    request.send(form);
  });
}
