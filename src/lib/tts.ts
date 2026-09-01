/**
 * Text-to-Speech service using Web Speech API
 * Kid-friendly voices, respects Sound & Vibration toggle
 */

import { isSoundOn } from "./fx";

export type TtsLanguage = "en-IN" | "hi-IN" | "en-US";

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
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isPlaying = false;
let currentNarrationId = "";
let ttsListeners = new Set<() => void>();

/**
 * Check if Web Speech API is available
 */
export function isTtsAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const synth =
    window.speechSynthesis ||
    (window as any).webkitSpeechSynthesis ||
    (window as any).mozSpeechSynthesis ||
    (window as any).msSpeechSynthesis;
  return !!synth;
}

/**
 * Get available voices (filters for child-friendly voices)
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !isTtsAvailable()) return [];

  const synth = window.speechSynthesis;
  if (!synth) return [];

  const voices = synth.getVoices();

  // Filter for female voices (generally sound more friendly for kids)
  // Prefer English Indian accent or US English
  const femaleVoices = voices.filter(
    (voice) =>
      voice.name.includes("Female") ||
      voice.name.includes("female") ||
      voice.name.includes("Google") ||
      voice.name.includes("Samantha")
  );

  // If we found female voices, return them
  if (femaleVoices.length > 0) {
    return femaleVoices;
  }

  // Fallback: return ANY voice if no female voices available
  // This ensures TTS always works even on limited devices
  if (voices.length > 0) {
    console.log("[TTS] No female voices found, using available voices as fallback");
    return voices;
  }

  return [];
}

/**
 * Get best voice for language
 */
export function getVoiceForLanguage(language: TtsLanguage): SpeechSynthesisVoice | null {
  if (!isTtsAvailable()) return null;

  const voices = getAvailableVoices();

  // Priority 1: Find language-specific female voice
  if (voices.length > 0) {
    let preferredVoice = voices.find((v) => v.lang.startsWith(language.split("-")[0]));
    if (preferredVoice) {
      console.log("[TTS] Using language-specific voice:", preferredVoice.name);
      return preferredVoice;
    }
  }

  // Priority 2: Use first available voice
  if (voices.length > 0) {
    console.log("[TTS] Using fallback voice:", voices[0].name);
    return voices[0];
  }

  // Priority 3: Use system default voice
  if (typeof window !== "undefined" && window.speechSynthesis) {
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length > 0) {
      console.log("[TTS] Using system default voice:", allVoices[0].name);
      return allVoices[0];
    }
  }

  // Last resort: No voice available
  console.warn("[TTS] No voices available on this device");
  return null;
}

/**
 * Play TTS narration
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

  if (!isTtsAvailable()) {
    console.warn("[TTS] Web Speech API not available");
    return;
  }

  const synth = window.speechSynthesis;
  if (!synth) return;

  // Stop current playback if any
  if (isPlaying) {
    stopTts();
  }

  const finalConfig = { ...DEFAULT_TTS_CONFIG, ...config };
  const voice = getVoiceForLanguage(finalConfig.language);

  // Create utterance
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = finalConfig.language;
  currentUtterance.rate = finalConfig.speed;
  currentUtterance.pitch = finalConfig.pitch;
  currentUtterance.volume = finalConfig.volume;

  if (voice) {
    currentUtterance.voice = voice;
  }

  // Event listeners
  currentUtterance.onstart = () => {
    isPlaying = true;
    currentNarrationId = narrationId;
    notifyListeners();
  };

  currentUtterance.onend = () => {
    isPlaying = false;
    currentNarrationId = "";
    notifyListeners();
  };

  currentUtterance.onerror = (event) => {
    console.error("[TTS] Speech synthesis error:", event.error);
    isPlaying = false;
    currentNarrationId = "";
    notifyListeners();
  };

  // Start speaking
  synth.cancel(); // Cancel any pending speech
  synth.speak(currentUtterance);
}

/**
 * Stop TTS playback
 */
export function stopTts(): void {
  if (typeof window === "undefined" || !isTtsAvailable()) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();
  isPlaying = false;
  currentNarrationId = "";
  currentUtterance = null;
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
  if (typeof window === "undefined" || !isTtsAvailable()) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  if (synth.paused) {
    // Already paused
    return;
  } else {
    synth.pause();
  }

  notifyListeners();
}

/**
 * Resume TTS playback
 */
export function resumeTts(): void {
  if (typeof window === "undefined" || !isTtsAvailable()) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  if (synth.paused) {
    synth.resume();
  }

  notifyListeners();
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

// Import React for the hook
import * as React from "react";

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
 * Initialize TTS (load voices when available)
 */
export function initTts(): void {
  if (!isTtsAvailable()) return;

  const synth = window.speechSynthesis;

  // Request voices to load
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
      const voices = synth.getVoices();
      console.log(`[TTS] Voices loaded: ${voices.length} voices available`);
    };
  }

  // Trigger initial voice load
  if (synth.getVoices().length === 0) {
    synth.getVoices();
  }
}

// Initialize on import
if (typeof window !== "undefined") {
  initTts();
}
