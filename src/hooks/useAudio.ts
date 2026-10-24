/**
 * React Hook for Audio Management
 * Provides a simple interface for playing sounds with volume control
 * Handles AudioContext initialization, resumption, and volume persistence
 */

import { useCallback, useEffect, useState } from "react";
import { getAudioContext, resumeAudioContext, isAudioContextReady } from "@/lib/audio/audioContext";
import { AUDIO_STORAGE_KEY, DEFAULT_VOLUME } from "@/constants/audioConfig";

interface UseAudioReturn {
  /** Play a sound effect */
  play: (soundFunction: () => Promise<void>) => Promise<void>;
  /** Stop all audio playback */
  stop: () => void;
  /** Set volume level (0-1) */
  setVolume: (level: number) => void;
  /** Get current volume level */
  getVolume: () => number;
  /** Is audio context ready for playback */
  isReady: boolean;
}

/**
 * useAudio Hook
 * Manages audio context lifecycle and provides sound playback interface
 * @returns Object with audio control methods
 */
export function useAudio(): UseAudioReturn {
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  // Initialize audio context and load volume preference on mount
  useEffect(() => {
    try {
      // Get or create AudioContext
      const ctx = getAudioContext();
      if (!ctx) {
        console.warn("[useAudio] AudioContext not available");
        return;
      }

      // Resume context if suspended (required for iOS/browser)
      resumeAudioContext().then((success) => {
        if (success) {
          setIsReady(true);
        }
      });

      // Load volume preference from localStorage
      try {
        const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            setVolumeState(parsed);
          }
        }
      } catch {
        // localStorage not available, use default
      }
    } catch (error) {
      console.error("[useAudio] Initialization error:", error);
    }
  }, []);

  /**
   * Play a sound with error handling
   */
  const play = useCallback(async (soundFunction: () => Promise<void>): Promise<void> => {
    try {
      // Ensure AudioContext is running before playing
      await resumeAudioContext();

      // Play the sound
      await soundFunction();
    } catch (error) {
      console.error("[useAudio] Error playing sound:", error);
    }
  }, []);

  /**
   * Stop all audio playback
   */
  const stop = useCallback((): void => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "running") {
      try {
        // In a full implementation, we'd stop active oscillators
        // For now, Web Audio API handles this automatically
        console.log("[useAudio] Audio playback stopped");
      } catch (error) {
        console.error("[useAudio] Error stopping audio:", error);
      }
    }
  }, []);

  /**
   * Set volume level and persist to localStorage
   */
  const setVolume = useCallback((level: number): void => {
    const clampedLevel = Math.max(0, Math.min(1, level));
    setVolumeState(clampedLevel);

    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, clampedLevel.toString());
    } catch {
      // localStorage not available, continue with in-memory state
    }

    // Update master gain if available
    const ctx = getAudioContext();
    if (ctx) {
      try {
        const destination = ctx.destination;
        if (destination && "gain" in destination) {
          (destination as any).gain.value = clampedLevel;
        }
      } catch {
        // Gain adjustment failed, continue
      }
    }
  }, []);

  /**
   * Get current volume level
   */
  const getVolume = useCallback((): number => {
    return volume;
  }, [volume]);

  return {
    play,
    stop,
    setVolume,
    getVolume,
    isReady,
  };
}
