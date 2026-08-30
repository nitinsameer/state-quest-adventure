/**
 * Comprehensive logging system for debugging white screen issues
 * Captures logs to local storage and sends to console for inspection
 */

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
  stack?: string;
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
        this.error('global_error', `${event.message} at ${event.filename}:${event.lineno}`, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        });
      });

      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.error('unhandled_rejection', event.reason?.message || String(event.reason), {
          reason: event.reason,
        });
      });
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Save to local storage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      // localStorage might be full or unavailable
      console.warn('Failed to save logs to localStorage', e);
    }

    // Log to console with styling
    this.logToConsole(entry);
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
