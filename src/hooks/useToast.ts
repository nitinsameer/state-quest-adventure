import { useToastStore } from "@/store/toastStore";

/**
 * Hook to show bottom toast notifications
 * Used for errors, info messages, and other non-blocking feedback
 *
 * Usage:
 * const toast = useToast();
 * toast.error("Something went wrong", { subtitle: "Try again" });
 */
export function useToast() {
  const show = useToastStore((state) => state.show);

  return {
    /**
     * Show error toast
     */
    error: (message: string, options?: { subtitle?: string; duration?: number }) => {
      show({
        type: "error",
        message,
        subtitle: options?.subtitle,
        icon: "❌",
        duration: options?.duration ?? 4000,
      });
    },

    /**
     * Show info toast
     */
    info: (message: string, options?: { subtitle?: string; duration?: number }) => {
      show({
        type: "info",
        message,
        subtitle: options?.subtitle,
        icon: "ℹ️",
        duration: options?.duration ?? 3500,
      });
    },

    /**
     * Show success toast
     */
    success: (message: string, options?: { subtitle?: string; duration?: number }) => {
      show({
        type: "success",
        message,
        subtitle: options?.subtitle,
        icon: "✅",
        duration: options?.duration ?? 3500,
      });
    },

    /**
     * Show warning toast
     */
    warning: (message: string, options?: { subtitle?: string; duration?: number }) => {
      show({
        type: "warning",
        message,
        subtitle: options?.subtitle,
        icon: "⚠️",
        duration: options?.duration ?? 4000,
      });
    },

    /**
     * Custom toast with full control
     */
    custom: (
      message: string,
      icon: string,
      options?: { type?: ToastType; subtitle?: string; duration?: number },
    ) => {
      show({
        type: options?.type ?? "info",
        message,
        subtitle: options?.subtitle,
        icon,
        duration: options?.duration,
      });
    },

    // Direct access to store
    dismiss: useToastStore((state) => state.dismiss),
    clearQueue: useToastStore((state) => state.clearQueue),
  };
}

// Re-export for convenience
import type { ToastType } from "@/store/toastStore";
