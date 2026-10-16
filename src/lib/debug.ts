/**
 * Debug logging utility
 * FIX #6 & #22: Console logging disabled in production builds
 *
 * Logs only appear when:
 * - NODE_ENV === 'development'
 * - Running vite dev or building in dev mode
 *
 * Usage:
 *   debugLog('my-category', 'message', data)
 *   debugWarn('my-category', 'message', data)
 *   debugError('my-category', 'message', data)
 */

const isDev = import.meta.env.DEV;

export function debugLog(category: string, message: string, data?: any): void {
  if (!isDev) return;
  console.log(`[${category}] ${message}`, data || "");
}

export function debugWarn(category: string, message: string, data?: any): void {
  if (!isDev) return;
  console.warn(`[${category}] ${message}`, data || "");
}

export function debugError(category: string, message: string, data?: any): void {
  if (!isDev) return;
  console.error(`[${category}] ${message}`, data || "");
}
