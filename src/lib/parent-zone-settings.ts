/**
 * Parent Zone Settings
 *
 * Stores parental controls and preferences in localStorage.
 * All settings default to OFF (child-safe defaults).
 */

const STORAGE_KEY = "india-explorer:parent-zone-settings:v1";

export interface ParentZoneSettings {
  // Postcard sharing: include child's name on shared postcards
  postcardNameSharing?: boolean;
  // Future settings can be added here
}

function defaultSettings(): ParentZoneSettings {
  return {
    postcardNameSharing: false, // Default OFF for privacy
  };
}

/**
 * Get all parent zone settings
 */
export function getParentZoneSettings(): ParentZoneSettings {
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
      postcardNameSharing:
        typeof parsed.postcardNameSharing === "boolean" ? parsed.postcardNameSharing : false,
    };
  } catch {
    // Corrupted data - fall back to defaults
    return defaultSettings();
  }
}

/**
 * Update a specific parent zone setting
 */
export function setParentZoneSetting<K extends keyof ParentZoneSettings>(
  key: K,
  value: ParentZoneSettings[K],
): boolean {
  try {
    if (typeof window === "undefined") return false;

    const current = getParentZoneSettings();
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
export function shouldIncludeChildNameOnPostcard(): boolean {
  return getParentZoneSettings().postcardNameSharing ?? false;
}
