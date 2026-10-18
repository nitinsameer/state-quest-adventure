import { useEffect, useState } from "react";
import { appLogger } from "@/lib/logger";
import { EMOJI } from "@/constants/emoji";

/**
 * Debug screen that appears on white screen to show logs and app state
 * Activated by: Tapping in top-left corner 5 times or pressing 'D' key
 */
export function DebugScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "info" | "debug">("all");

  useEffect(() => {
    // Activate with keyboard shortcut 'D'
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
        appLogger.info("debug_screen", "Debug screen toggled via keyboard");
      }
    };

    // Activate with 5 taps in top-left corner
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX < 50 && touch.clientY < 50) {
        setTapCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            setIsVisible((prev) => !prev);
            appLogger.info("debug_screen", "Debug screen toggled via tap");
            return 0;
          }
          return newCount;
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Update logs every 500ms
    const interval = setInterval(() => {
      const allLogs = appLogger.getLogs();
      const filtered = filter === "all" ? allLogs : allLogs.filter((log) => log.level === filter);
      setLogs(filtered);

      if (autoScroll) {
        setTimeout(() => {
          const logContainer = document.getElementById("debug-logs-container");
          if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
          }
        }, 0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible, filter, autoScroll]);

  if (!isVisible) {
    return null;
  }

  const handleExportLogs = () => {
    const exported = appLogger.exportLogs();
    const blob = new Blob([exported], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm("Clear all logs?")) {
      appLogger.clearLogs();
      setLogs([]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-surface-sunken text-text-primary font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="bg-surface-sunken border-b border-surface-muted p-(--padding-xs) flex justify-between items-center flex-wrap gap-(--gap-xs)">
        <div className="flex items-center gap-(--gap-xs)">
          <h1 className="font-bold text-sm">🐛 DEBUG CONSOLE</h1>
          <span className="text-muted-light">Logs: {logs.length}</span>
        </div>
        <div className="flex gap-(--gap-xs) flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded ${
              filter === "all"
                ? "bg-accent-2 text-text-on-primary"
                : "bg-surface-raised hover:bg-surface-elevated"
            }`} style={filter !== "all" ? {color: "var(--text-secondary)"} : undefined}
          >
            All
          </button>
          <button
            onClick={() => setFilter("error")}
            className={`px-2 py-1 rounded ${
              filter === "error"
                ? "bg-error text-text-on-primary"
                : "bg-surface-raised hover:bg-surface-elevated"
            }`} style={filter !== "error" ? {color: "var(--text-secondary)"} : undefined}
          >
            Errors
          </button>
          <button
            onClick={() => setFilter("warn")}
            className={`px-2 py-1 rounded ${
              filter === "warn"
                ? "bg-warning text-text-on-primary"
                : "bg-surface-sunken hover:bg-surface-raised"
            }`} style={filter !== "warn" ? {color: "var(--text-secondary)"} : undefined}
          >
            Warns
          </button>
          <button
            onClick={() => setFilter("info")}
            className={`px-2 py-1 rounded ${
              filter === "info"
                ? "bg-success text-text-on-primary"
                : "bg-surface-raised hover:bg-surface-elevated"
            }`} style={filter !== "info" ? {color: "var(--text-secondary)"} : undefined}
          >
            Info
          </button>
          <label className="px-(--padding-xs) py-(--padding-xs) bg-surface-raised rounded flex items-center gap-(--gap-xs) cursor-pointer hover:bg-surface-elevated">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto
          </label>
          <button
            onClick={handleExportLogs}
            className="px-(--padding-xs) py-(--padding-xs) bg-accent-2 rounded hover:opacity-90"
          >
            Export
          </button>
          <button
            onClick={handleClearLogs}
            className="px-(--padding-xs) py-(--padding-xs) bg-error rounded hover:opacity-90"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-(--padding-xs) py-(--padding-xs) bg-surface-raised rounded hover:bg-surface-elevated"
          >
            Close
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div
        id="debug-logs-container"
        className="flex-1 overflow-y-auto bg-surface-card p-(--padding-xs) space-y-(--space-0-25)"
      >
        {logs.length === 0 ? (
          <div className="text-muted-light">
            <p>No logs found. Try interacting with the app.</p>
            <p className="mt-2 text-xs">
              {EMOJI.milestone.twentyFive} Shortcuts: Ctrl+D to toggle debug | Tap corner 5x to
              toggle
            </p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`border-l-2 pl-2 py-0.5 ${
                log.level === "error"
                  ? "border-error text-error"
                  : log.level === "warn"
                    ? "border-warning text-warning"
                    : log.level === "info"
                      ? "border-success text-success"
                      : "border-text-muted text-muted-light"
              }`}
            >
              <div className="flex gap-(--gap-base)">
                <span className="text-muted-light min-w-fit">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-bold min-w-fit">[{log.level}]</span>
                <span className="text-accent-2 min-w-fit">{log.category}</span>
                <span className="flex-1">{log.message}</span>
              </div>
              {log.data && (
                <div className="ml-2 text-muted-light text-xs mt-1">
                  📊 {JSON.stringify(log.data).substring(0, 150)}
                </div>
              )}
              {log.stack && (
                <div className="ml-2 text-muted-foreground text-xs mt-1 whitespace-pre-wrap overflow-auto max-h-20">
                  {log.stack}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-surface-sunken border-t border-surface-muted p-(--padding-xs) text-xs" style={{color: "var(--text-muted)"}}>
        <p>💡 Ctrl+D or tap corner 5x to toggle | Export logs for analysis</p>
      </div>
    </div>
  );
}
