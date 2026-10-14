/**
 * Centralized Emoji Constants
 * 
 * All hardcoded emoji in the app should be imported from this file,
 * not embedded directly in components. This ensures:
 * - Consistent emoji usage across the app
 * - Easy to update emoji in one place
 * - Better control over emoji rendering and fallbacks
 * - Proper UTF-8 encoding handling
 * 
 * MIGRATION STATUS: This file defines the centralized emoji registry, but
 * components have not yet been updated to use it. Hardcoded emoji remain in:
 * - screens.tsx (BottomNav, milestones, achievements, etc.)
 * - HomeScreen.tsx
 * - IndiaProgressMap.tsx
 * - ParentZone.tsx
 * - And 8+ other component files
 * 
 * TODO: Complete the migration by updating all components to import from
 * this file instead of using hardcoded emoji literals. This is tracked as
 * a follow-up after the theme/charset fixes.
 */

// Navigation emoji
export const EMOJI = {
  // Bottom Navigation
  nav: {
    home: '🏠',
    map: '🗺️',
    explorer: '🗺️',
    badges: '🏅',
    profile: '👤',
  },

  // Age bands
  ageBand: {
    toddler: '🌱',  // 3-5 years
    young: '🌿',    // 6-7 years
    mid: '🌳',      // 8-9 years
    preteen: '🌲',  // 10-12 years
  },

  // Milestones and rewards
  milestone: {
    twentyFive: '🎯',   // 25% completion
    fifty: '🌍',        // 50% completion
    seventyFive: '🎉',  // 75% completion
    hundred: '🏆',      // 100% completion
  },

  // Achievements and badges
  achievement: {
    badge: '🏅',
    explorer: '🎖️',
    monument: '🛖',
    animal: '🦁',
  },

  // Actions and interactions
  action: {
    celebrate: '🎉',
    sparkle: '✨',
    arrow: '→',
    pointingFinger: '👉',
    birthday: '🎂',
    celebration: '🎉',
    runningMan: '🏃‍♂️',
    momentum: '💨',
    star: '⭐',
    halfwayStar: '⭐',
  },

  // Utilities
  utility: {
    worldMap: '🌍',
    tree: '🌳',
    regionComplete: '✨',
    target: '🎯',
    confetti: '🎉',
    warning: '🚨',
    alert: '🛖',
  },

  // Debug and logging (for console only)
  debug: {
    clapboard: '🎬',
    timer: '⏱️',
  },

  // Feedback
  feedback: {
    success: '🎉',
    correct: '🎉',
    encouragement: '💪',
    trophy: '🏆',
    goal: '🎯',
    rocket: '🚀',
    sparkles: '✨',
  },

  // UI Elements
  ui: {
    stars: '⭐⭐⭐',
    emptyStar: '☆',
    filleStar: '⭐',
  },

  // Theme picker
  theme: {
    painter: '🎨',
    style: '🎨',
  },

  // Invite
  invite: '✨',

  // Data deletion
  delete: '🗑️',
};

/**
 * Helper function to get emoji by path
 * Example: getEmoji('nav.home') returns '🏠'
 */
export function getEmoji(path: string): string {
  const keys = path.split('.');
  let value: any = EMOJI;
  for (const key of keys) {
    value = value[key];
    if (!value) return '';
  }
  return value;
}
