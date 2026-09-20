import { useCelebrationStore } from "@/store/celebrationStore";

/**
 * Hook to trigger celebration popups throughout the app
 * 
 * Usage:
 * const celebration = useCelebration();
 * celebration.success("Postcard Saved!", { subtitle: "Ready to share" });
 * celebration.error("Permission Denied", { subtitle: "Enable in settings" });
 */
export function useCelebration() {
  const show = useCelebrationStore((state) => state.show);

  return {
    /**
     * Show success celebration with optional confetti
     */
    success: (title: string, options?: { subtitle?: string; confetti?: boolean; duration?: number; action?: { label: string; onClick: () => void } }) => {
      show({
        type: "success",
        title,
        subtitle: options?.subtitle,
        icon: "✅",
        confetti: options?.confetti ?? true,
        duration: options?.duration,
        action: options?.action,
      });
    },

    /**
     * Show error alert without confetti
     */
    error: (title: string, options?: { subtitle?: string; duration?: number; action?: { label: string; onClick: () => void } }) => {
      show({
        type: "error",
        title,
        subtitle: options?.subtitle,
        icon: "❌",
        confetti: false,
        duration: options?.duration ?? 4000,
        action: options?.action,
      });
    },

    /**
     * Show info message
     */
    info: (title: string, options?: { subtitle?: string; duration?: number; action?: { label: string; onClick: () => void } }) => {
      show({
        type: "info",
        title,
        subtitle: options?.subtitle,
        icon: "ℹ️",
        confetti: false,
        duration: options?.duration ?? 3000,
        action: options?.action,
      });
    },

    /**
     * Show achievement unlock with full celebration
     */
    achievement: (title: string, options?: { subtitle?: string; confetti?: boolean; duration?: number; action?: { label: string; onClick: () => void } }) => {
      show({
        type: "achievement",
        title,
        subtitle: options?.subtitle,
        icon: "🏆",
        confetti: options?.confetti ?? true,
        duration: options?.duration ?? 4000,
        action: options?.action,
      });
    },

    /**
     * Custom celebration with full control
     */
    custom: (title: string, icon: string, options?: { subtitle?: string; type?: "success" | "error" | "info"; confetti?: boolean; duration?: number; action?: { label: string; onClick: () => void } }) => {
      show({
        type: options?.type ?? "info",
        title,
        subtitle: options?.subtitle,
        icon,
        confetti: options?.confetti,
        duration: options?.duration,
        action: options?.action,
      });
    },

    // Direct access to store
    dismiss: useCelebrationStore((state) => state.dismiss),
    clearQueue: useCelebrationStore((state) => state.clearQueue),
  };
}
