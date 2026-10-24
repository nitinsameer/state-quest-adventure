/**
 * Firebase Analytics Events Wrapper - DISABLED FOR KIDS APP
 *
 * Analytics is DISABLED by default for this kids app to protect children's privacy.
 * All event tracking functions are no-ops.
 * Firebase is initialized with analytics collection permanently disabled.
 */

import { appLogger } from "./logger";
import type { BadgeId } from "./progress";

/**
 * Analytics is disabled - all event logging is a no-op
 * This protects children's privacy per COPPA and child safety best practices
 */
function safeLogEvent<T extends Record<string, any>>(eventName: string, params?: T): void {
  // Analytics disabled for kids app - no-op
}

/**
 * Firebase Events API - ALL EVENTS DISABLED FOR KIDS APP
 * All methods are no-ops to protect children's privacy
 */
export const firebaseEvents = {
  // All event logging is disabled for kids app privacy
  sessionStart: (): void => {},
  dailyVisit: (): void => {},
  streakMilestone: (): void => {},
  crash: (): void => {},
  storageHydrationTimeout: (): void => {},
};

export default firebaseEvents;
