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
 * Helper function to get emoji by path
 * Example: getEmoji('nav.home') returns '🏠'
 */
export function getEmoji(path: string): string {
  const keys = path.split(".");
  let value: any = EMOJI;
  for (const key of keys) {
    value = value[key];
    if (!value) return "";
  }
  return value;
}
