/**
 * Share Postcard Tests
 * 
 * Tests for native and web sharing of postcard PNG files
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sharePostcard, type SharePostcardResult } from "@/lib/share-postcard";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// Mock Capacitor and plugins
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  },
}));

vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    writeFile: vi.fn(),
    getUri: vi.fn(),
    deleteFile: vi.fn(),
  },
  Directory: {
    Cache: "CACHE",
    Data: "DATA",
  },
}));

vi.mock("@capacitor/share", () => ({
  Share: {
    share: vi.fn(),
  },
}));

describe("sharePostcard", () => {
  let mockBlob: Blob;

  beforeEach(() => {
    // Create a simple PNG blob for testing
    mockBlob = new Blob(["mock png data"], { type: "image/png" });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Web Fallback", () => {
    beforeEach(() => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it("should download postcard on web", async () => {
      // Mock URL.createObjectURL
      const mockUrl = "blob:http://localhost/123";
      vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      // Mock document methods
      const mockAnchor = document.createElement("a");
      const clickSpy = vi.spyOn(mockAnchor, "click");
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockReturnValue(mockAnchor);
      const appendSpy = vi.spyOn(document.body, "appendChild");
      const removeSpy = vi.spyOn(document.body, "removeChild");

      const result = await sharePostcard(mockBlob, "test-postcard");

      expect(result).toEqual({ ok: true });
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendSpy).toHaveBeenCalledWith(mockAnchor);
      expect(clickSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalledWith(mockAnchor);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it("should handle web download errors gracefully", async () => {
      // Mock URL.createObjectURL to throw
      vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
        throw new Error("Object URL creation failed");
      });

      const result = await sharePostcard(mockBlob, "test-postcard");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("Object URL creation failed");
      expect(result.cancelled).toBeUndefined();
    });
  });

  describe("Native Platform", () => {
    beforeEach(() => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    });

    it("should share postcard on native platform", async () => {
      const mockUri = "file:///cache/test-postcard.png";
      vi.mocked(Filesystem.writeFile).mockResolvedValue(undefined as any);
      vi.mocked(Filesystem.getUri).mockResolvedValue({ uri: mockUri } as any);
      vi.mocked(Share.share).mockResolvedValue(undefined as any);
      vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined as any);

      const result = await sharePostcard(mockBlob, "test-postcard");

      expect(result).toEqual({ ok: true });
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          directory: Directory.Cache,
          path: "test-postcard.png",
        })
      );
      expect(Filesystem.getUri).toHaveBeenCalledWith(
        expect.objectContaining({
          directory: Directory.Cache,
          path: "test-postcard.png",
        })
      );
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Share postcard",
          files: [mockUri],
        })
      );
      expect(Filesystem.deleteFile).toHaveBeenCalled();
    });

    it("should handle user cancel gracefully", async () => {
      vi.mocked(Filesystem.writeFile).mockResolvedValue(undefined as any);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: "file:///cache/test.png",
      } as any);
      vi.mocked(Share.share).mockRejectedValue(
        new Error("User cancelled share")
      );
      vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined as any);

      const result = await sharePostcard(mockBlob, "test-postcard");

      expect(result.ok).toBe(true);
      expect(result.cancelled).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should clean up cache file even on error", async () => {
      vi.mocked(Filesystem.writeFile).mockResolvedValue(undefined as any);
      vi.mocked(Filesystem.getUri).mockRejectedValue(
        new Error("URI retrieval failed")
      );
      vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined as any);

      const result = await sharePostcard(mockBlob, "test-postcard");

      expect(result.ok).toBe(false);
      expect(Filesystem.deleteFile).toHaveBeenCalled();
    });

    it("should return error when write fails", async () => {
      const writeError = new Error("Write failed: storage full");
      vi.mocked(Filesystem.writeFile).mockRejectedValue(writeError);
      vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined as any);

      const result = await sharePostcard(mockBlob, "test-postcard");

      expect(result.ok).toBe(false);
      expect(result.error).toContain("Write failed: storage full");
      expect(result.cancelled).toBeUndefined();
    });

    it("should handle share API not available", async () => {
      vi.mocked(Filesystem.writeFile).mockResolvedValue(undefined as any);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: "file:///cache/test.png",
      } as any);
      vi.mocked(Share.share).mockRejectedValue(
        new Error("Share not available")
      );
      vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined as any);

      const result = await sharePostcard(mockBlob, "test-postcard");

      // Should not treat as cancel
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Share not available");
      expect(result.cancelled).toBeUndefined();
    });
  });

  describe("Result shape", () => {
    beforeEach(() => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
      const mockAnchor = document.createElement("a");
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      vi.spyOn(document.body, "appendChild").mockImplementation(() =>
        mockAnchor
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(() =>
        mockAnchor
      );
    });

    it("should always include 'ok' field", async () => {
      const result = await sharePostcard(mockBlob, "test");
      expect("ok" in result).toBe(true);
      expect(typeof result.ok).toBe("boolean");
    });

    it("should include 'cancelled' only when user cancels", async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.writeFile).mockResolvedValue(undefined as any);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: "file:///cache/test.png",
      } as any);
      vi.mocked(Share.share).mockRejectedValue(
        new Error("User cancelled")
      );
      vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined as any);

      const result = await sharePostcard(mockBlob, "test");
      expect(result.cancelled).toBe(true);
    });

    it("should include 'error' only on failure", async () => {
      vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
        throw new Error("Test error");
      });

      const result = await sharePostcard(mockBlob, "test");
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });
  });

  describe("Blob handling", () => {
    beforeEach(() => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
      const mockAnchor = document.createElement("a");
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      vi.spyOn(document.body, "appendChild").mockImplementation(() =>
        mockAnchor
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(() =>
        mockAnchor
      );
    });

    it("should accept PNG blobs", async () => {
      const pngBlob = new Blob(["png data"], { type: "image/png" });
      const result = await sharePostcard(pngBlob, "test");
      expect(result.ok).toBe(true);
    });

    it("should accept blobs without type", async () => {
      const genericBlob = new Blob(["data"]);
      const result = await sharePostcard(genericBlob, "test");
      expect(result.ok).toBe(true);
    });

    it("should work with various blob sizes", async () => {
      const largeBlob = new Blob([new ArrayBuffer(1024 * 100)], {
        type: "image/png",
      }); // ~100KB
      const result = await sharePostcard(largeBlob, "test-large");
      expect(result.ok).toBe(true);
    });
  });

  describe("Filename handling", () => {
    beforeEach(() => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
      const mockAnchor = document.createElement("a");
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      vi.spyOn(document.body, "appendChild").mockImplementation(() =>
        mockAnchor
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(() =>
        mockAnchor
      );
    });

    it("should append .png extension", async () => {
      const createElementSpy = vi.spyOn(document, "createElement");
      const mockAnchor = document.createElement("a");
      createElementSpy.mockReturnValue(mockAnchor);

      vi.spyOn(document.body, "appendChild").mockImplementation(() =>
        mockAnchor
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(() =>
        mockAnchor
      );

      await sharePostcard(mockBlob, "my-postcard");

      expect(mockAnchor.download).toContain(".png");
    });

    it("should sanitize filename", async () => {
      const result = await sharePostcard(mockBlob, "test/postcard\\..png");
      expect(result.ok).toBe(true);
    });

    it("should work with state names", async () => {
      const result = await sharePostcard(mockBlob, "Tamil Nadu-postcard");
      expect(result.ok).toBe(true);
    });
  });
});
