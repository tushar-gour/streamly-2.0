import { apiRequest, expectedSessionAccount } from "@/lib/api/client";
import { createApiError, createNetworkError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import type { VideoListItem } from "@/lib/api/videos.api";
import { frontendConfig } from "@/lib/config/env";

export type VideoUpload = Readonly<{
  requestId: string;
  title: string;
  description: string;
  video: File;
  thumbnail: File;
}>;

export function uploadVideo(
  input: VideoUpload,
  accessToken: string | null,
  onProgress: (percent: number | null) => void
): Promise<ApiResponse<VideoListItem>> {
  const form = new FormData();
  form.append("requestId", input.requestId);
  form.append("title", input.title.trim());
  form.append("description", input.description.trim());
  form.append("videoFile", input.video);
  form.append("thumbnail", input.thumbnail);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${frontendConfig.apiBaseUrl}/api/v1/videos`);
    request.withCredentials = true;
    request.responseType = "json";
    request.setRequestHeader("Accept", "application/json");
    const account = expectedSessionAccount();
    if (account) request.setRequestHeader("X-Streamly-Account", account);
    if (accessToken) {
      request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }
    request.upload.onprogress = (event) => {
      onProgress(
        event.lengthComputable
          ? Math.floor((event.loaded / event.total) * 100)
          : null
      );
    };
    request.upload.onload = () => onProgress(100);
    request.onerror = () => reject(createNetworkError());
    request.onabort = () => reject(createNetworkError());
    request.ontimeout = () => reject(createNetworkError());
    request.onload = () => {
      if (
        request.status === 201 &&
        request.response?.success === true &&
        typeof request.response?.data?._id === "string"
      ) {
        resolve(request.response as ApiResponse<VideoListItem>);
      } else {
        reject(createApiError(request.status, request.response));
      }
    };
    request.send(form);
  });
}

export type UploadAttempt = Readonly<{
  requestId: string;
  title: string;
  status: "validating" | "storing" | "ready" | "failed" | "interrupted";
  error: string | null;
  videoId: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export function uploadStatus(requestId: string, token: string | null) {
  return apiRequest<UploadAttempt>(
    `/api/v1/videos/uploads/${encodeURIComponent(requestId)}`,
    {
      accessToken: token,
    }
  );
}

export function listUploadAttempts(token: string | null) {
  return apiRequest<UploadAttempt[]>("/api/v1/videos/uploads", {
    accessToken: token,
  });
}
