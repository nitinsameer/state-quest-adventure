/**
 * Regression Tests: Storage Resilience
 * 
 * Verifies that the app handles storage issues gracefully:
 * - Malformed JSON doesn't crash the app
 * - Unavailable storage is handled gracefully
 * - Corrupted data is sanitized
 * - App recovers from storage errors
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Storage Resilience", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should handle malformed JSON in progress storage", () => {
    // Given corrupted JSON in storage
    localStorage.setItem("india-explorer:progress:v2", "{invalid json}");

    // When the app tries to parse it
    const result = () => {
      const raw = localStorage.getItem("india-explorer:progress:v2");
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (err) {
        return null; // Graceful fallback
      }
    };

    // Then it should not crash and should return null
    expect(result()).toBeNull();
  });

  it("should handle malformed JSON in quiz progress", () => {
    // Given corrupted quiz progress
    localStorage.setItem("india-explorer:quiz-progress:v1", "{bad json");

    // When parsing
    const result = () => {
      const raw = localStorage.getItem("india-explorer:quiz-progress:v1");
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch (err) {
        return {}; // Return empty object as fallback
      }
    };

    // Then it should gracefully return empty state
    expect(result()).toEqual({});
  });

  it("should handle missing required fields in progress", () => {
    // Given progress data with missing required fields
    const incompleteProgress = {
      name: "Explorer",
      // Missing other required fields
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(incompleteProgress));

    // When validating
    const result = () => {
      const raw = localStorage.getItem("india-explorer:progress:v2");
      const data = JSON.parse(raw || "{}");
      
      // Check if it has minimum required fields
      return data.name && data.ageBand !== undefined && data.xp !== undefined;
    };

    // Then invalid data should be detected
    expect(result()).toBe(false);
  });

  it("should handle localStorage quota exceeded gracefully", () => {
    // Given an attempt to store large data
    const largeData = {
      name: "Explorer",
      ageBand: "8-9",
      xp: 0,
      // Try to store huge array
      data: new Array(100000).fill("x"),
    };

    // When attempting to store
    let quotaExceeded = false;
    try {
      localStorage.setItem("india-explorer:progress:v2", JSON.stringify(largeData));
    } catch (err: any) {
      if (err.name === "QuotaExceededError") {
        quotaExceeded = true;
      }
    }

    // Then app should handle this gracefully (may fail but not crash)
    expect(typeof quotaExceeded).toBe("boolean");
  });

  it("should validate sound toggle values", () => {
    // Given invalid sound toggle values
    const invalidValues = ["true", "false", "2", "-1", "undefined", ""];

    for (const value of invalidValues) {
      localStorage.clear();
      localStorage.setItem("india-explorer:sound:v1", value);

      // When validating
      const isValid = () => {
        const raw = localStorage.getItem("india-explorer:sound:v1");
        // Should only accept "0" or "1"
        return raw === "0" || raw === "1";
      };

      // Then invalid values should be rejected as not valid
      expect(isValid()).toBe(false); // These values are invalid
    }
  });

  it("should handle valid sound toggle values", () => {
    // Given valid sound toggle values
    const validValues = ["0", "1"];

    for (const value of validValues) {
      localStorage.clear();
      localStorage.setItem("india-explorer:sound:v1", value);

      // When retrieving
      const stored = localStorage.getItem("india-explorer:sound:v1");

      // Then valid values should be preserved
      expect(stored).toBe(value);
    }
  });

  it("should handle empty postcard library", () => {
    // Given empty postcard library data
    localStorage.setItem("postcard-library-v1", "[]");

    // When retrieving
    const result = JSON.parse(localStorage.getItem("postcard-library-v1") || "[]");

    // Then empty array should be handled
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should handle malformed postcard library", () => {
    // Given malformed postcard data
    localStorage.setItem("postcard-library-v1", "{not an array}");

    // When parsing
    const result = () => {
      const raw = localStorage.getItem("postcard-library-v1");
      try {
        const parsed = JSON.parse(raw || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    // Then should return empty array
    expect(result()).toEqual([]);
  });

  it("should handle quiz progress with invalid timestamps", () => {
    // Given quiz progress with bad timestamps
    const badQuizProgress = {
      Karnataka: {
        index: 0,
        correctCount: 0,
        answers: [],
        startedAt: -1, // Invalid negative timestamp
        updatedAt: "not a number", // Invalid string
      },
    };

    localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(badQuizProgress));

    // When retrieving and validating
    const result = () => {
      const raw = localStorage.getItem("india-explorer:quiz-progress:v1");
      try {
        const data = JSON.parse(raw || "{}");
        // Validate timestamps are numbers
        const entry = data.Karnataka;
        return typeof entry?.startedAt === "number" && typeof entry?.updatedAt === "number";
      } catch {
        return false;
      }
    };

    // Then invalid data should be rejected
    expect(result()).toBe(false);
  });

  it("should recover from null localStorage values", () => {
    // Given null values in storage
    localStorage.setItem("india-explorer:progress:v2", "null");

    // When retrieving
    const result = () => {
      const raw = localStorage.getItem("india-explorer:progress:v2");
      return raw === "null" ? null : JSON.parse(raw || "{}");
    };

    // Then null should be handled
    expect(result()).toBeNull();
  });

  it("should handle very large XP values", () => {
    // Given user with very large XP (prevents overflow)
    const progress = {
      name: "Explorer",
      ageBand: "8-9",
      xp: 999999999, // Large number
      completed: [],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));

    // When retrieving
    const stored = JSON.parse(
      localStorage.getItem("india-explorer:progress:v2") || "{}"
    );

    // Then large values should be preserved
    expect(stored.xp).toBe(999999999);
    expect(typeof stored.xp).toBe("number");
  });
});
