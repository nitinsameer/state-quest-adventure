/**
 * Unit tests for sharePostcard utility
 * Tests native success, user cancel, and web fallback paths
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { sharePostcard } from "./share-postcard";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// Mock Capacitor
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

// Mock Filesystem
vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    writeFile: vi.fn(),
    getUri: vi.fn(),
    deleteFile: vi.fn(),
  },
  Directory: {
    Cache: "CACHE",
  },
}));

// Mock Share
vi.mock("@capacitor/share", () => ({
  Share: {
    share: vi.fn(),
  },
}));

describe("sharePostcard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use web fallback when not on native platform", async () => {
    const mockBlob = new Blob(["test"], { type: "image/png" });
    const result = await sharePostcard(mockBlob, "test-postcard");

    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should handle native sharing successfully", async () => {
    // Mock native platform
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

    // Mock file operations
    const mockUri = "file:///cache/test-postcard.png";
    vi.mocked(Filesystem.getUri).mockResolvedValue({ uri: mockUri });
    vi.mocked(Share.share).mockResolvedValue({});

    const mockBlob = new Blob(["test"], { type: "image/png" });
    const result = await sharePostcard(mockBlob, "test-postcard");

    expect(result.ok).toBe(true);
    expect(vi.mocked(Filesystem.writeFile)).toHaveBeenCalled();
    expect(vi.mocked(Share.share)).toHaveBeenCalled();
  });

  it("should treat user cancel as success", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

    // Mock cancel scenario
    const cancelError = new Error("User cancelled");
    vi.mocked(Share.share).mockRejectedValue(cancelError);

    const mockBlob = new Blob(["test"], { type: "image/png" });
    const result = await sharePostcard(mockBlob, "test-postcard");

    expect(result.ok).toBe(true);
    expect(result.cancelled).toBe(true);
  });

  it("should return error on unexpected failure", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

    // Mock write failure
    const writeError = new Error("Write failed");
    vi.mocked(Filesystem.writeFile).mockRejectedValue(writeError);

    const mockBlob = new Blob(["test"], { type: "image/png" });
    const result = await sharePostcard(mockBlob, "test-postcard");

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
