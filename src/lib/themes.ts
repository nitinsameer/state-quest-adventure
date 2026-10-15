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
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      accent: '#FF7A1A',
    },
  },
  {
    id: 'aero',
    name: 'Futura Aero',
    description: 'Clean, futuristic, and streamlined. Modern aerospace-inspired design.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1A1A1A',
      accent: '#0066CC',
    },
  },
  {
    id: 'cartoon-comic',
    name: 'Cartoon Comic',
    description: 'Playful and vibrant. Bold lines, bright colors, comic book style.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: '#FFF9E6',
      surface: '#FFFFFF',
      text: '#000000',
      accent: '#FF0000',
    },
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Modern and translucent. Frosted glass effect with soft blur.',
    isDark: false,
    effects: {
      blur: true,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      accent: '#667EEA',
    },
  },
  {
    id: 'skeumorphism',
    name: 'Skeumorphism',
    description: 'Realistic and tactile. Detailed shadows and textures. Nostalgic iOS feel.',
    isDark: false,
    effects: {
      blur: false,
      glow: false,
      heavy: false,
    },
    previewTokens: {
      bg: '#F5F5F5',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      accent: '#FF9500',
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
