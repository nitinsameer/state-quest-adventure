/**
 * Theme Registry & Metadata
 *
 * Central registry of all available themes.
 * Used by the theme picker UI and theme store to manage theme selection and display.
 */

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
}

// Per-theme music removed — no real audio assets exist yet. To re-add: restore musicUrl field in Theme type, add real licensed loop files to public/music/, restore the toggle in ThemesScreen.tsx.

export const THEMES: Theme[] = [
  // Light & Clean
  {
    id: "clay",
    name: "Claymorphism",
    description: "Soft, warm, and friendly. The default India Explorer theme.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#ece8fb", surface: "#f7f4ff", text: "#2d2650", accent: "#7c5cf0" },
  },
  {
    id: "neu",
    name: "Neumorphism",
    description: "Subtle depth with soft shadows. Minimalist soft-UI design.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#e0e5ec", surface: "#e0e5ec", text: "#3d4468", accent: "#5b6cff" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and minimal. Apple-inspired simplicity.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#f5f5f7", surface: "#fff", text: "#1d1d1f", accent: "#0071e3" },
  },
  {
    id: "material",
    name: "Material Design 3",
    description: "Modern Material Design. Google's design language.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#fef7ff", surface: "#f3edf7", text: "#1d1b20", accent: "#6750a4" },
  },
  {
    id: "bento",
    name: "Bento Box",
    description: "Clean grids and sharp edges. Modern app layout.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#f2f2f0", surface: "#fff", text: "#111", accent: "#ff5a1f" },
  },
  {
    id: "pop",
    name: "Pop",
    description: "Playful and vibrant. Bold gradients and colors.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#fff7fb", surface: "#fff", text: "#2a2140", accent: "#c471ed" },
  },
  {
    id: "paper",
    name: "Paper",
    description: "Notebook and handwritten feel. Warm and organic.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#f6efe0", surface: "#fffdf6", text: "#3a3a4a", accent: "#d9534f" },
  },

  // Dark & Specialized
  {
    id: "claydark",
    name: "Claymorphism Dark",
    description: "Dark variant of Claymorphism. Soft shadows on dark.",
    isDark: true,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#1e1a36", surface: "#27224a", text: "#f0ecff", accent: "#9b82ff" },
  },
  {
    id: "glass",
    name: "Glassmorphism",
    description: "Modern and translucent. Frosted glass effect with blur.",
    isDark: false,
    effects: { blur: true, glow: false, heavy: true },
    previewTokens: { bg: "#6a4fe0", surface: "rgba(255,255,255,.18)", text: "#fff", accent: "#fff" },
  },
  {
    id: "skeuo",
    name: "Skeumorphism",
    description: "Realistic and tactile. Detailed shadows and textures.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#d8d2c4", surface: "#fcfcfc", text: "#3b2a1e", accent: "#1f6fd6" },
  },
  {
    id: "aero",
    name: "Futura Aero",
    description: "Clean, futuristic, and streamlined. Aerospace-inspired.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#bff0ff", surface: "#fff", text: "#0b3a5a", accent: "#0b82d6" },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Northern lights inspired. Radiant gradients with glow.",
    isDark: true,
    effects: { blur: true, glow: true, heavy: true },
    previewTokens: { bg: "#0b1020", surface: "rgba(255,255,255,.08)", text: "#f2f6ff", accent: "#5ef2c2" },
  },
  {
    id: "cartoon",
    name: "Cartoon Comic",
    description: "Playful and vibrant. Bold lines, bright colors, comic book style.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#7ad7ff", surface: "#fff", text: "#1b1b1b", accent: "#ff4757" },
  },

  // Retro & Technical
  {
    id: "pixel",
    name: "Pixel Retro",
    description: "Retro pixel art. No rounded corners, sharp 8-bit aesthetic.",
    isDark: true,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#1a1c2c", surface: "#29366f", text: "#f4f4f4", accent: "#ffcd75" },
  },
  {
    id: "term",
    name: "Terminal",
    description: "Matrix green terminal. Classic hacker aesthetic.",
    isDark: true,
    effects: { blur: false, glow: true, heavy: false },
    previewTokens: { bg: "#0a0f0a", surface: "#0d140d", text: "#33ff66", accent: "#33ff66" },
  },
  {
    id: "oled",
    name: "OLED",
    description: "Pure black OLED optimized. Zero shadows for efficiency.",
    isDark: true,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#000", surface: "#0b0b0b", text: "#f5f5f5", accent: "#4de1c1" },
  },

  // Bold & High-Contrast
  {
    id: "brutal",
    name: "Brutalist",
    description: "Bold and stark. Yellow and pink with thick black borders.",
    isDark: false,
    effects: { blur: false, glow: false, heavy: false },
    previewTokens: { bg: "#ffe66d", surface: "#fff", text: "#111", accent: "#ff3d7f" },
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    description: "Neon glow and cyber aesthetic. Bright accents on dark.",
    isDark: true,
    effects: { blur: false, glow: true, heavy: true },
    previewTokens: { bg: "#07071a", surface: "#12122e", text: "#e8f0ff", accent: "#00f5d4" },
  },
  {
    id: "synth",
    name: "Synthwave",
    description: "Retro-futuristic neon. Bright pink and cyan on dark.",
    isDark: true,
    effects: { blur: false, glow: true, heavy: true },
    previewTokens: { bg: "#1a0536", surface: "rgba(26,5,54,.72)", text: "#ffe8ff", accent: "#2ee6ff" },
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
