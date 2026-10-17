/**
 * Badge Unlock Tracker
 * Detects new badge unlocks and triggers notifications
 * Uses localStorage to track which badges have been "seen" by the user
 */

import type { AchievementBadge } from "@/lib/progress";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// Use centralized storage key
const SEEN_BADGES_KEY = STORAGE_KEYS.seenBadges;

/**
 * Get all badges the user has seen notifications for
 */
export function getSeenBadgeIds(): Set<string> {
  if (typeof window === "undefined") return new Set();

  const saved = localStorage.getItem(SEEN_BADGES_KEY);
  if (!saved) return new Set();

  try {
    return new Set(JSON.parse(saved));
  } catch {
    return new Set();
  }
}

/**
 * Mark a badge as seen (user has been notified)
 */
export function markBadgeAsSeen(badgeId: string): void {
  if (typeof window === "undefined") return;

  const seen = getSeenBadgeIds();
  seen.add(badgeId);
  localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(Array.from(seen)));
}

/**
 * Detect new unlocked badges that user hasn't been notified about
 */
export function getNewlyUnlockedBadges(badges: AchievementBadge[]): AchievementBadge[] {
  const seen = getSeenBadgeIds();

  return badges.filter((badge) => badge.unlocked && !seen.has(badge.id));
}

/**
 * Get notification message for a badge
 */
export function getBadgeNotificationMessage(badge: AchievementBadge): {
  title: string;
  subtitle: string;
  emoji: string;
} {
  const tierEmojis: Record<string, string> = {
    seedling: "🌱",
    growing: "🌿",
    mighty: "🌳",
    elite: "🌲",
  };

  const tierLabels: Record<string, string> = {
    seedling: "Seedling Badge",
    growing: "Growing Badge",
    mighty: "Mighty Badge",
    elite: "Elite Badge",
  };

  return {
    title: `${tierLabels[badge.tier] || "Badge"} Unlocked!`,
    subtitle: badge.name,
    emoji: badge.icon || tierEmojis[badge.tier] || "🏆",
  };
}
