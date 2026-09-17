/**
 * Comprehensive logging system for debugging white screen issues
 * Captures logs to local storage and sends to console for inspection
 * 
 * FIX #5: No PII exposure - sanitize profile data before logging
 * FIX #11: No stack trace exposure - redact sensitive URLs and data
 */

import { firebaseEvents } from './firebase-events';

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

/**
 * FIX #5: Redact sensitive data from logs
 */
function redactSensitiveData(data: any): any {
  if (!data) return data
  
  if (typeof data === 'string') {
    // Remove URLs, tokens, IDs
    return data
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      .replace(/token[:\s=]+[^\s]+/gi, 'token: [REDACTED]')
      .replace(/key[:\s=]+[^\s]+/gi, 'key: [REDACTED]')
  }

  if (typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item))
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    // Redact known sensitive fields
    if (key.toLowerCase().includes('profile') || 
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('email') ||
        key.toLowerCase().includes('phone') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('secret')) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = redactSensitiveData(value)
    }
  }
  return sanitized
}

/**
 * FIX #11: Redact stack traces - remove sensitive URLs and file paths
 */
function redactStackTrace(stack?: string): string | undefined {
  if (!stack) return undefined
  
  return stack
    .split('\n')
    .map(line => {
      // Remove query parameters and tokens
      return line
        .replace(/\?[^\s]+/g, '?[REDACTED]')
        .replace(/token[=:][^\s]+/gi, 'token=[REDACTED]')
        .replace(/key[=:][^\s]+/gi, 'key=[REDACTED]')
    })
    .join('\n')
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 500;
  private readonly STORAGE_KEY = 'app_debug_logs';

  constructor() {
    this.loadFromStorage();
    this.captureGlobalErrors();
  }

  private captureGlobalErrors() {
    // Capture unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        // FIX #11: Redact stack traces before logging
        const redactedStack = redactStackTrace(event.error?.stack)
        
        this.error('global_error', `${event.message} at ${event.filename}:${event.lineno}`, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          // Don't include full stack in data - store redacted version separately
        }, event.error);
        
        // Track crash event - only send error message, no stack
        try {
          firebaseEvents.crash({
            errorType: 'uncaught_error',
            errorMessage: event.message,
            // FIX #5: Don't send stack traces to Firebase (contains sensitive data)
            ageBand: 'unknown', // Don't read profile from localStorage - causes PII exposure
          });
        } catch (e) {
          // Silently fail if Firebase events not available
        }
      });

      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.error('unhandled_rejection', event.reason?.message || String(event.reason), {
          reason: typeof event.reason === 'object' ? '[Object]' : redactSensitiveData(event.reason),
        });
        
        // Track crash event - sanitized
        try {
          firebaseEvents.crash({
            errorType: 'unhandled_rejection',
            errorMessage: event.reason?.message || String(event.reason),
            ageBand: 'unknown', // Don't read from localStorage
          });
        } catch (e) {
          // Silently fail if Firebase events not available
        }
      });
    }
  }

  private addLog(entry: LogEntry) {
    // FIX #5: Sanitize data before storing
    const sanitizedEntry: LogEntry = {
      ...entry,
      data: entry.data ? redactSensitiveData(entry.data) : undefined,
      stack: entry.stack ? redactStackTrace(entry.stack) : undefined,
    }

    this.logs.push(sanitizedEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Save to local storage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      // localStorage might be full or unavailable
    }

    // Log to console with styling
    this.logToConsole(sanitizedEntry);
  }

  private logToConsole(entry: LogEntry) {
    const time = new Date(entry.timestamp).toISOString();
    const prefix = `[${time}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    const style = {
      debug: 'color: #888; font-weight: normal;',
      info: 'color: #0066cc; font-weight: bold;',
      warn: 'color: #ff9900; font-weight: bold;',
      error: 'color: #cc0000; font-weight: bold;',
    }[entry.level];

    console.log(`%c${prefix} ${entry.message}`, style, entry.data || '');
    
    if (entry.stack) {
      console.log(`%cStack: ${entry.stack}`, 'color: #999; font-size: 0.85em;');
    }
  }

  debug(category: string, message: string, data?: any) {
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      category,
      message,
      data,
    });
  }

  info(category: string, message: string, data?: any) {
    this.addLog({
      timestamp: Date.now(),
      level: 'info',
      category,
      message,
      data,
    });
  }

  warn(category: string, message: string, data?: any) {
    this.addLog({
      timestamp: Date.now(),
      level: 'warn',
      category,
      message,
      data,
    });
  }

  error(category: string, message: string, data?: any, error?: Error) {
    this.addLog({
      timestamp: Date.now(),
      level: 'error',
      category,
      message,
      data,
      stack: error?.stack,
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsAsText(): string {
    return this.logs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${
            log.data ? ` ${JSON.stringify(log.data)}` : ''
          }`
      )
      .join('\n');
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear logs from localStorage', e);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load logs from localStorage', e);
    }
  }

  /**
   * Export logs for sharing/debugging
   */
  exportLogs(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        logs: this.logs,
      },
      null,
      2
    );
  }
}

// Global logger instance
export const appLogger = new Logger();

// Also make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__APP_LOGGER__ = appLogger;
  console.log('%cDebug logger available at window.__APP_LOGGER__', 'color: #0066cc; font-weight: bold;');
}
