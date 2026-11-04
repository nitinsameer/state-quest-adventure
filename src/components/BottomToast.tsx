import React, { useEffect, useState } from "react";
import { useToastStore, type ToastConfig } from "@/store/toastStore";
import { EMOJI } from "@/constants/emoji";
import { playSuccessChime } from "@/lib/tone-generator";

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
    error: "bg-fb-error",
    info: "bg-fb-info",
    success: "bg-fb-success",
    warning: "bg-fb-warning",
  };

  return (
    <div
      className={`fixed z-[1050] transform transition-all duration-300 ${
        isExiting ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={{
        bottom: "calc(var(--nav-h, 96px) + 16px)",
        transform: isExiting ? "translateY(100%)" : "translateY(0)",
        width: "min(360px, calc(100vw - 32px))",
        left: "16px",
        right: "16px",
        marginLeft: "auto",
        marginRight: "auto",
        pointerEvents: "auto",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${colors[config.type]} rounded-2xl shadow-elevated-3 border border-default/20 p-4 flex items-center gap-3 text-on-header backdrop-blur-sm w-full`}
      >
        <span className="text-2xl flex-shrink-0 drop-shadow">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight drop-shadow">{config.message}</p>
          {config.subtitle && (
            <p className="text-xs opacity-90 leading-tight mt-1 drop-shadow">{config.subtitle}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-xl hover:opacity-80 active:scale-90 transition-all duration-200 drop-shadow px-3 py-3"
          aria-label="Dismiss"
        >
          {EMOJI.ui.close}
        </button>
      </div>
    </div>
  );
}

/**
 * Bottom Toast Provider
 * Place this at the root level (in __root.tsx)
 * Manages the queue and renders current toast
 * Renders ToastNotification for non-success types only
 * SuccessToast is rendered separately in __root.tsx for better control
 */
export function BottomToastProvider() {
  const current = useToastStore((state) => state.current);
  const dismiss = useToastStore((state) => state.dismiss);

  if (!current) return null;

  // Only render non-success toasts here
  // Success toasts are handled separately by SuccessToast component in __root.tsx
  if (current.type === "success") {
    return null;
  }

  // Render regular toast for error/info/warning types
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1050]"
      style={{ pointerEvents: current ? "auto" : "none" }}
    >
      <ToastNotification config={current} />
    </div>
  );
}
