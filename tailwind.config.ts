/**
 * Tailwind Configuration - India Explorer
 *
 * This file extends the default Tailwind theme with design tokens.
 * @lovable.dev/vite-tanstack-config automatically detects and applies this.
 *
 * Do NOT add plugins here — Lovable pre-configures all necessary plugins.
 */

import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      borderWidth: {
        thin: "var(--border-width-thin)",
        DEFAULT: "var(--border-width-default)",
        prominent: "var(--border-width-prominent)",
        chart: "var(--border-width-chart)",
      },
    },
  },
} satisfies Config;
