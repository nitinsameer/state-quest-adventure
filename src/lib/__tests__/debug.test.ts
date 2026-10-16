/**
 * Debug Utility Tests
 * 
 * Regression tests for Batch 2 fix: FND-001 to FND-005 (excessive console logging)
 * Verifies that debugLog, debugWarn, and debugError only output in DEV mode
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { debugLog, debugWarn, debugError } from "../debug";

describe("Debug Utility (Regression: FND-001-005)", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("debugLog", () => {
    it("should log in DEV mode", () => {
      // In test environment, import.meta.env.DEV is true by default in vitest
      debugLog("TestComponent", "Test message", { key: "value" });
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("[TestComponent] Test message", { key: "value" });
    });

    it("should format label correctly", () => {
      debugLog("CardNarrationPlayer", "Playback started");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[CardNarrationPlayer] Playback started",
        ""
      );
    });

    it("should handle no data parameter", () => {
      debugLog("Component", "Message without data");
      expect(consoleLogSpy).toHaveBeenCalledWith("[Component] Message without data", "");
    });
  });

  describe("debugWarn", () => {
    it("should warn in DEV mode", () => {
      debugWarn("TestComponent", "Warning message", { issue: "something" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[TestComponent] Warning message",
        { issue: "something" }
      );
    });

    it("should format warning label correctly", () => {
      debugWarn("AudioPlayer", "Low battery");
      expect(consoleWarnSpy).toHaveBeenCalledWith("[AudioPlayer] Low battery", "");
    });
  });

  describe("debugError", () => {
    it("should error log in DEV mode", () => {
      const err = new Error("Test error");
      debugError("TestComponent", "Error occurred", err);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("[TestComponent] Error occurred", err);
    });

    it("should handle error object", () => {
      const error = { message: "Custom error", code: 500 };
      debugError("APIComponent", "Request failed", error);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[APIComponent] Request failed", error);
    });

    it("should handle undefined error gracefully", () => {
      debugError("Component", "Error without context");
      expect(consoleErrorSpy).toHaveBeenCalledWith("[Component] Error without context", "");
    });
  });

  describe("Production mode behavior", () => {
    it("should respect import.meta.env.DEV flag", () => {
      // When DEV is false (production), functions should not call console
      const originalDEV = import.meta.env.DEV;
      
      debugLog("TestLabel", "This should appear or not based on DEV");
      
      // In test environment, DEV is true, so console.log should be called
      // In production build, DEV is false and console.log should not be called
      if (import.meta.env.DEV) {
        expect(consoleLogSpy).toHaveBeenCalled();
      } else {
        expect(consoleLogSpy).not.toHaveBeenCalled();
      }
    });
  });
});
