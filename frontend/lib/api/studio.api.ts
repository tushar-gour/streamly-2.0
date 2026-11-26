import { apiRequest } from "@/lib/api/client";
import type { StudioVideo } from "@/lib/api/dashboard.api";

export const studioApi = {
  update(videoId: string, body: FormData, accessToken: string | null) {
    return apiRequest<StudioVideo>(
      `/api/v1/videos/${encodeURIComponent(videoId)}`,
      { method: "PATCH", body, accessToken }
    );
  },
  togglePublished(videoId: string, accessToken: string | null) {
    return apiRequest<StudioVideo>(
      `/api/v1/videos/toggle/publish/${encodeURIComponent(videoId)}`,
      { method: "PATCH", accessToken }
    );
  },
  remove(videoId: string, accessToken: string | null) {
    return apiRequest<Record<string, never>>(
      `/api/v1/videos/${encodeURIComponent(videoId)}`,
      { method: "DELETE", accessToken }
    );
  },
};
