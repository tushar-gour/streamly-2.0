import type { VideoCardModel } from "@/components/video/video-card";
import type { VideoListItem } from "@/lib/api/videos.api";
import {
  formatCount,
  formatDuration,
  formatRelativeDate,
  safeMediaUrl,
} from "@/lib/media/media-formatters";

export function toVideoCardModel(video: VideoListItem): VideoCardModel {
  const owner = video.owner;

  return {
    age: formatRelativeDate(video.createdAt),
    avatar: safeMediaUrl(owner?.avatar),
    commentsLabel: formatCount(video.commentsCount, "comments"),
    creator: owner?.fullName || owner?.username || "Unknown creator",
    duration: formatDuration(video.duration),
    id: video._id,
    thumbnail: safeMediaUrl(video.thumbnail),
    title: video.title,
    views: formatCount(video.views, "views"),
  };
}
