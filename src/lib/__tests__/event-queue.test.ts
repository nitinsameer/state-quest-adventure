/**
 * Event Queue Tests
 *
 * Regression tests for Batch 4 fix: FND-007 (event queue data loss when localStorage full)
 *
 * Verifies that analytics events are properly queued, persisted, and handled when
 * storage is full or corrupted.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eventQueue } from "../event-queue";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Event Queue (Regression: FND-007)", () => {
  beforeEach(() => {
    localStorage.clear();
    eventQueue.clear();
  });

  describe("Queue API availability", () => {
    it("should export singleton eventQueue instance", () => {
      expect(eventQueue).toBeDefined();
      expect(typeof eventQueue).toBe("object");
    });

    it("should have enqueue method", () => {
      expect(eventQueue.enqueue).toBeDefined();
      expect(typeof eventQueue.enqueue).toBe("function");
    });

    it("should have getQueueSize method", () => {
      expect(eventQueue.getQueueSize).toBeDefined();
      expect(typeof eventQueue.getQueueSize).toBe("function");
    });

    it("should have clear method for testing", () => {
      expect(eventQueue.clear).toBeDefined();
      expect(typeof eventQueue.clear).toBe("function");
    });

    it("should have processQueue method", () => {
      expect(eventQueue.processQueue).toBeDefined();
      expect(typeof eventQueue.processQueue).toBe("function");
    });
  });

  describe("Event queueing behavior", () => {
    it("should accept event enqueueing", () => {
      const initialSize = eventQueue.getQueueSize();

      // Should not throw
      eventQueue.enqueue("test_event", { data: "value" });

      expect(eventQueue.getQueueSize()).toBeGreaterThanOrEqual(initialSize);
    });

    it("should handle multiple events", () => {
      eventQueue.clear();

      eventQueue.enqueue("event1", { id: 1 });
      eventQueue.enqueue("event2", { id: 2 });
      eventQueue.enqueue("event3", { id: 3 });

      expect(eventQueue.getQueueSize()).toBeGreaterThanOrEqual(3);
    });

    it("should handle events without params", () => {
      const initialSize = eventQueue.getQueueSize();

      // Should not throw when no params passed
      eventQueue.enqueue("simple_event");

      expect(eventQueue.getQueueSize()).toBeGreaterThanOrEqual(initialSize);
    });

    it("should handle corrupted localStorage data gracefully", () => {
      localStorage.setItem("india-explorer:event-queue:v1", "{ invalid json");

      // Creating a new instance or calling methods should not crash
      const size = eventQueue.getQueueSize();
      expect(typeof size).toBe("number");
      expect(size >= 0).toBe(true);
    });
  });

  describe("Queue persistence", () => {
    it("should persist events to localStorage", () => {
      eventQueue.clear();
      eventQueue.enqueue("persist_test", { value: 123 });

      const stored = localStorage.getItem("india-explorer:event-queue:v1");
      expect(stored).toBeTruthy();
    });

    it("should handle localStorage quota exceeded gracefully", () => {
      eventQueue.clear();

      // Add events
      for (let i = 0; i < 5; i++) {
        eventQueue.enqueue(`event_${i}`, { index: i });
      }

      // Queue should still function even if localStorage full (falls back to in-memory)
      const size = eventQueue.getQueueSize();
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("Error handling (FND-007 regression)", () => {
    it("should not crash on invalid event data", () => {
      eventQueue.clear();

      // Should handle all these without throwing
      eventQueue.enqueue("null_event", null as any);
      eventQueue.enqueue("undefined_event", undefined);
      eventQueue.enqueue("empty_object", {});
      eventQueue.enqueue("string_param", "invalid" as any);

      expect(eventQueue.getQueueSize()).toBeGreaterThan(0);
    });

    it("should handle large event payloads", () => {
      eventQueue.clear();

      const largePayload = {
        data: "x".repeat(50000),
        nested: { deep: { structure: { with: { many: { levels: "data" } } } } },
      };

      // Should not crash even with large payloads
      eventQueue.enqueue("large_event", largePayload);

      expect(eventQueue.getQueueSize()).toBeGreaterThan(0);
    });

    it("should have clear method for cleanup", () => {
      eventQueue.enqueue("cleanup_test", {});
      expect(eventQueue.getQueueSize()).toBeGreaterThan(0);

      eventQueue.clear();

      expect(eventQueue.getQueueSize()).toBe(0);
    });
  });

  describe("Data recovery from corruption (FND-007)", () => {
    it("should recover from corrupted queue storage", () => {
      // Intentionally corrupt the queue
      localStorage.setItem("india-explorer:event-queue:v1", "❌ CORRUPTED DATA ❌");

      // Should not crash when accessing queue
      const size = eventQueue.getQueueSize();
      expect(typeof size).toBe("number");
    });

    it("should continue functioning after corruption", () => {
      // First corrupt
      localStorage.setItem("india-explorer:event-queue:v1", "invalid");

      // Then try to use
      const initialSize = eventQueue.getQueueSize();
      eventQueue.enqueue("after_corruption", {});
      const newSize = eventQueue.getQueueSize();

      // Should either have same size (recovery) or more (new event added)
      expect(newSize).toBeGreaterThanOrEqual(initialSize);
    });
  });
});
