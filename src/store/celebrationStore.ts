import { create } from "zustand";

export type CelebrationPopupType = "success" | "error" | "info" | "achievement";

export interface CelebrationConfig {
  id: string;
  type: CelebrationPopupType;
  title: string;
  subtitle?: string;
  icon: string;
  confetti?: boolean;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  showCloseButton?: boolean;
}

interface CelebrationStore {
  queue: CelebrationConfig[];
  current: CelebrationConfig | null;

  // Show a celebration popup
  show: (config: Omit<CelebrationConfig, "id">) => void;

  // Dismiss current popup and show next in queue
  dismiss: () => void;

  // Clear all queued popups
  clearQueue: () => void;
}

export const useCelebrationStore = create<CelebrationStore>((set, get) => ({
  queue: [],
  current: null,

  show: (config) => {
    const id = `celebration-${Date.now()}-${Math.random()}`;
    const fullConfig: CelebrationConfig = {
      ...config,
      id,
      duration: config.duration ?? 3500,
    };

    set((state) => {
      // If no current popup, show immediately
      if (!state.current) {
        return { current: fullConfig, queue: [] };
      }
      // Otherwise queue it
      return { queue: [...state.queue, fullConfig] };
    });

    // Auto-dismiss after duration
    const timeout = setTimeout(() => {
      get().dismiss();
    }, fullConfig.duration);

    return () => clearTimeout(timeout);
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
