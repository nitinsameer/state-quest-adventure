/**
 * Singleton AudioContext Manager
 * Provides a single, reusable Web Audio API context with error handling
 * Handles browser compatibility and iOS user gesture requirements
 */

let audioContext: AudioContext | null = null;
let contextInitialized = false;

/**
 * Get or create the global AudioContext
 * Handles browser compatibility (webkit prefix for older browsers)
 * @returns AudioContext instance or null if Web Audio API unavailable
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null; // SSR environment
  }

  if (audioContext) {
    return audioContext;
  }

  try {
    // Try standard AudioContext, fall back to webkit prefix
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("[AudioContext] Web Audio API not available");
      return null;
    }

    audioContext = new AudioContextClass();
    contextInitialized = true;

    console.log("[AudioContext] Created", {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate,
    });

    return audioContext;
  } catch (error) {
    console.error("[AudioContext] Failed to create:", error);
    return null;
  }
}

/**
 * Resume AudioContext (required for iOS and browser user gesture handling)
 * Safe to call multiple times - only resumes if suspended
 * @returns Promise that resolves when context is running
 */
export async function resumeAudioContext(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) {
    return false;
  }

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      console.log("[AudioContext] Resumed");
      return true;
    } catch (error) {
      console.error("[AudioContext] Failed to resume:", error);
      return false;
    }
  }

  return ctx.state === "running";
}

/**
 * Close and cleanup the AudioContext
 * Called on app unload to free resources
 */
export function closeAudioContext(): void {
  if (audioContext && audioContext.state !== "closed") {
    try {
      audioContext.close();
      console.log("[AudioContext] Closed");
    } catch (error) {
      console.error("[AudioContext] Error closing:", error);
    }
  }
  audioContext = null;
  contextInitialized = false;
}

/**
 * Check if AudioContext is initialized and running
 */
export function isAudioContextReady(): boolean {
  const ctx = getAudioContext();
  return ctx !== null && ctx.state === "running";
}

/**
 * Initialize cleanup on app unload
 * Should be called once during app startup
 */
export function initializeAudioContextCleanup(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeunload", () => {
    closeAudioContext();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Pause audio when page is hidden
      const ctx = getAudioContext();
      if (ctx && ctx.state === "running") {
        // Note: We don't suspend, just stop sounds via their own cleanup
      }
    }
  });
}
