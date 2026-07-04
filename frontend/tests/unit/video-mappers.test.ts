import { describe, expect, it } from "vitest";

import { formatCount, formatDuration } from "@/lib/media/media-formatters";
import { toVideoCardModel } from "@/lib/media/video-mappers";

describe("video media mappers", () => {
  it("maps backend video items into card models", () => {
    const card = toVideoCardModel({
      _id: "video_1",
      commentsCount: 3,
      createdAt: "2026-07-04T10:00:00.000Z",
      duration: 125,
      owner: {
        _id: "user_1",
        avatar: "https://cdn.example.test/avatar.jpg",
        username: "creator",
      },
      thumbnail: "https://cdn.example.test/thumb.jpg",
      title: "Real backend video",
      views: 1240,
    });

    expect(card.id).toBe("video_1");
    expect(card.thumbnail).toBe("https://cdn.example.test/thumb.jpg");
    expect(card.creator).toBe("creator");
    expect(card.views).toContain("views");
    expect(card.commentsLabel).toBe("3 comments");
  });

  it("formats compact counts and durations", () => {
    expect(formatCount(1532, "views")).toBe("1.5K views");
    expect(formatDuration(125)).toBe("2:05");
  });
});
