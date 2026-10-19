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
 * MIGRATION STATUS: Complete centralization of all emoji constants.
 * All components should import and use EMOJI constants from this registry.
 */

import type { ThemeCategory } from "@/lib/themes";

// Navigation emoji
export const EMOJI = {
  // Bottom Navigation
  nav: {
    home: "🏠",
    map: "🗺️",
    explorer: "🗺️",
    badges: "🏅",
    profile: "👤",
  },

  // Age bands
  ageBand: {
    toddler: "🌱", // 3-5 years
    young: "🌿", // 6-7 years
    mid: "🌳", // 8-9 years
    preteen: "🌲", // 10-12 years
  },

  // Milestones and rewards
  milestone: {
    twentyFive: "🎯", // 25% completion
    fifty: "🌍", // 50% completion
    seventyFive: "🎉", // 75% completion
    hundred: "🏆", // 100% completion
  },

  // Achievements and badges
  achievement: {
    badge: "🏅",
    defaultBadge: "🏅",
    explorer: "🎖️",
    monument: "🛖",
    animal: "🦁",
  },

  // Actions and interactions
  action: {
    celebrate: "🎉",
    sparkle: "✨",
    arrow: "→",
    leftArrow: "←",
    chevron: "›",
    pointingFinger: "👉",
    birthday: "🎂",
    celebration: "🎉",
    runningMan: "🏃‍♂️",
    momentum: "💨",
    star: "⭐",
    stars: "⭐⭐⭐",
    emptyStar: "☆",
    done: "✓",
    checkmark: "✓",
    checkButton: "✅",
    rocket: "🚀",
    fire: "🔥",
    edit: "✏️",
    gear: "⚙️",
    airplane: "✈️",
    lock: "🔒",
    play: "▶️",
    replay: "🔄",
    share: "📤",
    save: "💾",
    stamp: "🎫",
    analytics: "📊",
    growth: "📈",
    thinking: "🤔",
    encouragement: "💪",
    wave: "👋",
    error: "💥",
    reload: "🔄",
    document: "📋",
    delete: "🗑️",
    listen: "👂",
  },

  // Utilities
  utility: {
    worldMap: "🗺️",
    population: "👥",
    capital: "🏛️",
    food: "🍛",
    warning: "⚠️",
    language: "🗣️",
    compass: "🧭",
    tools: "🛠", // No variation selector - matches reference theme
    debug: "🐛",
  },

  // Learning and content
  learning: {
    funFact: "💡",
    brain: "🧠",
    game: "🎮",
    state: "🗺️",
    book: "📚",
  },

  // Debug and logging (for console only - not for UI)
  debug: {
    clapboard: "🎬",
    timer: "⏱️",
    info: "🔵",
  },

  // Feedback and encouragement
  feedback: {
    success: "🎉",
    correct: "🎉",
    encouragement: "💪",
    trophy: "🏆",
    goal: "🎯",
    rocket: "🚀",
    sparkles: "✨",
    unlocked: "⭐",
    newLevel: "🎉",
  },

  // Daily goal messages
  goal: {
    met: "🏆",
    progress: "🎯",
    start: "🚀",
    complete: "🎉",
    motivate: "💪",
  },

  // Quiz and learning
  quiz: {
    celebrate: "🎉",
    correct: "🎉",
    playAgain: "⭐⭐⭐",
    newLevel: "🎉",
    sticker1: "😋",
    sticker2: "🎉",
    sticker3: "🎉",
    question: "❓",
  },

  // Postcard and celebrations
  postcard: {
    saved: "✨",
    nextState: "🎯",
    keepIt: "🎉",
    unlocked: "✨",
  },

  // Theme picker
  theme: {
    painter: "🎨",
    style: "🎨",
    bright: "🌈",
    night: "🌙",
    fancy: "✨",
    clean: "❄️",
    classic: "🎬",
  },

  // Cool facts and learning
  facts: {
    fact: "✨",
    activity: "🎮",
    more: "⭐",
    allFacts: "⭐",
  },

  // Language
  language: {
    globe: "🌍",
    indFlag: "🇮🇳",
  },

  // Hardware
  hardware: {
    phone: "📱",
  },

  // Family and social
  family: {
    group: "👪",
  },

  // Communication
  communication: {
    email: "📧",
  },

  // Progress states
  progress: {
    streamStart: "🚀",
    streamHalfway: "🌳",
    streamAlmost: "🏆",
    streamComplete: "👑",
    streamCongrats: "👑",
  },

  // Milestones
  explorer: {
    five: "🌱",
    ten: "🌿",
    fifteen: "🌳",
    twenty: "🏆",
    twentyFive: "💎",
    thirty: "👑",
    thirtySix: "🎉",
  },

  // Unlocks and badges
  unlocks: {
    badgeIcon: "🏅",
  },

  // Audio and permissions
  audio: {
    sounds: "🎮",
    music: "🎵",
    stories: "🎧",
    switch: "🌍",
    speaker: "🔊",
    headphones: "🎧",
    muted: "🔇",
  },

  // UI elements
  ui: {
    close: "✕",
    pause: "⏸️",
    delete: "❌",
    checkButton: "✅",
    pending: "⏳",
    chevronDown: "▼",
  },

  // Other icons
  icons: {
    language: "🌍",
    deleteIcon: "🗑️",
    invite: "✨",
    badges: "🏆",
    facts: "📖",
  },
};

/**
 * Category labels with fun names for the theme picker.
 * Each category has an emoji, formal label, and fun/engaging subtitle.
 */
export const CATEGORY_LABELS: Record<ThemeCategory, { emoji: string; label: string; fun: string }> = {
  bright: { emoji: EMOJI.theme.bright, label: "Bright & Fun", fun: "Rainbow Vibes" },
  night: { emoji: EMOJI.theme.night, label: "Night Mode", fun: "Midnight Dreams" },
  fancy: { emoji: EMOJI.theme.fancy, label: "Fancy", fun: "Magic Moments" },
  clean: { emoji: EMOJI.theme.clean, label: "Simple & Clean", fun: "Crystal Clean" },
  classic: { emoji: EMOJI.theme.classic, label: "Classic", fun: "Storybook Time" },
};

/**
 * Helper function to get emoji by path
 * Example: getEmoji('nav.home') returns '🏠'
 */
export function getEmoji(path: string): string {
  const keys = path.split(".");
  let value: unknown = EMOJI;
  for (const key of keys) {
    if (typeof value === "object" && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return "";
    }
  }
  return typeof value === "string" ? value : "";
}
