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

export const THEMES: Theme[] = [
  {
    id: 'clay',
    name: 'Claymorphism',
    description: 'Soft, warm, and friendly. The default India Explorer theme.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: 'var(--bg-page)',
      surface: 'var(--surface-card)',
      text: 'var(--text-primary)',
      accent: 'var(--accent-1)',
    },
  },
  {
    id: 'clay-dark',
    name: 'Clay Dark',
    description: 'Dark mode with soft glow effects. Easier on the eyes at night.',
    isDark: true,
    effects: {
      blur: false,
      glow: true,
      heavy: false,
    },
    previewTokens: {
      bg: 'var(--bg-page)',
      surface: 'var(--surface-card)',
      text: 'var(--text-primary)',
      accent: 'var(--accent-1)',
    },
  },
  {
    id: 'neobrutalism',
    name: 'Neobrutalism',
    description: 'Bold and utilitarian. Hard edges, solid fills, tactile shadows.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: 'var(--bg-page)',
      surface: 'var(--surface-card)',
      text: 'var(--text-primary)',
      accent: 'var(--accent-1)',
    },
  },
  {
    id: 'minimal-flat',
    name: 'Minimal Flat',
    description: 'Calm and minimal. Soft pastels, no shadows. Maximum clarity.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: 'var(--bg-page)',
      surface: 'var(--surface-card)',
      text: 'var(--text-primary)',
      accent: 'var(--accent-1)',
    },
  },
  {
    id: 'material-you',
    name: 'Material You',
    description: 'Modern and expressive. Inspired by Material Design 3.',
    isDark: false,
    hidden: true,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: 'var(--bg-page)',
      surface: 'var(--surface-card)',
      text: 'var(--text-primary)',
      accent: 'var(--accent-1)',
    },
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    description: 'Soft and sophisticated. Subtle shadows create depth and refinement.',
    isDark: false,
    hidden: true,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: 'var(--bg-page)',
      surface: 'var(--surface-card)',
      text: 'var(--text-primary)',
      accent: 'var(--accent-1)',
    },
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Vivid and vibrant. Rangoli-inspired, celebrating India\'s colours.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: '#FFF6E5',
      surface: '#FFFFFF',
      text: '#131A33',
      accent: '#FF8A3D',
    },
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
