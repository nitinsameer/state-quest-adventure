/**
 * LocalStorage Keys - Centralized
 *
 * CRITICAL: These are production keys. Do NOT change values without a migration strategy.
 * Changing a key value orphans existing user data and causes silent data loss.
 * If versioning is needed, increment the version suffix (e.g., v1 → v2) and add migration logic.
 */

export const STORAGE_KEYS = {
  // === Core User Progress & State ===
  progress: "india-explorer:progress:v2",
  recentlyCompleted: "india-explorer:recently-completed:v1",
  quizProgress: "india-explorer:quiz-progress:v1",

  // === Theme & UI Preferences ===
  theme: "india-explorer:theme:v1",

  // === Permissions & Consent (COPPA/Privacy) ===
  audioPermissionShown: "india-explorer:audio-permission-shown:v1",
  parentalConsent: "india-explorer:parental-consent:v1",

  // === Tutorial & Onboarding ===
  tutorialShown: "india-explorer:first-session-tutorial-shown:v1",

  // === Postcard Preferences ===
  postcardSettings: "india-explorer:postcard-settings:v1",

  // === Content & Collections ===
  postcards: "india-explorer:postcard-library:v1",
  seenBadges: "india-explorer:seen-badges:v1",

  // === Sound & Effects ===
  sound: "india-explorer:sound:v1",

  // === Analytics & Events ===
  eventQueue: "india-explorer:event-queue:v1",

  // === Legacy & Migration (keep for transition, mark for removal in 2.5) ===
  appVersion: "india-explorer:app-version",
  progressBackup: "india-explorer:progress:v2:backup",
  celebratedMilestones: "india-explorer:milestones-celebrated:v1",
  celebratedUnlocks: "india-explorer:celebrated:v1",
  tutorialSeen: "india-explorer:tutorial-seen:v1",
} as const;

// Type assertion for strict key checking
export type StorageKey = keyof typeof STORAGE_KEYS;
export type StorageKeyValue = (typeof STORAGE_KEYS)[StorageKey];

/**
 * Helper: Get a storage key by name (with autocomplete)
 */
export function getStorageKey(key: StorageKey): string {
  return STORAGE_KEYS[key];
}
