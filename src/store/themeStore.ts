/**
 * Theme Store - Zustand-based theme persistence
 *
 * Manages the active theme and persists the choice to localStorage.
 * Applies the theme by setting data-theme and color-scheme on document.documentElement.
 */

import { create } from "zustand";
import { z } from "zod";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getTheme } from "@/lib/themes";

// Valid theme IDs (must match entries in src/lib/themes.ts)
type ThemeId = "clay" | "aero" | "cartoon-comic" | "glassmorphism" | "skeumorphism";

// Zod validation schema for persisted theme data
const ThemePersistenceSchema = z.object({
  theme: z.string().default("skeumorphism"),
});

type ThemePersistence = z.infer<typeof ThemePersistenceSchema>;

interface ThemeStoreState {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  loadTheme: () => void;
}

const THEME_STORAGE_KEY = "india-explorer:theme:v1";

/**
 * Apply theme to the DOM
 */
function applyTheme(themeId: ThemeId) {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  // Set color-scheme for native controls
  if (themeId.includes("dark")) {
    root.style.colorScheme = "dark";
  } else {
    root.style.colorScheme = "light";
  }

  // Update status bar for native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      const computedStyle = getComputedStyle(root);
      const statusbarStyle = computedStyle.getPropertyValue("--statusbar-style").trim() || "dark";
      const statusbarBg = computedStyle.getPropertyValue("--statusbar-bg").trim() || "#FF8A3D";

      const styleValue = statusbarStyle === "dark" ? Style.Dark : Style.Light;
      StatusBar.setStyle({ style: styleValue }).catch(() => {});
      StatusBar.setBackgroundColor({ color: statusbarBg }).catch(() => {});
    } catch (error) {
      console.warn("Failed to update status bar:", error);
    }
  }

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    try {
      const computedStyle = getComputedStyle(root);
      const statusbarBg = computedStyle.getPropertyValue("--statusbar-bg").trim() || "#FF8A3D";
      metaThemeColor.setAttribute("content", statusbarBg);
    } catch (error) {
      console.warn("Failed to update meta theme-color:", error);
    }
  }
}

/**
 * Safe theme validation - unknown IDs fall back to 'clay'
 */
function validateTheme(value: unknown): ThemeId {
  const validThemes: ThemeId[] = ["clay", "aero", "cartoon-comic", "glassmorphism", "skeumorphism"];

  if (typeof value === "string" && validThemes.includes(value as ThemeId)) {
    return value as ThemeId;
  }

  return "skeumorphism"; // Default fallback
}

/**
 * Global theme store
 */
export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  currentTheme: "skeumorphism",

  setTheme: (themeId: ThemeId) => {
    set({ currentTheme: themeId });

    // Persist to localStorage
    try {
      const data: ThemePersistence = { theme: themeId };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to persist theme to localStorage:", error);
    }

    // Apply theme to DOM
    applyTheme(themeId);
  },

  loadTheme: () => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = ThemePersistenceSchema.parse(parsed);
        const theme = validateTheme(validated.theme);
        set({ currentTheme: theme });
        applyTheme(theme);
      } else {
        // First time: apply default theme
        applyTheme("skeumorphism");
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
      // Silently fall back to default
      set({ currentTheme: "skeumorphism" });
      applyTheme("skeumorphism");
    }
  },
}));

/**
 * Initialize theme from storage on app load
 * Call this in your root layout/hook before rendering
 */
export function initializeTheme() {
  useThemeStore.getState().loadTheme();
}
