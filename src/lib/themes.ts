/**
 * Theme Registry & Metadata
 *
 * Central registry of all available themes.
 * Used by the theme picker UI and theme store to manage theme selection and display.
 *
 * NOTE: The previewTokens objects contain hex and rgba values for theme preview display.
 * These are design-time values used only in the theme picker UI to show what each theme looks like.
 * They are not applied to the app UI itself and are exempt from the hardcoding rule.
 * eslint-disable no-hardcoded-colors/no-hardcoded-colors
 */

import { EMOJI } from "@/constants/emoji";

export type ThemeCategory = "bright" | "night" | "fancy" | "clean" | "classic";

export interface Theme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  hidden?: boolean;
  effects: {
    blur: boolean;
    glow: boolean;
    heavy: boolean;
  };
  previewTokens: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
  };
  unlockRule?: { type: "states" | "streak" | "badges" | "firstBadge"; value: number };
  category: "bright" | "night" | "fancy" | "clean" | "classic";
}

// Per-theme music removed — no real audio assets exist yet. To re-add: restore musicUrl field in Theme type, add real licensed loop files to public/music/, restore the toggle in ThemesScreen.tsx.

export const THEMES: Theme[] = [
  // BRIGHT category - free first
  {
    id: "pop",
    name: "Bubblegum Pop",
    description: "Playful and vibrant. Bold gradients and colors.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#fff7fb", surface: "#fff", text: "#2a2140", accent: "#c471ed" },
    category: "bright",
  },
  {
    id: "brutal",
    name: "Paintbrush Bold",
    description: "Bold and stark. Yellow and pink with thick black borders.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#ffe66d", surface: "#fff", text: "#111", accent: "#ff3d7f" },
    unlockRule: { type: "states", value: 6 },
    category: "bright",
  },
  {
    id: "bento",
    name: "Rainbow Box",
    description: "Clean grids and sharp edges. Modern app layout.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#f2f2f0", surface: "#fff", text: "#111", accent: "#ff5a1f" },
    unlockRule: { type: "states", value: 10 },
    category: "bright",
  },
  {
    id: "cartoon",
    name: "Comic Book",
    description: "Playful and vibrant. Bold lines, bright colors, comic book style.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#7ad7ff", surface: "#fff", text: "#1b1b1b", accent: "#ff4757" },
    category: "bright",
  },

  // NIGHT category - free first
  {
    id: "claydark",
    name: "Twilight Clay",
    description: "Dark variant of Claymorphism. Soft shadows on dark.",
    isDark: true,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#1e1a36", surface: "#27224a", text: "#f0ecff", accent: "#9b82ff" },
    category: "night",
  },
  {
    id: "oled",
    name: "Night Sky",
    description: "Pure black OLED optimized. Zero shadows for efficiency.",
    isDark: true,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#000", surface: "#0b0b0b", text: "#f5f5f5", accent: "#4de1c1" },
    unlockRule: { type: "streak", value: 3 },
    category: "night",
  },
  {
    id: "term",
    name: "Hacker Mode",
    description: "Matrix green terminal. Classic hacker aesthetic.",
    isDark: true,
    effects: { blur: false, glow: true, heavy: false },
    previewTokens: { bg: "#0a0f0a", surface: "#0d140d", text: "#33ff66", accent: "#33ff66" },
    unlockRule: { type: "firstBadge", value: 1 },
    category: "night",
  },
  {
    id: "cyber",
    name: "Neon Lights",
    description: "Neon glow and cyber aesthetic. Bright accents on dark.",
    isDark: true,
    effects: { blur: false, glow: true, heavy: false },
    previewTokens: { bg: "#07071a", surface: "#12122e", text: "#e8f0ff", accent: "#00f5d4" },
    unlockRule: { type: "streak", value: 14 },
    category: "night",
  },
  {
    id: "synth",
    name: "Electric Dream",
    description: "Retro-futuristic neon. Bright pink and cyan on dark.",
    isDark: true,
    effects: { blur: false, glow: true, heavy: false },
    previewTokens: {
      bg: "#1a0536",
      surface: "rgba(26,5,54,.72)",
      text: "#ffe8ff",
      accent: "#2ee6ff",
    },
    unlockRule: { type: "badges", value: 10 },
    category: "night",
  },
  {
    id: "pixel",
    name: "Pixel Retro",
    description: "Retro pixel art. No rounded corners, sharp 8-bit aesthetic.",
    isDark: true,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#1a1c2c", surface: "#29366f", text: "#f4f4f4", accent: "#ffcd75" },
    unlockRule: { type: "badges", value: 25 },
    category: "night",
  },

  // FANCY category - no free starter
  {
    id: "glass",
    name: "Glassmorph Magic",
    description: "Modern and translucent. Frosted glass effect with blur.",
    isDark: true,
    effects: { blur: true, glow: false, heavy: false },
    previewTokens: {
      bg: "#6a4fe0",
      surface: "rgba(255,255,255,.18)",
      text: "#fff",
      accent: "#fff",
    },
    unlockRule: { type: "states", value: 36 },
    category: "fancy",
  },
  {
    id: "aurora",
    name: "Aurora Glow",
    description: "Northern lights inspired. Radiant gradients with glow.",
    isDark: true,
    effects: { blur: true, glow: true, heavy: false },
    previewTokens: {
      bg: "#0b1020",
      surface: "rgba(255,255,255,.08)",
      text: "#f2f6ff",
      accent: "#5ef2c2",
    },
    unlockRule: { type: "streak", value: 7 },
    category: "fancy",
  },
  {
    id: "skeuo",
    name: "Leather Luxury",
    description: "Realistic and tactile. Detailed shadows and textures.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#d8d2c4", surface: "#fcfcfc", text: "#3b2a1e", accent: "#1f6fd6" },
    unlockRule: { type: "states", value: 30 },
    category: "fancy",
  },

  // CLEAN category - free first
  {
    id: "minimal",
    name: "Cloud Simple",
    description: "Clean and minimal. Apple-inspired simplicity.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },

    previewTokens: { bg: "#f5f5f7", surface: "#fff", text: "#1d1d1f", accent: "#0071e3" },
    category: "clean",
  },
  {
    id: "material",
    name: "Paper Pages",
    description: "Modern Material Design. Google's design language.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#fef7ff", surface: "#f3edf7", text: "#1d1b20", accent: "#6750a4" },
    unlockRule: { type: "states", value: 20 },
    category: "clean",
  },
  {
    id: "paper",
    name: "Notebook Paper",
    description: "Notebook and handwritten feel. Warm and organic.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#f6efe0", surface: "#fffdf6", text: "#3a3a4a", accent: "#d9534f" },
    unlockRule: { type: "states", value: 15 },
    category: "clean",
  },
  {
    id: "neu",
    name: "Soft Buttons",
    description: "Subtle depth with soft shadows. Minimalist soft-UI design.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },

    previewTokens: { bg: "#e0e5ec", surface: "#e0e5ec", text: "#3d4468", accent: "#5b6cff" },
    unlockRule: { type: "states", value: 25 },
    category: "clean",
  },

  // CLASSIC category - free first
  {
    id: "clay",
    name: "Warm Clay",
    description: "Soft, warm, and friendly. The default India Explorer theme.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },

    previewTokens: { bg: "#ece8fb", surface: "#f7f4ff", text: "#2d2650", accent: "#7c5cf0" },
    category: "classic",
  },
  {
    id: "aero",
    name: "Sky Blue",
    description: "Clean, futuristic, and streamlined. Aerospace-inspired.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#bff0ff", surface: "#fff", text: "#0b3a5a", accent: "#0b82d6" },
    unlockRule: { type: "states", value: 3 },
    category: "classic",
  },
];

/**
 * Get theme by ID, with fallback to clay (default).
 *
 * @param id - Theme ID
 * @returns Theme object, or clay theme if not found
 */
export function getTheme(id: string): Theme {
  const theme = THEMES.find((t) => t.id === id);
  return theme || THEMES[0]; // Fallback to 'clay'
}

/**
 * Get all available theme IDs.
 */
export function getThemeIds(): string[] {
  return THEMES.map((t) => t.id);
}

/**
 * Get non-heavy themes (for the primary theme picker).
 */
export function getNonHeavyThemes(): Theme[] {
  return THEMES.filter((t) => !t.effects.heavy);
}

/**
 * Get visible non-heavy themes (for the picker UI).
 */
export function getVisibleThemes(): Theme[] {
  return THEMES.filter((t) => !t.effects.heavy && !t.hidden);
}

/**
 * Get heavy themes (glass, blur, glow effects).
 */
export function getHeavyThemes(): Theme[] {
  return THEMES.filter((t) => t.effects.heavy);
}

/**
 * Check if a theme is unlocked based on player progress.
 *
 * A theme is unlocked if:
 * - It has no unlockRule (starter theme), OR
 * - The player's progress meets the unlock condition
 *
 * @param theme Theme to check
 * @param progress Player progress object with completed states, streak, and badges
 * @returns true if theme is unlocked, false if locked
 */
export function isThemeUnlocked(
  theme: Theme,
  progress: { completed: string[]; streak: number; badges: Record<string, string[]> },
): boolean {
  if (!theme.unlockRule) return true; // starter theme

  const { type, value } = theme.unlockRule;
  const totalBadges = Object.values(progress.badges).flat().length;

  switch (type) {
    case "states":
      return progress.completed.length >= value;
    case "streak":
      return progress.streak >= value;
    case "badges":
      return totalBadges >= value;
    case "firstBadge":
      return totalBadges >= 1;
    default:
      return false;
  }
}

/**
 * Get all themes that the player has unlocked.
 *
 * @param progress Player progress object
 * @returns Array of unlocked themes
 */
export function getUnlockedThemes(progress: {
  completed: string[];
  streak: number;
  badges: Record<string, string[]>;
}): Theme[] {
  return THEMES.filter((t) => isThemeUnlocked(t, progress));
}

/**
 * Get badge info for a theme's unlock rule.
 * Used by the theme picker UI to color-code unlock badges.
 */
export function getUnlockBadgeInfo(unlockRule?: Theme["unlockRule"]): {
  color: string;
  icon: string;
  text: string;
} {
  if (!unlockRule) return { color: "var(--color-surface-primary)", icon: "✓", text: "Unlocked" };

  switch (unlockRule.type) {
    case "states":
      return { color: "#3b82f6", icon: "📊", text: `Explore ${unlockRule.value} states` };
    case "streak":
      return { color: "#f97316", icon: "🔥", text: `${unlockRule.value}-day streak` };
    case "badges":
      return {
        color: "#eab308",
        icon: EMOJI.milestone.hundred,
        text: `Earn ${unlockRule.value} badges`,
      };
    case "firstBadge":
      return { color: "#94a3b8", icon: EMOJI.milestone.twentyFive, text: "First badge" };
    default:
      return { color: "#94a3b8", icon: EMOJI.action.lock, text: "Locked" };
  }
}

/**
 * Format unlock condition as kid-friendly text.
 */
export function formatUnlockCondition(rule?: Theme["unlockRule"]): string {
  if (!rule) return "";
  switch (rule.type) {
    case "states":
      return `Complete ${rule.value} places!`;
    case "streak":
      return `Keep a ${rule.value}-day streak!`;
    case "badges":
      return `Collect ${rule.value} badges!`;
    case "firstBadge":
      return "Earn your first badge!";
    default:
      return "";
  }
}
