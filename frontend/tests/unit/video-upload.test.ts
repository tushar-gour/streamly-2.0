import { describe, expect, it } from "vitest";

import {
  thumbnailTypes,
  validateUploadFile,
  videoTypes,
} from "@/lib/validation/video-upload";

describe("video upload validation", () => {
  it("accepts supported video and image types", () => {
    expect(
      validateUploadFile({ size: 1024, type: "video/mp4" }, videoTypes)
    ).toBeUndefined();
    expect(
      validateUploadFile({ size: 1024, type: "image/png" }, thumbnailTypes)
    ).toBeUndefined();
  });

  it("rejects empty, oversized, and incompatible media", () => {
    expect(
      validateUploadFile({ size: 0, type: "video/mp4" }, videoTypes)
    ).toBeDefined();
    expect(
      validateUploadFile(
        { size: 50 * 1024 * 1024 + 1, type: "video/mp4" },
        videoTypes
      )
    ).toBeDefined();
    expect(
      validateUploadFile({ size: 1024, type: "image/png" }, videoTypes)
    ).toBeDefined();
  });
});
