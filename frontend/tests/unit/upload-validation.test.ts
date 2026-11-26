import { describe, expect, it } from "vitest";

import { validateUpload } from "@/lib/api/upload.api";

const video = new File(["video"], "video.mp4", { type: "video/mp4" });
const thumbnail = new File(["image"], "thumbnail.png", { type: "image/png" });

describe("upload validation", () => {
  it("accepts supported non-empty files and metadata", () => {
    expect(validateUpload(video, thumbnail, "Title", "Description")).toBeNull();
  });

  it("requires both files and non-blank metadata", () => {
    expect(validateUpload(video, null, "Title", "Description")).not.toBeNull();
    expect(validateUpload(video, thumbnail, " ", "Description")).not.toBeNull();
  });

  it("rejects an unsupported video type", () => {
    const invalid = new File(["text"], "video.txt", { type: "text/plain" });
    expect(validateUpload(invalid, thumbnail, "Title", "Description")).not.toBeNull();
  });

  it("rejects files over the backend limit", () => {
    const oversized = { ...video, size: 50 * 1024 * 1024 + 1 } as File;
    expect(validateUpload(oversized, thumbnail, "Title", "Description")).not.toBeNull();
  });
});
