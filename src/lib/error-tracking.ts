/**
 * Error Tracking and Crashlytics Integration
 *
 * CRITICAL FIX #1.2: Centralized error logging
 * - Logs errors to local logger
 * - Reports to Crashlytics for production debugging
 * - Implements error boundaries for React rendering errors
 * - Catches hydration errors before they crash the app
 */

import { debugError } from "./debug";
import { appLogger } from "./logger";

export type ErrorContext = {
  boundary?: string;
  errorInfo?: React.ErrorInfo;
  severity?: "low" | "medium" | "high" | "critical";
  userId?: string;
  ageBand?: string;
  screen?: string;
  action?: string;
  data?: Record<string, any>;
};

/**
 * Log an error with full context
 * Used by error boundaries and catch handlers
 */
export function logError(error: Error | unknown, context: ErrorContext = {}): void {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorForLogging = error instanceof Error ? error : undefined;

    // Log to local logger first (always works)
    appLogger.error(
      context.boundary || "error_tracking",
      "Error caught",
      {
        message: errorMessage,
        severity: context.severity || "high",
        boundary: context.boundary,
        screen: context.screen,
        action: context.action,
        ...context.data,
      },
      errorForLogging,
    );

    // Log to debug system
    debugError("error_tracking", `${context.boundary || "Unknown"}: ${errorMessage}`, {
      severity: context.severity,
      stack: errorStack,
      errorInfo: context.errorInfo,
    });

    // Send to Crashlytics if available (Firebase)
    try {
      // Dynamic import to avoid circular dependencies
      import("./firebase-init").then(({ app }) => {
        if (!app) return;

        // Try to get Crashlytics from Firebase
        try {
          const { getFirestore } = require("firebase/firestore");
          const db = getFirestore(app);

          // Log to Firestore errors collection for production debugging
          if (db && typeof window !== "undefined") {
            const errorsCollection = db.collection("app_errors");
            errorsCollection
              .add({
                timestamp: new Date().toISOString(),
                message: errorMessage,
                stack: errorStack,
                boundary: context.boundary,
                severity: context.severity || "high",
                screen: context.screen,
                action: context.action,
                userAgent: navigator.userAgent,
                url: window.location.href,
                ...context.data,
              })
              .catch(() => {
                // Firestore not available
              });
          }
        } catch {
          // Firebase not available
        }
      });
    } catch {
      // Error reporting failed - app continues
    }
  } catch (loggingError) {
    // Prevent infinite loops - if logging fails, fail silently
    console.error("Error logging failed:", loggingError);
  }
}

/**
 * Wrap async functions to catch errors
 * Usage: const safeFn = wrapAsync(myAsyncFn)
 */
export function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: Omit<ErrorContext, "errorInfo"> = {},
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, {
        ...context,
        severity: context.severity || "medium",
      });
      throw error;
    }
  }) as T;
}

/**
 * Wrap sync functions to catch errors
 * Usage: const safeFn = wrapSync(myFn)
 */
export function wrapSync<T extends (...args: any[]) => any>(
  fn: T,
  context: Omit<ErrorContext, "errorInfo"> = {},
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, {
        ...context,
        severity: context.severity || "medium",
      });
      throw error;
    }
  }) as T;
}

/**
 * Safely call a function and return a default value on error
 * Usage: const result = safeTry(() => riskyOperation(), defaultValue)
 */
export function safeTry<T>(
  fn: () => T,
  defaultValue: T,
  context: Omit<ErrorContext, "errorInfo"> = {},
): T {
  try {
    return fn();
  } catch (error) {
    logError(error, {
      ...context,
      severity: context.severity || "low",
    });
    return defaultValue;
  }
}

/**
 * Format error for user-friendly display
 */
export function getErrorMessage(error: Error | unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if error is a hydration error
 */
export function isHydrationError(error: Error): boolean {
  const hydrationErrors = [
    "Hydration failed",
    "getInitialProps",
    "localStorage",
    "sessionStorage",
    "hydrat",
  ];

  return hydrationErrors.some((term) => error.message?.toLowerCase().includes(term.toLowerCase()));
}

/**
 * Check if error is a type error
 */
export function isTypeError(error: Error): boolean {
  return (
    error.message?.includes("Cannot read property") ||
    error.message?.includes("Cannot access property") ||
    error.message?.includes("is not a function")
  );
}

/**
 * Categorize error for appropriate handling
 */
export function categorizeError(error: Error): {
  category: "hydration" | "type" | "async" | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  recoverable: boolean;
} {
  if (isHydrationError(error)) {
    return {
      category: "hydration",
      severity: "critical",
      recoverable: false,
    };
  }

  if (isTypeError(error)) {
    return {
      category: "type",
      severity: "high",
      recoverable: false,
    };
  }

  if (error.message?.includes("AbortError")) {
    return {
      category: "async",
      severity: "low",
      recoverable: true,
    };
  }

  return {
    category: "unknown",
    severity: "medium",
    recoverable: true,
  };
}
