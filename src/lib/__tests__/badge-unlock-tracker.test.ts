/**
 * Badge Unlock Tracker Tests
 * 
 * Regression tests for Batch 4 fix: FND-009 (unvalidated JSON.parse)
 * Verifies that corrupted localStorage data is handled gracefully
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getSeenBadgeIds,
  markBadgeAsSeen,
  getNewlyUnlockedBadges,
  getBadgeNotificationMessage,
} from "../badge-unlock-tracker";
import type { AchievementBadge } from "../progress";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
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

describe("Badge Unlock Tracker (Regression: FND-009)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getSeenBadgeIds", () => {
    it("should return empty set when no data stored", () => {
      const seen = getSeenBadgeIds();
      expect(seen).toEqual(new Set());
      expect(seen.size).toBe(0);
    });

    it("should return seen badge IDs from valid storage", () => {
      localStorage.setItem(
        "india-explorer:seen-badges:v1",
        JSON.stringify(["badge-1", "badge-2", "badge-3"])
      );

      const seen = getSeenBadgeIds();
      expect(seen.has("badge-1")).toBe(true);
      expect(seen.has("badge-2")).toBe(true);
      expect(seen.has("badge-3")).toBe(true);
      expect(seen.size).toBe(3);
    });

    it("should handle corrupted JSON gracefully (critical fix)", () => {
      // This is the core regression test for FND-009
      localStorage.setItem("india-explorer:seen-badges:v1", "{ invalid json");

      // Should not throw, should return empty set instead
      const seen = getSeenBadgeIds();
      expect(seen).toEqual(new Set());
      expect(seen.size).toBe(0);
    });

    it("should handle empty array in storage", () => {
      localStorage.setItem("india-explorer:seen-badges:v1", JSON.stringify([]));

      const seen = getSeenBadgeIds();
      expect(seen).toEqual(new Set());
      expect(seen.size).toBe(0);
    });

    it("should handle null values gracefully", () => {
      localStorage.setItem("india-explorer:seen-badges:v1", JSON.stringify([null]));

      // Even with invalid content, should return a Set without throwing
      const seen = getSeenBadgeIds();
      expect(seen).toBeInstanceOf(Set);
    });
  });

  describe("markBadgeAsSeen", () => {
    it("should add badge to seen list", () => {
      markBadgeAsSeen("badge-1");

      const seen = getSeenBadgeIds();
      expect(seen.has("badge-1")).toBe(true);
    });

    it("should add multiple badges without duplicates", () => {
      markBadgeAsSeen("badge-1");
      markBadgeAsSeen("badge-2");
      markBadgeAsSeen("badge-1"); // Add same badge again

      const seen = getSeenBadgeIds();
      expect(seen.size).toBe(2);
      expect(seen.has("badge-1")).toBe(true);
      expect(seen.has("badge-2")).toBe(true);
    });

    it("should persist to localStorage", () => {
      markBadgeAsSeen("explorer-badge");

      const stored = localStorage.getItem("india-explorer:seen-badges:v1");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toContain("explorer-badge");
    });

    it("should recover from corrupted storage", () => {
      // Start with corrupted data
      localStorage.setItem("india-explorer:seen-badges:v1", "invalid");

      // Try to mark a badge as seen
      // Should not throw and should overwrite corrupted data
      markBadgeAsSeen("new-badge");

      const seen = getSeenBadgeIds();
      expect(seen.has("new-badge")).toBe(true);
      expect(seen.size).toBe(1);
    });
  });

  describe("getNewlyUnlockedBadges", () => {
    it("should return empty array when no badges unlocked", () => {
      const badges: AchievementBadge[] = [
        {
          id: "badge-1",
          tier: "seedling",
          icon: "🌱",
          name: "Starter",
          description: "Started journey",
          achievementId: "starter",
          achievementMax: 1,
          toneColor: "green",
          unlocked: false,
          progress: 0,
        },
      ];

      const newly = getNewlyUnlockedBadges(badges);
      expect(newly).toEqual([]);
    });

    it("should return newly unlocked badges not yet seen", () => {
      const badges: AchievementBadge[] = [
        {
          id: "badge-1",
          tier: "seedling",
          icon: "🌱",
          name: "Starter",
          description: "Started journey",
          achievementId: "starter",
          achievementMax: 1,
          toneColor: "green",
          unlocked: true,
          progress: 1,
        },
      ];

      const newly = getNewlyUnlockedBadges(badges);
      expect(newly.length).toBe(1);
      expect(newly[0].id).toBe("badge-1");
    });

    it("should not return badges already seen", () => {
      markBadgeAsSeen("badge-1");

      const badges: AchievementBadge[] = [
        {
          id: "badge-1",
          tier: "seedling",
          icon: "🌱",
          name: "Starter",
          description: "Started journey",
          achievementId: "starter",
          achievementMax: 1,
          toneColor: "green",
          unlocked: true,
          progress: 1,
        },
      ];

      const newly = getNewlyUnlockedBadges(badges);
      expect(newly).toEqual([]);
    });

    it("should handle mix of seen and unseen badges", () => {
      markBadgeAsSeen("seen-badge");

      const badges: AchievementBadge[] = [
        {
          id: "seen-badge",
          tier: "seedling",
          icon: "🌱",
          name: "Seen",
          description: "Already seen",
          achievementId: "seen",
          achievementMax: 1,
          toneColor: "green",
          unlocked: true,
          progress: 1,
        },
        {
          id: "new-badge",
          tier: "growing",
          icon: "🌿",
          name: "New",
          description: "Not seen yet",
          achievementId: "new",
          achievementMax: 2,
          toneColor: "blue",
          unlocked: true,
          progress: 2,
        },
      ];

      const newly = getNewlyUnlockedBadges(badges);
      expect(newly.length).toBe(1);
      expect(newly[0].id).toBe("new-badge");
    });
  });

  describe("getBadgeNotificationMessage", () => {
    it("should return notification message for seedling badge", () => {
      const badge: AchievementBadge = {
        id: "starter",
        tier: "seedling",
        icon: "🌱",
        name: "First Steps",
        description: "Completed first state",
        achievementId: "starter",
        achievementMax: 1,
        toneColor: "green",
        unlocked: true,
        progress: 1,
      };

      const msg = getBadgeNotificationMessage(badge);
      expect(msg.title).toContain("Seedling");
      expect(msg.subtitle).toBe("First Steps");
      expect(msg.emoji).toBe("🌱");
    });

    it("should return different emoji for each tier", () => {
      const tiers: Array<[string, string]> = [
        ["seedling", "🌱"],
        ["growing", "🌿"],
        ["mighty", "🌳"],
        ["elite", "🌲"],
      ];

      for (const [tier, emoji] of tiers) {
        const badge: AchievementBadge = {
          id: `badge-${tier}`,
          tier: tier as any,
          icon: emoji,
          name: `${tier} Badge`,
          description: "Test",
          achievementId: tier,
          achievementMax: 1,
          toneColor: "green",
          unlocked: true,
          progress: 1,
        };

        const msg = getBadgeNotificationMessage(badge);
        expect(msg.emoji).toBe(emoji);
      }
    });

    it("should use fallback emoji if badge icon missing", () => {
      const badge: AchievementBadge = {
        id: "no-icon",
        tier: "seedling",
        icon: "",
        name: "No Icon Badge",
        description: "Test",
        achievementId: "test",
        achievementMax: 1,
        toneColor: "green",
        unlocked: true,
        progress: 1,
      };

      const msg = getBadgeNotificationMessage(badge);
      expect(msg.emoji).toBe("🌱"); // Fallback to tier emoji
    });
  });
});
