import React, { useEffect, useState } from "react";
import { useToastStore, type ToastConfig } from "@/store/toastStore";

/**
 * Minimal bottom toast notification for errors and info messages
 * Replaces modal popups for non-critical messages
 * Auto-dismisses after duration
 */
function ToastNotification({ config }: { config: ToastConfig }) {
  const [isExiting, setIsExiting] = useState(false);
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, config.duration ?? 3500);

    return () => clearTimeout(timer);
  }, [config.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismiss();
    }, 200);
  };

  const colors = {
    error: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
  };

  return (
    <div
      className={`fixed bottom-6 left-4 right-4 max-w-md mx-auto transform transition-all duration-200 ${
        isExiting ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`bg-gradient-to-r ${colors[config.type]} rounded-2xl shadow-lg p-4 flex items-center gap-3 text-white`}
      >
        <span className="text-xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{config.message}</p>
          {config.subtitle && (
            <p className="text-xs opacity-90 leading-tight mt-1">{config.subtitle}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-lg hover:opacity-80 active:scale-110 transition-transform"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Bottom Toast Provider
 * Place this at the root level (in __root.tsx)
 * Manages the queue and renders current toast
 */
export function BottomToastProvider() {
  const current = useToastStore((state) => state.current);

  if (!current) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[998]" style={{ pointerEvents: current ? "auto" : "none" }}>
      <ToastNotification config={current} />
    </div>
  );
}
