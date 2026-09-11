/**
 * Text-to-Speech service using @capacitor-community/text-to-speech
 * Kid-friendly, respects Sound & Vibration toggle
 * 
 * Uses maintained community plugin for reliable native TTS
 * Calls Android's system TTS engine directly through Capacitor bridge
 */

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { isSoundOn } from "./fx";
import { getStateLanguageCode } from "./state-content";
import * as React from "react";

export type TtsLanguage = "en-IN" | "hi-IN" | "en-US" | "te-IN" | "ta-IN" | "gu-IN" | "mr-IN" | "kn-IN" | "ml-IN" | "or-IN" | "bn-IN" | "pa-IN";

export interface TtsConfig {
  language: TtsLanguage;
  speed: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
  volume: number; // 0 to 1
}

export const DEFAULT_TTS_CONFIG: TtsConfig = {
  language: "en-IN",
  speed: 0.85, // Slightly slower for kids
  pitch: 1.05, // Slightly higher (more friendly)
  volume: 1,
};

// Global TTS state
let isPlaying = false;
let currentNarrationId = "";
let ttsListeners = new Set<() => void>();

/**
 * Check if TTS is available
 */
export function isTtsAvailable(): boolean {
  return true;
}

/**
 * Play TTS narration using native TextToSpeech plugin
 */
export function playTts(
  narrationId: string,
  text: string,
  config: Partial<TtsConfig> = {}
): void {
  // Check if sound is enabled
  if (!isSoundOn()) {
    console.log("[TTS] Sound is muted - skipping narration");
    return;
  }

  if (!text || text.trim().length === 0) {
    console.warn("[TTS] Empty text provided");
    return;
  }

  const finalConfig = { ...DEFAULT_TTS_CONFIG, ...config };

  // Convert language code: "en-IN" → "en", "hi-IN" → "hi", etc.
  const langCode = finalConfig.language.split("-")[0];

  playTtsNative(narrationId, text, finalConfig, langCode);
}

/**
 * Play TTS narration using the state's native language
 * Automatically selects the appropriate language for the given state
 * Falls back to English if language code is not available
 * 
 * @param narrationId - Unique identifier for this narration (e.g., "andhra_capital_2024")
 * @param stateName - Name of the state (e.g., "Andhra Pradesh", "Rajasthan")
 * @param text - Text to narrate in the state's native language
 * @param config - Optional TTS configuration (speed, pitch, volume)
 * @param overrideLanguage - Optional language override (e.g., "en", "te") - if provided, uses this instead of state's native language
 */
export function playStateNarration(
  narrationId: string,
  stateName: string,
  text: string,
  config: Partial<TtsConfig> = {},
  overrideLanguage?: string
): void {
  // Use override language if provided, otherwise get the state's native language code
  const languageCode = overrideLanguage ?? getStateLanguageCode(stateName);
  
  // Convert to full TTS language code (e.g., "te" → "te-IN")
  const ttsLanguageCode = `${languageCode}-IN` as TtsLanguage;
  
  console.log("[TTS] Playing state narration:", {
    stateName,
    languageCode,
    ttsLanguageCode,
    narrationId,
    overrideLanguage,
  });
  
  // Play with the state-specific language
  playTts(narrationId, text, { ...config, language: ttsLanguageCode });
}

/**
 * Play TTS using native Capacitor community plugin
 * Calls Android's system TTS engine directly
 */
async function playTtsNative(
  narrationId: string,
  text: string,
  config: TtsConfig,
  langCode: string
): Promise<void> {
  try {
    isPlaying = true;
    currentNarrationId = narrationId;
    notifyListeners();

    console.log("[TTS] Starting native playback:", {
      narrationId,
      textLength: text.length,
      language: config.language,
      langCode,
      rate: config.speed,
      pitch: config.pitch,
      volume: config.volume,
    });

    // Call native TextToSpeech plugin
    // Note: lang parameter uses ISO 639-1 codes (e.g., "en", "hi")
    await TextToSpeech.speak({
      text: text,
      lang: langCode,
      rate: config.speed,
      pitch: config.pitch,
      volume: config.volume,
      category: "ambient",
    });

    console.log("[TTS] Native playback completed");
    isPlaying = false;
    currentNarrationId = "";
    notifyListeners();
  } catch (error) {
    console.error("[TTS] Native playback error:", error);
    isPlaying = false;
    currentNarrationId = "";
    notifyListeners();
  }
}

/**
 * Stop TTS playback
 */
export function stopTts(): void {
  try {
    TextToSpeech.stop();
  } catch (error) {
    console.error("[TTS] Stop error:", error);
  }

  isPlaying = false;
  currentNarrationId = "";
  notifyListeners();
}

/**
 * Check if TTS is currently playing
 */
export function isTtsPlaying(): boolean {
  return isPlaying;
}

/**
 * Get current narration ID being played
 */
export function getCurrentNarrationId(): string {
  return currentNarrationId;
}

/**
 * Pause TTS playback
 */
export function pauseTts(): void {
  try {
    TextToSpeech.stop();
  } catch (error) {
    console.error("[TTS] Pause error:", error);
  }
}

/**
 * Resume TTS playback
 */
export function resumeTts(): void {
  console.log("[TTS] Resume not supported in native TTS");
}

/**
 * Subscribe to TTS state changes
 */
export function subscribeTts(listener: () => void): () => void {
  ttsListeners.add(listener);
  return () => ttsListeners.delete(listener);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(): void {
  for (const listener of ttsListeners) {
    listener();
  }
}

/**
 * Hook: React hook for TTS state
 */
export function useTtsState(): {
  isPlaying: boolean;
  narrationId: string;
} {
  const [state, setState] = React.useState(() => ({
    isPlaying: isPlaying,
    narrationId: currentNarrationId,
  }));

  React.useEffect(() => {
    const unsubscribe = subscribeTts(() => {
      setState({
        isPlaying: isTtsPlaying(),
        narrationId: getCurrentNarrationId(),
      });
    });

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Initialize TTS
 */
export function initTts(): void {
  console.log("[TTS] Native TextToSpeech plugin initialized");
}

// Initialize on import
if (typeof window !== "undefined") {
  initTts();
}
