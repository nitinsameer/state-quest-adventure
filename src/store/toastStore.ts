import { create } from "zustand";

export type ToastType = "error" | "info" | "success" | "warning";

export interface ToastConfig {
  id: string;
  type: ToastType;
  message: string;
  subtitle?: string;
  icon: string;
  duration?: number;
}

interface ToastStore {
  queue: ToastConfig[];
  current: ToastConfig | null;

  // Show a toast notification
  show: (config: Omit<ToastConfig, "id">) => void;

  // Dismiss current toast and show next in queue
  dismiss: () => void;

  // Clear all queued toasts
  clearQueue: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  queue: [],
  current: null,

  show: (config) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const fullConfig: ToastConfig = {
      ...config,
      id,
      duration: config.duration ?? 3500,
    };

    set((state) => {
      // If no current toast, show immediately
      if (!state.current) {
        return { current: fullConfig, queue: [] };
      }
      // Otherwise queue it
      return { queue: [...state.queue, fullConfig] };
    });
  },

  dismiss: () => {
    set((state) => {
      const next = state.queue[0];
      const remaining = state.queue.slice(1);
      return {
        current: next || null,
        queue: remaining,
      };
    });
  },

  clearQueue: () => {
    set({ queue: [], current: null });
  },
}));
