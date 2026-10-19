import { useToastStore } from "@/store/toastStore";

export interface SuccessToastOptions {
  duration?: number;
  icon?: string;
  onDismiss?: () => void;
}

/**
 * Hook for showing success toasts within components
 */
export function useSuccessToast() {
  const show = useToastStore((s) => s.show);

  const showSuccessToast = (message: string, options?: SuccessToastOptions) => {
    show({
      type: "success",
      message,
      icon: options?.icon ?? "✓",
      duration: options?.duration ?? 2500,
    });

    // Handle onDismiss callback after toast completes
    if (options?.onDismiss) {
      setTimeout(options.onDismiss, (options?.duration ?? 2500) + 400);
    }
  };

  return { showSuccessToast };
}

/**
 * Standalone function for calling outside React components
 * Can be imported and called directly without a hook
 */
export function showSuccessToast(message: string, options?: SuccessToastOptions) {
  const state = useToastStore.getState();
  state.show({
    type: "success",
    message,
    icon: options?.icon ?? "✓",
    duration: options?.duration ?? 2500,
  });

  if (options?.onDismiss) {
    setTimeout(options.onDismiss, (options?.duration ?? 2500) + 400);
  }
}
