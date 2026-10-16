import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getQuizProgress,
  getQuizProgressForState,
  saveQuizProgress,
  clearQuizProgressForState,
  clearAllQuizProgress,
  cleanupExpiredQuizProgress,
} from "../quiz-progress";

describe("Quiz Progress - Save, Resume, Clear & Expiry", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("saveQuizProgress", () => {
    it("should save quiz progress with all required fields", () => {
      const stateName = "Maharashtra";
      const index = 1;
      const correctCount = 1;
      const answers = [
        { id: "q-1", correct: true },
        { id: "q-2", correct: false },
      ];

      saveQuizProgress(stateName, index, correctCount, answers);

      const stored = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      expect(stored[stateName]).toBeDefined();
      expect(stored[stateName].index).toBe(1);
      expect(stored[stateName].correctCount).toBe(1);
      expect(stored[stateName].answers).toEqual(answers);
      expect(stored[stateName].startedAt).toBeDefined();
      expect(stored[stateName].updatedAt).toBeDefined();
    });

    it("should preserve startedAt when updating progress", () => {
      const stateName = "Maharashtra";

      // Save first time
      saveQuizProgress(stateName, 0, 0, []);
      const stored1 = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      const startedAt = stored1[stateName].startedAt;

      // Wait a bit and save again
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      saveQuizProgress(stateName, 1, 1, [{ id: "q-1", correct: true }]);
      const stored2 = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");

      // startedAt should be the same
      expect(stored2[stateName].startedAt).toBe(startedAt);
      // updatedAt should be newer
      expect(stored2[stateName].updatedAt).toBeGreaterThan(startedAt);

      vi.useRealTimers();
    });
  });

  describe("getQuizProgressForState", () => {
    it("should return null for non-existent state", () => {
      const result = getQuizProgressForState("NonExistent");
      expect(result).toBeNull();
    });

    it("should return saved progress", () => {
      const stateName = "Karnataka";
      const answers = [{ id: "q-1", correct: true }];

      saveQuizProgress(stateName, 2, 1, answers);
      const result = getQuizProgressForState(stateName);

      expect(result).toBeDefined();
      expect(result?.index).toBe(2);
      expect(result?.correctCount).toBe(1);
      expect(result?.answers).toEqual(answers);
    });

    it("should return null for expired entries (7+ days old)", () => {
      const stateName = "Delhi";

      // Manually set an old entry
      const oldEntry = {
        index: 0,
        correctCount: 0,
        answers: [],
        startedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
        updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      };

      const progress = { [stateName]: oldEntry };
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(progress));

      const result = getQuizProgressForState(stateName);
      expect(result).toBeNull();

      // Entry should be deleted
      const stored = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      expect(stored[stateName]).toBeUndefined();
    });

    it("should keep entries within 7 days", () => {
      const stateName = "Mumbai";

      // Set entry from 6 days ago
      const recentEntry = {
        index: 1,
        correctCount: 1,
        answers: [{ id: "q-1", correct: true }],
        startedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
      };

      const progress = { [stateName]: recentEntry };
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(progress));

      const result = getQuizProgressForState(stateName);
      expect(result).toBeDefined();
      expect(result?.index).toBe(1);
    });
  });

  describe("clearQuizProgressForState", () => {
    it("should remove progress for a specific state", () => {
      const state1 = "Rajasthan";
      const state2 = "Gujarat";

      saveQuizProgress(state1, 0, 0, []);
      saveQuizProgress(state2, 1, 1, [{ id: "q-1", correct: true }]);

      clearQuizProgressForState(state1);

      expect(getQuizProgressForState(state1)).toBeNull();
      expect(getQuizProgressForState(state2)).toBeDefined();
    });

    it("should be idempotent (safe to call multiple times)", () => {
      const stateName = "Punjab";
      saveQuizProgress(stateName, 0, 0, []);

      clearQuizProgressForState(stateName);
      clearQuizProgressForState(stateName); // Should not crash

      expect(getQuizProgressForState(stateName)).toBeNull();
    });
  });

  describe("clearAllQuizProgress", () => {
    it("should remove all quiz progress", () => {
      saveQuizProgress("State1", 0, 0, []);
      saveQuizProgress("State2", 1, 1, [{ id: "q-1", correct: true }]);

      clearAllQuizProgress();

      const progress = getQuizProgress();
      expect(Object.keys(progress).length).toBe(0);
    });
  });

  describe("cleanupExpiredQuizProgress", () => {
    it("should remove expired entries", () => {
      const fresh = "FreshState";
      const old = "OldState";

      // Create fresh and old entries
      const freshEntry = {
        index: 0,
        correctCount: 0,
        answers: [],
        startedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      };

      const oldEntry = {
        index: 0,
        correctCount: 0,
        answers: [],
        startedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
        updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      };

      const progress = {
        [fresh]: freshEntry,
        [old]: oldEntry,
      };
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(progress));

      cleanupExpiredQuizProgress();

      const stored = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      expect(stored[fresh]).toBeDefined();
      expect(stored[old]).toBeUndefined();
    });

    it("should not modify if all entries are fresh", () => {
      const stateName = "TamilNadu";
      const entry = {
        index: 2,
        correctCount: 2,
        answers: [
          { id: "q-1", correct: true },
          { id: "q-2", correct: true },
        ],
        startedAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        updatedAt: Date.now() - 1 * 60 * 60 * 1000,
      };

      const progress = { [stateName]: entry };
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(progress));

      cleanupExpiredQuizProgress();

      const stored = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      expect(stored[stateName]).toEqual(entry);
    });
  });

  describe("getQuizProgress", () => {
    it("should return empty object if no progress saved", () => {
      const result = getQuizProgress();
      expect(result).toEqual({});
    });

    it("should return all saved progress", () => {
      saveQuizProgress("State1", 0, 0, []);
      saveQuizProgress("State2", 1, 1, [{ id: "q-1", correct: true }]);

      const progress = getQuizProgress();
      expect(Object.keys(progress).length).toBe(2);
      expect(progress["State1"]).toBeDefined();
      expect(progress["State2"]).toBeDefined();
    });

    it("should handle corrupted data gracefully", () => {
      // Save corrupted JSON
      localStorage.setItem("india-explorer:quiz-progress:v1", "invalid json {]");

      const progress = getQuizProgress();
      expect(progress).toEqual({});
    });
  });
});
