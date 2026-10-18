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
      colors: {
        // Surface Colors
        "surface-card": "var(--surface-card)",
        "surface-raised": "var(--surface-raised)",
        "surface-sunken": "var(--surface-sunken)",
        "surface-overlay": "var(--surface-overlay)",
        "surface-muted": "var(--surface-muted)",

        // Text Colors
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-on-header": "var(--text-on-header)",
        "text-on-primary": "var(--text-on-primary)",
        "text-link": "var(--text-link)",

        // Action Colors
        "action-primary": "var(--action-primary-bg)",
        "action-secondary": "var(--action-secondary-bg)",
        "action-success": "var(--action-success-bg)",
        "action-disabled": "var(--action-disabled-bg)",

        // Accent Colors
        "accent-1": "var(--accent-1)",
        "accent-1-soft": "var(--accent-1-soft)",
        "accent-1-ink": "var(--accent-1-ink)",
        "accent-2": "var(--accent-2)",
        "accent-2-soft": "var(--accent-2-soft)",
        "accent-2-ink": "var(--accent-2-ink)",
        "accent-3": "var(--accent-3)",
        "accent-3-soft": "var(--accent-3-soft)",
        "accent-3-ink": "var(--accent-3-ink)",
        "accent-4": "var(--accent-4)",
        "accent-4-soft": "var(--accent-4-soft)",
        "accent-4-ink": "var(--accent-4-ink)",
        "accent-5": "var(--accent-5)",
        "accent-5-soft": "var(--accent-5-soft)",
        "accent-5-ink": "var(--accent-5-ink)",
        "accent-6": "var(--accent-6)",
        "accent-6-soft": "var(--accent-6-soft)",
        "accent-6-ink": "var(--accent-6-ink)",

        // Feedback Colors
        "fb-success-bg": "var(--fb-success-bg)",
        "fb-success-fg": "var(--fb-success-fg)",
        "fb-warning-bg": "var(--fb-warning-bg)",
        "fb-warning-fg": "var(--fb-warning-fg)",
        "fb-error-bg": "var(--fb-error-bg)",
        "fb-error-fg": "var(--fb-error-fg)",
        "fb-info-bg": "var(--fb-info-bg)",
        "fb-info-fg": "var(--fb-info-fg)",

        // UI Colors
        "bg-page": "var(--bg-page)",
        "bg-header": "var(--bg-header)",
        "bg-nav": "var(--bg-nav)",
        "border-color": "var(--border-color)",
        "border-subtle": "var(--border-color)",

        // Reference System Variables (for compatibility)
        "surface": "var(--card)",
        "ink": "var(--ink)",
        "mute": "var(--mute)",
      },
      textColor: {
        // Text semantic mappings
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-on-header": "var(--text-on-header)",
        "text-on-primary": "var(--text-on-primary)",
        "text-link": "var(--text-link)",
      },
      borderColor: {
        "border-subtle": "var(--border-color)",
      },
    },
  },
} satisfies Config;
