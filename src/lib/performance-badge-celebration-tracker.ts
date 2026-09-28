/**
 * Performance Badge Celebration Tracker
 * Detects newly unlocked performance badges and triggers celebrations
 * Uses localStorage to track which badges have been celebrated
 */

import type { PerformanceBadgeId } from "@/lib/progress";

const SEEN_PERFORMANCE_BADGES_KEY = "india-explorer:seen-performance-badges:v1";

/**
 * Get all performance badges the user has seen celebrations for
 */
export function getSeenPerformanceBadgeIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  
  const saved = localStorage.getItem(SEEN_PERFORMANCE_BADGES_KEY);
  if (!saved) return new Set();
  
  try {
    return new Set(JSON.parse(saved));
  } catch {
    return new Set();
  }
}

/**
 * Mark a performance badge as seen/celebrated
 */
export function markPerformanceBadgeAsSeen(badgeId: PerformanceBadgeId, stateName: string): void {
  if (typeof window === "undefined") return;
  
  const seen = getSeenPerformanceBadgeIds();
  const key = `${stateName}:${badgeId}`;
  seen.add(key);
  localStorage.setItem(SEEN_PERFORMANCE_BADGES_KEY, JSON.stringify(Array.from(seen)));
}

/**
 * Check if a performance badge has been celebrated
 */
export function hasPerformanceBadgeBeenSeen(badgeId: PerformanceBadgeId, stateName: string): boolean {
  const seen = getSeenPerformanceBadgeIds();
  const key = `${stateName}:${badgeId}`;
  return seen.has(key);
}

/**
 * Get newly unlocked performance badges for a state
 */
export function getNewlyUnlockedPerformanceBadges(
  earnedBadges: PerformanceBadgeId[],
  stateName: string
): PerformanceBadgeId[] {
  return earnedBadges.filter(badgeId => !hasPerformanceBadgeBeenSeen(badgeId, stateName));
}
