/**
 * Theme Graphics Configuration
 *
 * Maps theme IDs to their unique decorative treatment.
 * Each theme gets a distinctive visual personality for the theme picker preview.
 * Decorations are rendered using CSS shapes and gradients only—no external assets.
 *
 * eslint-disable no-hardcoded-colors/no-hardcoded-colors
 */

export interface ThemeGraphicsDecoration {
  type: "gradient" | "shapes" | "pattern" | "svg" | "mixed";
  description: string;
}

export const THEME_GRAPHICS_CONFIG: Record<string, ThemeGraphicsDecoration> = {
  clay: {
    type: "mixed",
    description: "Warm Clay: Soft overlapping circles with organic gradient",
  },
  pop: {
    type: "shapes",
    description: "Bubblegum Pop: Semi-transparent bubbles with radial gradients",
  },
  cartoon: {
    type: "pattern",
    description: "Comic Book: Speed lines and comic burst shape",
  },
  bento: {
    type: "shapes",
    description: "Rainbow Box: Minimal 2×2 grid of colored squares",
  },
  minimal: {
    type: "mixed",
    description: "Cold Simple: Minimal dots in subtle gradient",
  },
  paper: {
    type: "pattern",
    description: "Notebook Paper: Handwritten-style checkmark and doodle",
  },
  synth: {
    type: "mixed",
    description: "Electro Dream: Neon wireframe and glow effects",
  },
  skeuo: {
    type: "shapes",
    description: "Leather Luxury: Embossed circles with metallic accents",
  },
};

/**
 * Get decoration config for a theme.
 * Returns config if it exists, otherwise returns a safe default.
 */
export function getThemeGraphicsConfig(
  themeId: string,
): ThemeGraphicsDecoration | undefined {
  return THEME_GRAPHICS_CONFIG[themeId];
}
