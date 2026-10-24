/**
 * Debug Logging Utility
 *
 * Provides a centralized way to log debug information that respects the
 * import.meta.env.DEV flag, ensuring no console output in production builds.
 *
 * Usage:
 *   debugLog("MyComponent", "Action happened", { data: "value" });
 *   debugError("MyComponent", "Error occurred", error);
 */

/**
 * Log debug information only in development builds
 * @param label - Component or module name
 * @param message - Log message
 * @param data - Optional data object
 */
export function debugLog(label: string, message: string, data?: any): void {
  if (import.meta.env.DEV) {
    console.log(`[${label}] ${message}`, data ?? "");
  }
}

/**
 * Log debug warning only in development builds
 * @param label - Component or module name
 * @param message - Warning message
 * @param data - Optional data object
 */
export function debugWarn(label: string, message: string, data?: any): void {
  if (import.meta.env.DEV) {
    console.warn(`[${label}] ${message}`, data ?? "");
  }
}

/**
 * Log debug error only in development builds
 * @param label - Component or module name
 * @param message - Error message
 * @param error - Error object or additional context
 */
export function debugError(label: string, message: string, error?: Error | any): void {
  if (import.meta.env.DEV) {
    console.error(`[${label}] ${message}`, error ?? "");
  }
}
