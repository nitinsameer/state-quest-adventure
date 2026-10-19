/**
 * Language Fallback Tracker
 *
 * Session-based tracking of which states have already shown the
 * language fallback notification. Uses sessionStorage to ensure
 * notifications reappear after page reload but not on re-play.
 */

const STORAGE_KEY = "india-explorer:fallback-notices-shown";

/**
 * Get the set of states that have shown fallback notice in this session
 * @returns Set of state names, empty set if unavailable
 */
function getShownStates(): Set<string> {
  try {
    if (typeof sessionStorage === "undefined") {
      return new Set();
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return new Set();
    }
    try {
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  } catch {
    return new Set();
  }
}

/**
 * Save the set of shown states to sessionStorage
 */
function saveShownStates(states: Set<string>): void {
  try {
    if (typeof sessionStorage === "undefined") {
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(states)));
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
}

/**
 * Check if a state's language fallback notice has been shown in this session
 * @param stateName - State name (e.g., "Chhattisgarh")
 * @returns true if notification already shown in this session
 */
export function shouldShowFallbackNotice(stateName: string): boolean {
  const shown = getShownStates();
  return !shown.has(stateName);
}

/**
 * Mark a state as having shown its fallback notice in this session
 * @param stateName - State name (e.g., "Chhattisgarh")
 */
export function markFallbackNoticeShown(stateName: string): void {
  const shown = getShownStates();
  shown.add(stateName);
  saveShownStates(shown);
}

/**
 * Clear all fallback notice tracking (for debugging/testing)
 */
export function clearFallbackNoticeTracker(): void {
  try {
    if (typeof sessionStorage === "undefined") {
      return;
    }
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
}
