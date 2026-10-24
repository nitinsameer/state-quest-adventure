/**
 * Postcard Settings
 *
 * Stores user preferences for postcard sharing in localStorage.
 */

import { STORAGE_KEYS } from "@/constants/storageKeys";

const STORAGE_KEY = STORAGE_KEYS.postcardSettings;

export interface PostcardSettings {
  // Include child's name on shared postcards
  includeNameOnSharedPostcards?: boolean;
}

function defaultSettings(): PostcardSettings {
  return {
    includeNameOnSharedPostcards: false, // Default OFF for privacy
  };
}

/**
 * Get all postcard settings
 */
export function getPostcardSettings(): PostcardSettings {
  try {
    if (typeof window === "undefined") {
      return defaultSettings();
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultSettings();
    }

    const parsed = JSON.parse(stored);
    return {
      includeNameOnSharedPostcards:
        typeof parsed.includeNameOnSharedPostcards === "boolean"
          ? parsed.includeNameOnSharedPostcards
          : false,
    };
  } catch {
    // Corrupted data - fall back to defaults
    return defaultSettings();
  }
}

/**
 * Update a specific postcard setting
 */
export function setPostcardSetting<K extends keyof PostcardSettings>(
  key: K,
  value: PostcardSettings[K],
): boolean {
  try {
    if (typeof window === "undefined") return false;

    const current = getPostcardSettings();
    const updated = { ...current, [key]: value };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    // Storage error - fail silently
    return false;
  }
}

/**
 * Check if child's name should be included on shared postcards
 */
export function shouldIncludeNameOnSharedPostcards(): boolean {
  return getPostcardSettings().includeNameOnSharedPostcards ?? false;
}
